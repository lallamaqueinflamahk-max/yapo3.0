/**
 * Modelo público Wallet para UI y integración Cerebro.
 * WalletAccount y WalletTransaction: nombres claros para mobile-first.
 * No mueve dinero; solo expone datos desde ledger/servicio.
 */

import { getWallet, getTransactions } from "./ledger";
import { getBalance } from "./wallet.service";
import type { Escudo } from "./types";

/** Cuenta de billetera expuesta a la UI (mobile-first). */
export interface WalletAccount {
  userId: string;
  balanceAvailable: number;
  balanceProtected: number;
  /** Escudos activos para mostrar como chips. */
  escudosActivos?: Escudo[];
}

/** Transacción en el historial (simple, para lista). */
export interface WalletTransaction {
  id: string;
  type: "transfer" | "subsidy" | "refund" | "internal";
  amount: number;
  status: "pending" | "completed" | "failed";
  /** Para transfer: from/to; para subsidio: solo relevante para contexto. */
  fromUserId?: string;
  toUserId?: string;
  createdAt: number;
}

/** Mapea estado del ledger a status simple para UI. */
function ledgerStatusToSimple(
  status: "pending" | "held" | "released" | "blocked" | "audit"
): WalletTransaction["status"] {
  switch (status) {
    case "released":
      return "completed";
    case "blocked":
      return "failed";
    case "pending":
    case "held":
    default:
      return "pending";
  }
}

/**
 * Obtiene la cuenta de billetera del usuario para la UI.
 * Ninguna acción mueve dinero; solo lectura.
 */
export function getWalletAccount(userId: string): WalletAccount | null {
  if (!userId?.trim()) return null;
  const w = getWallet(userId);
  const balance = getBalance(userId);
  if (!w && !balance) return null;

  const disponible = balance?.disponible ?? w?.balance ?? 0;
  const protegido = balance?.protegido ?? w?.balanceProtegido ?? 0;

  return {
    userId,
    balanceAvailable: disponible,
    balanceProtected: protegido,
    escudosActivos: w?.escudosActivos ?? [],
  };
}

/**
 * Obtiene las transacciones del usuario como WalletTransaction[] para el historial.
 */
export function getWalletTransactions(userId: string): WalletTransaction[] {
  if (!userId?.trim()) return [];
  const all = getTransactions();
  const mine = all.filter((tx) => tx.from === userId || tx.to === userId);
  return mine.map((tx) => ({
    id: tx.id,
    type: "transfer",
    amount: tx.amount,
    status: ledgerStatusToSimple(tx.status),
    fromUserId: tx.from,
    toUserId: tx.to,
    createdAt: tx.createdAt,
  }));
}
