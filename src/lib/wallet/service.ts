/**
 * Servicio Wallet YAPÓ — lógica real.
 * requestTransfer → pending; holdTransaction → held; releaseTransaction (solo con Cerebro) → released; blockTransaction → blocked.
 * getBalance, lock, unlock (escudos). transferWithGuard: guard + Cerebro → requiere CerebroResult.requiresValidation.
 * Nunca modificar balance directamente; solo vía ledger.recordTransaction o ledger.applyLock/applyUnlock.
 * Sin UI. Preparado para producción futura.
 */

import { decide } from "@/lib/cerebro";
import type { RoleId } from "@/lib/cerebro";
import {
  createWallet,
  getWallet,
  getTransaction,
  recordTransaction,
  applyLock,
  applyUnlock,
} from "./ledger";
import type { Transaction, Balance } from "./types";
import { walletGuard, type WalletGuardContext, type WalletGuardResult } from "./wallet.guard";
import { WALLET_ACTIONS } from "./permissions";

const ORIGIN_WALLET = "wallet-service";

function nextTxId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface RequestTransferResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Solicita una transferencia. Crea la transacción en estado pending (no modifica balances).
 */
export function requestTransfer(
  from: string,
  to: string,
  amount: number
): RequestTransferResult {
  if (!from?.trim() || !to?.trim()) {
    return { success: false, error: "Usuario origen o destino inválido." };
  }
  if (from === to) {
    return { success: false, error: "Origen y destino no pueden ser iguales." };
  }
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "Monto debe ser un número positivo." };
  }

  createWallet(from);
  createWallet(to);

  const tx: Transaction = {
    id: nextTxId(),
    from,
    to,
    amount,
    status: "pending",
    createdAt: Date.now(),
  };

  recordTransaction(tx);
  return { success: true, transaction: getTransaction(tx.id) ?? tx };
}

export interface HoldTransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Pasa la transacción a held (debita del origen, aumenta heldBalance).
 * TODA transferencia entra como held; esta función aplica el hold.
 */
export function holdTransaction(txId: string): HoldTransactionResult {
  const tx = getTransaction(txId);
  if (!tx) return { success: false, error: "Transacción no encontrada." };
  if (tx.status !== "pending") {
    return {
      success: false,
      error: `Solo se puede hacer hold de una transacción en pending (actual: ${tx.status}).`,
    };
  }

  const updated: Transaction = { ...tx, status: "held" };
  try {
    recordTransaction(updated);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar hold.",
    };
  }
  return { success: true, transaction: getTransaction(txId) ?? updated };
}

export interface ReleaseTransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Libera la transacción (acredita al destino, reduce held del origen).
 * Solo el Cerebro puede autorizar release; se llama a decide() antes de aplicar.
 */
export function releaseTransaction(
  txId: string,
  userId: string,
  roles: RoleId[]
): ReleaseTransactionResult {
  const tx = getTransaction(txId);
  if (!tx) return { success: false, error: "Transacción no encontrada." };
  if (tx.status !== "held") {
    return {
      success: false,
      error: `Solo se puede liberar una transacción en held (actual: ${tx.status}).`,
    };
  }

  const decision = decide({
    userId,
    roles,
    action: "release_payment",
    origin: ORIGIN_WALLET,
    amount: tx.amount,
  });

  if (!decision.authorized) {
    return {
      success: false,
      error: decision.reason ?? "Cerebro no autorizó el release.",
    };
  }

  const updated: Transaction = { ...tx, status: "released" };
  try {
    recordTransaction(updated);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar release.",
    };
  }
  return { success: true, transaction: getTransaction(txId) ?? updated };
}

export interface BlockTransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Bloquea la transacción (devuelve held al balance del origen).
 */
export function blockTransaction(txId: string): BlockTransactionResult {
  const tx = getTransaction(txId);
  if (!tx) return { success: false, error: "Transacción no encontrada." };
  if (tx.status !== "pending" && tx.status !== "held") {
    return {
      success: false,
      error: `Solo se puede bloquear una transacción en pending o held (actual: ${tx.status}).`,
    };
  }

  const updated: Transaction = { ...tx, status: "blocked" };
  try {
    recordTransaction(updated);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar block.",
    };
  }
  return { success: true, transaction: getTransaction(txId) ?? updated };
}

