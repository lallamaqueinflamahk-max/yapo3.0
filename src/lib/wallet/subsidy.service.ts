/**
 * Servicio de Subsidios Wallet (políticas públicas digitales).
 * Flujo: creación (Mbareté/gobierno) → asignación (usuario acepta) → validación por escudos → acreditación en balance protegido.
 * Reglas: no transferibles; totalmente auditables. Listo para gobierno.
 */

import { createWallet, getWallet, credit, applyLock } from "./ledger";
import { validateTransaction } from "./wallet.escudos";
import type { Escudo, EscudoValidationContext } from "./wallet.escudos";
import type {
  Subsidy,
  SubsidySource,
  SubsidyStatus,
  SubsidyConditions,
  SubsidyAcceptance,
} from "./subsidy.types";
import type { RoleId } from "@/lib/auth";

/** Wallet origen ficticio para contexto de validación de escudos (subsidy). */
const SUBSIDY_SYSTEM_WALLET = "subsidy-system";

const subsidies = new Map<string, Subsidy>();
const acceptances = new Map<string, SubsidyAcceptance>();
const acceptancesByUser = new Map<string, string[]>();
const acceptancesBySubsidy = new Map<string, string[]>();

let seeded = false;

function nextSubsidyId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Crea subsidios de ejemplo para desarrollo/demo (solo si no hay ninguno). */
function seedSubsidiesIfEmpty(): void {
  if (seeded || subsidies.size > 0) return;
  seeded = true;
  const now = Date.now();
  const gov: Subsidy = {
    id: "sub-demo-gov-1",
    source: "government",
    targetRole: ["vale", "capeto", "kavaju"],
    amount: 150_000,
    conditions: {
      requiredBiometricLevel: 1,
      description: "Subsidio laboral; un solo uso por persona.",
    },
    escudosRequeridos: [],
    status: "available",
    name: "Subsidio laboral Valé/Capeto/Kavaju",
    description: "Apoyo único para trabajadores registrados.",
    createdAt: now,
    updatedAt: now,
    createdBy: "sistema",
  };
  subsidies.set(gov.id, gov);
  const ent: Subsidy = {
    id: "sub-demo-ent-1",
    source: "enterprise",
    targetRole: ["mbarete", "kavaju"],
    amount: 80_000,
    conditions: {
      requiredBiometricLevel: 0,
      description: "Bono empresa para Mbareté/Kavaju.",
    },
    escudosRequeridos: [],
    status: "available",
    name: "Bono empresa",
    description: "Beneficio para gestores y coordinadores.",
    createdAt: now,
    updatedAt: now,
    createdBy: "sistema",
  };
  subsidies.set(ent.id, ent);
}

