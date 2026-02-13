/**
 * Servicio Wallet YAPÓ — lógica real, tipos canónicos.
 * Toda modificación de saldo pasa por Transaction; applyTransaction solo se ejecuta si wallet.guard lo permite.
 * Sin UI. Sin OpenAI. Auditable y predecible.
 */

import {
  createWallet as ledgerCreateWallet,
  getWallet as ledgerGetWallet,
  getTransaction as ledgerGetTransaction,
  recordTransaction as ledgerRecordTransaction,
} from "./ledger";
import { walletGuard, type WalletGuardContext, type WalletGuardResult } from "./wallet.guard";
import { WALLET_ACTIONS } from "./permissions";
import type {
  WalletId,
  TransactionId,
  Wallet,
  Transaction,
  TransactionType,
  TransactionStatus as CanonicalStatus,
  Balance,
  WalletEstado,
} from "./wallet.types";
import type { Transaction as LegacyTx } from "./types";

// -----------------------------------------------------------------------------
// Estado de bloqueo (estado "locked" por motivo; no modifica balance)
// -----------------------------------------------------------------------------

const lockedWallets = new Map<WalletId, { reason: string }>();

// -----------------------------------------------------------------------------
// Helpers: mapeo canonical ↔ ledger
// -----------------------------------------------------------------------------

function legacyStatusToCanonical(legacy: LegacyTx["status"]): CanonicalStatus {
  switch (legacy) {
    case "released":
      return "completed";
    case "blocked":
      return "blocked";
    case "held":
    case "pending":
    default:
      return "pending";
  }
}

function legacyTxToCanonical(legacy: LegacyTx): Transaction {
  return {
    id: legacy.id,
    fromWalletId: legacy.from,
    toWalletId: legacy.to,
    amount: legacy.amount,
    type: "transfer",
    status: legacyStatusToCanonical(legacy.status),
    createdAt: legacy.createdAt,
  };
}

function nextTxId(): TransactionId {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// -----------------------------------------------------------------------------
// API pública
// -----------------------------------------------------------------------------

/**
 * Obtiene la wallet del usuario (modelo canónico). Si no existe, devuelve null.
 * Estado "locked" se resuelve desde lockedWallets; no modifica balance.
 */
export function getWalletByUser(userId: string): Wallet | null {
  const id = (userId ?? "").toString().trim();
  if (!id) return null;
  const w = ledgerGetWallet(id);
  if (!w) return null;

  const estado: WalletEstado = lockedWallets.has(id) ? "locked" : "active";
  const now = Date.now();
  return {
    id: id as WalletId,
    ownerUserId: id,
    balanceDisponible: w.balance,
    balanceProtegido: w.balanceProtegido ?? 0,
    escudosActivos: (w.escudosActivos ?? []).map((e) => e.id),
    limites: { diario: 0, mensual: 0 },
    estado,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Devuelve el balance de una wallet (por id). walletId = userId (1:1).
 */
export function getBalance(walletId: WalletId): Balance | null {
  const w = ledgerGetWallet(walletId);
  if (!w) return null;
  const disponible = w.balance;
  const protegido = w.balanceProtegido ?? 0;
  return {
    total: disponible + protegido,
    disponible,
    protegido,
  };
}

export interface CreateTransactionInput {
  fromWalletId: WalletId;
  toWalletId: WalletId;
  amount: number;
  type?: TransactionType;
}

export interface CreateTransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Crea una transacción en estado pending. No modifica balances.
 */
export function createTransaction(input: CreateTransactionInput): CreateTransactionResult {
  const { fromWalletId, toWalletId, amount, type = "transfer" } = input;
  if (!fromWalletId?.trim() || !toWalletId?.trim()) {
    return { success: false, error: "fromWalletId y toWalletId son requeridos." };
  }
  if (fromWalletId === toWalletId) {
    return { success: false, error: "Origen y destino no pueden ser iguales." };
  }
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "amount debe ser un número positivo." };
  }

  ledgerCreateWallet(fromWalletId);
  ledgerCreateWallet(toWalletId);

  const tx: Transaction = {
    id: nextTxId(),
    fromWalletId,
    toWalletId,
    amount,
    type,
    status: "pending",
    createdAt: Date.now(),
  };

  const legacy: LegacyTx = {
    id: tx.id,
    from: tx.fromWalletId,
    to: tx.toWalletId,
    amount: tx.amount,
    status: "pending",
    createdAt: tx.createdAt,
  };
  ledgerRecordTransaction(legacy);
  return { success: true, transaction: tx };
}

export interface ApplyTransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

/**
 * Aplica la transacción (hold o release) SOLO si wallet.guard lo permite.
 * No modifica balance directo; todo pasa por recordTransaction en el ledger.
 */
export function applyTransaction(
  transaction: Transaction,
  ctx: WalletGuardContext
): ApplyTransactionResult {
  const legacy = ledgerGetTransaction(transaction.id);
  if (!legacy) {
    return { success: false, error: "Transacción no encontrada." };
  }
  if (lockedWallets.has(transaction.fromWalletId) || lockedWallets.has(transaction.toWalletId)) {
    return { success: false, error: "Una wallet involucrada está bloqueada." };
  }

  const guardCtx: WalletGuardContext = {
    ...ctx,
    userId: ctx.userId ?? transaction.fromWalletId,
    action: WALLET_ACTIONS.transfer,
    amount: transaction.amount,
    toUserId: transaction.toWalletId,
  };
  const guardResult: WalletGuardResult = walletGuard(guardCtx);
  if (!guardResult.allowed) {
    return {
      success: false,
      error: guardResult.reason ?? "El guard no permite aplicar esta transacción.",
    };
  }

  try {
    if (legacy.status === "pending") {
      ledgerRecordTransaction({
        ...legacy,
        status: "held",
      });
    } else if (legacy.status === "held") {
      ledgerRecordTransaction({
        ...legacy,
        status: "released",
      });
    } else {
      return {
        success: false,
        error: `No se puede aplicar: estado actual ${legacy.status}. Solo pending → held o held → released.`,
      };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al aplicar la transacción.",
    };
  }

  const updated = ledgerGetTransaction(transaction.id);
  return {
    success: true,
    transaction: updated ? legacyTxToCanonical(updated) : undefined,
  };
}

/**
 * Bloquea la wallet (estado locked, motivo). No modifica balance.
 */
export function lockWallet(walletId: WalletId, reason: string): { success: boolean; error?: string } {
  const id = (walletId ?? "").toString().trim();
  if (!id) return { success: false, error: "walletId inválido." };
  if (!reason?.trim()) return { success: false, error: "reason es requerido." };
  lockedWallets.set(id, { reason: reason.trim() });
  return { success: true };
}

/**
 * Desbloquea la wallet. No modifica balance.
 */
export function unlockWallet(walletId: WalletId): { success: boolean; error?: string } {
  const id = (walletId ?? "").toString().trim();
  if (!id) return { success: false, error: "walletId inválido." };
  lockedWallets.delete(id);
  return { success: true };
}

/**
 * Obtiene una transacción canónica por id.
 */
export function getTransaction(txId: TransactionId): Transaction | null {
  const legacy = ledgerGetTransaction(txId);
  return legacy ? legacyTxToCanonical(legacy) : null;
}