/**
 * Devuelve el balance del usuario: disponible (para gastar) y protegido (bajo escudos).
 */
export function getBalance(userId: string): Balance | null {
  createWallet(userId);
  const w = getWallet(userId);
  if (!w) return null;
  return {
    balanceDisponible: w.balance,
    balanceProtegido: w.balanceProtegido ?? 0,
  };
}

/**
 * Lock: mueve amount de balance a balanceProtegido (escudos). No ejecuta si fondos insuficientes.
 */
export function lock(userId: string, amount: number): { success: boolean; error?: string } {
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "Monto debe ser un número positivo." };
  }
  try {
    createWallet(userId);
    applyLock(userId, amount);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar lock.",
    };
  }
}

/**
 * Unlock: mueve amount de balanceProtegido a balance.
 */
export function unlock(userId: string, amount: number): { success: boolean; error?: string } {
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "Monto debe ser un número positivo." };
  }
  try {
    applyUnlock(userId, amount);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar unlock.",
    };
  }
}

/** Resultado de transferencia protegida: compatible con CerebroResult (requiresValidation, message). */
export type TransferWithGuardResult = {
  allowed: boolean;
  message: string;
  requiresValidation?: boolean;
  transaction?: Transaction;
};

/**
 * Flujo de transferencia protegida: guard (biometría, rol, escudos) + Cerebro.
 * Si el guard falla o un escudo bloquea → NO ejecuta; devuelve allowed: false.
 * Si requiresValidation → devuelve requiresValidation: true; el caller debe validar (ej. biometría) y luego llamar requestTransfer + hold.
 * Si allowed y !requiresValidation → ejecuta requestTransfer + hold y devuelve transaction.
 *
 * Ejemplo de flujo protegido:
 * 1. transferWithGuard(from, to, amount, { identity, userIdentity, location })
 * 2. Si result.requiresValidation === true → UI pide biometría/confirmación; luego requestTransfer + holdTransaction(tx.id)
 * 3. Si result.allowed && result.transaction → liberar con releaseTransaction(tx.id, userId, roles) cuando corresponda
 * 4. Si !result.allowed → mostrar result.message; NO ejecutar
 */
export function transferWithGuard(
  fromUserId: string,
  toUserId: string,
  amount: number,
  ctx: Omit<WalletGuardContext, "userId" | "action" | "amount" | "toUserId"> & {
    identity: { userId: string; roles: RoleId[]; verified?: boolean } | null;
  }
): TransferWithGuardResult {
  const guardCtx: WalletGuardContext = {
    userId: fromUserId,
    action: WALLET_ACTIONS.transfer,
    amount,
    toUserId,
    ...ctx,
  };

  const guardResult: WalletGuardResult = walletGuard(guardCtx);
  if (!guardResult.allowed) {
    return {
      allowed: false,
      message: guardResult.reason ?? "Transferencia no permitida.",
      requiresValidation: guardResult.requiresValidation,
    };
  }

  if (guardResult.requiresValidation) {
    return {
      allowed: true,
      message: guardResult.reason ?? "Se requiere validación adicional (ej. biometría) para completar la transferencia.",
      requiresValidation: true,
    };
  }

  const decision = decide({
    userId: ctx.identity?.userId ?? fromUserId,
    roles: ctx.identity?.roles ?? [],
    action: "release_payment",
    origin: ORIGIN_WALLET,
    amount,
  });

  if (!decision.authorized) {
    return {
      allowed: false,
      message: decision.reason ?? "Cerebro no autorizó la transferencia.",
    };
  }

  const req = requestTransfer(fromUserId, toUserId, amount);
  if (!req.success || !req.transaction) {
    return {
      allowed: false,
      message: req.error ?? "Error al crear la transferencia.",
    };
  }

  const hold = holdTransaction(req.transaction.id);
  if (!hold.success) {
    return {
      allowed: false,
      message: hold.error ?? "Error al aplicar el hold.",
    };
  }

  return {
    allowed: true,
    message: "Transferencia en hold. Liberar con releaseTransaction tras validación si aplica.",
    transaction: hold.transaction,
  };
}

export { getWallet, getTransaction };
export { getTransactions } from "./ledger";
