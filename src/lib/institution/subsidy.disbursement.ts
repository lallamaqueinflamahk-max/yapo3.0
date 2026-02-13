/**
 * Desembolso institucional: depositar fondos en wallets y bloquear uso indebido.
 * Toda transferencia pasa por elegibilidad; el Cerebro decide si califica.
 */

import type { Program, DisbursementRecord } from "./institution.types";
import { getProgram, addSpentAmount } from "./subsidy.program";
import { checkEligibility, type EligibilityContext } from "./subsidy.eligibility";
import { createWallet, getWallet, credit } from "@/lib/wallet/ledger";

const disbursements = new Map<string, DisbursementRecord>();

function nextDisbursementId(): string {
  return `dis-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type DisbursementInput = {
  programId: string;
  userId: string;
  amount: number;
  context: EligibilityContext;
};

export type DisbursementResult = {
  success: boolean;
  disbursement?: DisbursementRecord;
  reason?: string;
  requiresVerification?: boolean;
};

/**
 * Evalúa elegibilidad y, si califica, deposita fondos en la wallet del usuario.
 * Si el programa tiene blockMisuse, registra el desembolso para auditoría (bloqueo de uso indebido).
 */
export function disburse(input: DisbursementInput): DisbursementResult {
  const { programId, userId, amount, context } = input;

  const program = getProgram(programId);
  if (!program) {
    return { success: false, reason: "Programa no encontrado." };
  }

  if (program.status !== "active") {
    return {
      success: false,
      reason:
        program.status === "paused"
          ? "El programa está pausado."
          : "El programa está cerrado.",
    };
  }

  const eligibility = checkEligibility(programId, context);
  if (!eligibility.qualified) {
    return {
      success: false,
      reason: eligibility.reason,
      requiresVerification: eligibility.requiresVerification,
    };
  }

  if (eligibility.requiresVerification) {
    return {
      success: false,
      reason: eligibility.reason,
      requiresVerification: true,
    };
  }

  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, reason: "Monto inválido." };
  }

  const rules = program.disbursementRules;
  if (amount > (rules.maxAmountPerDisbursement ?? rules.maxAmountPerUser)) {
    return {
      success: false,
      reason: `El monto supera el máximo permitido por desembolso (${rules.maxAmountPerDisbursement ?? rules.maxAmountPerUser}).`,
    };
  }

  const totalBudget = program.totalBudget ?? Infinity;
  const spent = program.spentAmount ?? 0;
  if (spent + amount > totalBudget) {
    return {
      success: false,
      reason: "El programa no tiene presupuesto disponible para este monto.",
    };
  }

  try {
    createWallet(userId);
    credit(userId, amount);
    addSpentAmount(programId, amount);
  } catch (e) {
    return {
      success: false,
      reason: e instanceof Error ? e.message : "Error al acreditar fondos.",
    };
  }

  const record: DisbursementRecord = {
    id: nextDisbursementId(),
    programId,
    userId,
    amount,
    status: "completed",
    blockMisuse: rules.blockMisuse ?? false,
    createdAt: Date.now(),
    metadata: { institutionId: program.institutionId },
  };
  disbursements.set(record.id, record);

  return {
    success: true,
    disbursement: record,
  };
}

/**
 * Obtiene un desembolso por ID.
 */
export function getDisbursement(disbursementId: string): DisbursementRecord | null {
  return disbursements.get(disbursementId) ?? null;
}

/**
 * Lista desembolsos (por programa o por usuario).
 */
export function listDisbursements(options?: {
  programId?: string;
  userId?: string;
}): DisbursementRecord[] {
  let list = Array.from(disbursements.values());
  if (options?.programId) {
    list = list.filter((d) => d.programId === options.programId);
  }
  if (options?.userId) {
    list = list.filter((d) => d.userId === options.userId);
  }
  return list;
}