function nextAcceptanceId(): string {
  return `acc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface CreateSubsidyInput {
  source: SubsidySource;
  targetRole: RoleId[];
  amount: number;
  conditions: SubsidyConditions;
  escudosRequeridos: string[];
  name?: string;
  description?: string;
  /** ID de programa público (gobierno). Para auditoría. */
  programId?: string;
  createdBy?: string;
}

export interface CreateSubsidyResult {
  success: boolean;
  subsidy?: Subsidy;
  error?: string;
}

/**
 * Crea un subsidio. Solo Mbareté (o Gobierno futuro); el caller debe validar rol.
 */
export function createSubsidy(input: CreateSubsidyInput): CreateSubsidyResult {
  const {
    source,
    targetRole,
    amount,
    conditions,
    escudosRequeridos,
    name,
    description,
    createdBy,
  } = input;

  if (!targetRole?.length) {
    return { success: false, error: "targetRole es requerido." };
  }
  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "amount debe ser un número positivo." };
  }

  const id = nextSubsidyId();
  const now = Date.now();
  const subsidy: Subsidy = {
    id,
    source,
    targetRole,
    amount,
    conditions,
    escudosRequeridos,
    status: "available",
    name: name ?? `Subsidio ${source}`,
    description,
    programId,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
  subsidies.set(id, subsidy);
  return { success: true, subsidy };
}

export function getSubsidy(subsidyId: string): Subsidy | null {
  return subsidies.get(subsidyId) ?? null;
}

export function listSubsidies(options?: {
  status?: SubsidyStatus;
  targetRole?: RoleId;
  source?: SubsidySource;
}): Subsidy[] {
  seedSubsidiesIfEmpty();
  let list = Array.from(subsidies.values());
  if (options?.status) {
    list = list.filter((s) => s.status === options.status);
  }
  if (options?.targetRole) {
    list = list.filter((s) => s.targetRole.includes(options.targetRole!));
  }
  if (options?.source) {
    list = list.filter((s) => s.source === options.source);
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Subsidios disponibles para un rol (status available y targetRole incluye el rol).
 */
export function listAvailableSubsidies(targetRole: RoleId): Subsidy[] {
  return listSubsidies({ status: "available", targetRole });
}

export interface ValidateEligibilityResult {
  eligible: boolean;
  reason?: string;
  requiresValidation?: boolean;
}

/**
 * Valida elegibilidad sin aceptar (para UI / pre-check).
 * Misma lógica que acceptSubsidy pero sin acreditar ni registrar.
 */
export function validateSubsidyEligibility(
  subsidyId: string,
  ctx: AcceptSubsidyContext
): ValidateEligibilityResult {
  const subsidy = getSubsidy(subsidyId);
  if (!subsidy) return { eligible: false, reason: "Subsidio no encontrado." };
  if (subsidy.status !== "available") {
    return { eligible: false, reason: `No disponible (estado: ${subsidy.status}).` };
  }
  const { userRoles, userBiometricLevel, location, escudos } = ctx;
  if (!subsidy.targetRole.some((r) => userRoles.includes(r))) {
    return { eligible: false, reason: "Tu rol no está incluido en los destinatarios." };
  }
  const cond = subsidy.conditions;
  if (cond.requiredBiometricLevel != null) {
    const level = userBiometricLevel ?? 0;
    if (level < cond.requiredBiometricLevel) {
      return {
        eligible: false,
        reason: `Se requiere biometría nivel ${cond.requiredBiometricLevel} o superior.`,
        requiresValidation: true,
      };
    }
  }
  if (subsidy.escudosRequeridos?.length > 0 && escudos?.length) {
    const escudoContext: EscudoValidationContext = {
      transaction: {
        amount: subsidy.amount,
        fromWalletId: SUBSIDY_SYSTEM_WALLET,
        toWalletId: ctx.userId,
        type: "subsidy",
      },
      userBiometricLevel,
      location,
      userRoles,
    };
    const validation = validateTransaction(escudos, escudoContext);
    if (!validation.allowed) {
      return {
        eligible: false,
        reason: validation.reason ?? "No se cumplen los escudos requeridos.",
        requiresValidation: validation.requiredBiometricLevel != null,
      };
    }
    if (validation.requiredBiometricLevel != null) {
      return {
        eligible: false,
        reason: validation.reason ?? "Se requiere validación biométrica.",
        requiresValidation: true,
      };
    }
  }
  return { eligible: true };
}

export interface AcceptSubsidyContext {
  userId: string;
  userRoles: RoleId[];
  userBiometricLevel?: number;
  location?: { lat: number; lng: number };
  /** Escudos activos del usuario (para validar escudosRequeridos). */
  escudos?: Escudo[];
}

export interface AcceptSubsidyResult {
  success: boolean;
  acceptance?: SubsidyAcceptance;
  error?: string;
  requiresValidation?: boolean;
}

/**
 * Acepta un subsidio: valida condiciones y escudos, acredita en balance protegido.
 * Subsidios no son transferibles; solo se liberan bajo condiciones.
 */
export function acceptSubsidy(
  subsidyId: string,
  ctx: AcceptSubsidyContext
): AcceptSubsidyResult {
  const subsidy = getSubsidy(subsidyId);
  if (!subsidy) {
    return { success: false, error: "Subsidio no encontrado." };
  }
  if (subsidy.status !== "available") {
    return { success: false, error: `El subsidio no está disponible (estado: ${subsidy.status}).` };
  }

  const { userId, userRoles, userBiometricLevel, location, escudos } = ctx;

  if (!subsidy.targetRole.some((r) => userRoles.includes(r))) {
    return { success: false, error: "Tu rol no está incluido en los destinatarios del subsidio." };
  }

  const cond = subsidy.conditions;
  if (cond.requiredBiometricLevel != null) {
    const level = userBiometricLevel ?? 0;
    if (level < cond.requiredBiometricLevel) {
      return {
        success: false,
        error: `Se requiere nivel de biometría ${cond.requiredBiometricLevel} o superior.`,
        requiresValidation: true,
      };
    }
  }

  if (subsidy.escudosRequeridos?.length > 0 && escudos?.length) {
    const escudoContext: EscudoValidationContext = {
      transaction: {
        amount: subsidy.amount,
        fromWalletId: SUBSIDY_SYSTEM_WALLET,
        toWalletId: userId,
        type: "subsidy",
      },
      userBiometricLevel,
      location,
      userRoles,
    };
    const validation = validateTransaction(escudos, escudoContext);
    if (!validation.allowed) {
      return {
        success: false,
        error: validation.reason ?? "No se cumplen los escudos requeridos.",
        requiresValidation: validation.requiredBiometricLevel != null,
      };
    }
    if (validation.requiredBiometricLevel != null) {
      return {
        success: false,
        error: validation.reason ?? "Se requiere validación biométrica.",
        requiresValidation: true,
      };
    }
  }

  // Acreditación en balance protegido: credit + applyLock. No transferibles; auditable.
  try {
    createWallet(userId);
    credit(userId, subsidy.amount);
    applyLock(userId, subsidy.amount);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al acreditar el subsidio.",
    };
  }

  const acceptanceId = nextAcceptanceId();
  const now = Date.now();
  const acceptance: SubsidyAcceptance = {
    id: acceptanceId,
    subsidyId,
    userId,
    amount: subsidy.amount,
    creditedToProtegido: true,
    createdAt: now,
    conditionsSnapshot: { ...subsidy.conditions },
  };
  acceptances.set(acceptanceId, acceptance);
  const userList = acceptancesByUser.get(userId) ?? [];
  userList.push(acceptanceId);
  acceptancesByUser.set(userId, userList);
  const subList = acceptancesBySubsidy.get(subsidyId) ?? [];
  subList.push(acceptanceId);
  acceptancesBySubsidy.set(subsidyId, subList);

  // Subsidio sigue "available": varios usuarios pueden aceptar el mismo programa.
  subsidy.updatedAt = now;
  subsidies.set(subsidyId, subsidy);

  return { success: true, acceptance };
}

export function getAcceptance(acceptanceId: string): SubsidyAcceptance | null {
  return acceptances.get(acceptanceId) ?? null;
}

/**
 * Aceptaciones por usuario (auditoría).
 */
export function getAcceptancesByUser(userId: string): SubsidyAcceptance[] {
  const ids = acceptancesByUser.get(userId) ?? [];
  return ids
    .map((id) => acceptances.get(id))
    .filter((a): a is SubsidyAcceptance => a != null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Aceptaciones por subsidio (auditoría).
 */
export function getAcceptancesBySubsidy(subsidyId: string): SubsidyAcceptance[] {
  const ids = acceptancesBySubsidy.get(subsidyId) ?? [];
  return ids
    .map((id) => acceptances.get(id))
    .filter((a): a is SubsidyAcceptance => a != null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Aceptaciones en un rango de tiempo (auditoría para gobierno).
 */
export function getAcceptancesForAudit(options?: {
  since?: number;
  until?: number;
  subsidyId?: string;
  userId?: string;
}): SubsidyAcceptance[] {
  let list = Array.from(acceptances.values());
  if (options?.since != null) {
    list = list.filter((a) => a.createdAt >= options.since!);
  }
  if (options?.until != null) {
    list = list.filter((a) => a.createdAt <= options.until!);
  }
  if (options?.subsidyId) {
    list = list.filter((a) => a.subsidyId === options.subsidyId);
  }
  if (options?.userId) {
    list = list.filter((a) => a.userId === options.userId);
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}
