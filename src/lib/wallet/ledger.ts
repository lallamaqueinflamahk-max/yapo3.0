/**
 * Ledger en memoria — Wallet YAPÓ.
 * createWallet(userId), getWallet(userId), recordTransaction(tx).
 * Nunca modificar balance directamente; solo vía recordTransaction.
 * Lógica real; preparado para producción futura.
 */

import type { Wallet, Transaction, TransactionStatus } from "./types";

const wallets = new Map<string, Wallet>();
const transactions = new Map<string, Transaction>();
const appliedEffects = new Map<
  string,
  { hold: boolean; release: boolean; block: boolean }
>();

function getApplied(txId: string) {
  let a = appliedEffects.get(txId);
  if (!a) {
    a = { hold: false, release: false, block: false };
    appliedEffects.set(txId, a);
  }
  return a;
}

/**
 * Crea una wallet para el usuario. Si ya existe, devuelve la existente.
 */
export function createWallet(userId: string): Wallet {
  const id = (userId ?? "").toString().trim();
  if (!id) throw new Error("userId inválido");
  const existing = wallets.get(id);
  if (existing) return existing;
  const wallet: Wallet = {
    userId: id,
    balance: 0,
    heldBalance: 0,
    balanceProtegido: 0,
    escudosActivos: [],
  };
  wallets.set(id, wallet);
  return wallet;
}

/**
 * Obtiene la wallet del usuario, o null si no existe.
 */
export function getWallet(userId: string): Wallet | null {
  const id = (userId ?? "").toString().trim();
  if (!id) return null;
  return wallets.get(id) ?? null;
}

/**
 * Registra una transacción y aplica su efecto al ledger (única forma de modificar balances).
 * - pending: solo almacena; no modifica balances.
 * - held: debita from.balance, aumenta from.heldBalance (una sola vez por tx).
 * - released: acredita to.balance, reduce from.heldBalance (una sola vez por tx).
 * - blocked: devuelve from.heldBalance a from.balance (una sola vez por tx).
 */
export function recordTransaction(tx: Transaction): void {
  transactions.set(tx.id, { ...tx });

  const from = getWallet(tx.from);
  const to = getWallet(tx.to);
  const applied = getApplied(tx.id);

  if (tx.status === "held" && from && !applied.hold) {
    if (from.balance < tx.amount) {
      throw new Error(
        `Fondos insuficientes. Balance: ${from.balance}, solicitado: ${tx.amount}`
      );
    }
    from.balance -= tx.amount;
    from.heldBalance += tx.amount;
    applied.hold = true;
  }

  if (tx.status === "released" && from && to && !applied.release) {
    if (from.heldBalance < tx.amount) {
      throw new Error(
        `Held insuficiente para release. heldBalance: ${from.heldBalance}, monto: ${tx.amount}`
      );
    }
    from.heldBalance -= tx.amount;
    to.balance += tx.amount;
    applied.release = true;
  }

  if (tx.status === "blocked" && from && applied.hold && !applied.release && !applied.block) {
    from.heldBalance -= tx.amount;
    from.balance += tx.amount;
    applied.block = true;
  }

  appliedEffects.set(tx.id, applied);
}

/**
 * Devuelve una transacción por id.
 */
export function getTransaction(txId: string): Transaction | null {
  return transactions.get(txId) ?? null;
}

/**
 * Lista transacciones (para auditoría / historial).
 */
export function getTransactions(): readonly Transaction[] {
  return Array.from(transactions.values());
}

/**
 * Aplica lock: mueve amount de balance a balanceProtegido (escudos).
 */
export function applyLock(userId: string, amount: number): void {
  const w = getWallet(userId);
  if (!w) throw new Error("Wallet no encontrada");
  if (amount <= 0 || !Number.isFinite(amount)) throw new Error("Monto inválido para lock");
  const balance = w.balance;
  const protegido = w.balanceProtegido ?? 0;
  if (balance < amount) throw new Error(`Fondos insuficientes para lock. Balance: ${balance}, solicitado: ${amount}`);
  w.balance = balance - amount;
  w.balanceProtegido = protegido + amount;
}

/**
 * Aplica unlock: mueve amount de balanceProtegido a balance.
 */
export function applyUnlock(userId: string, amount: number): void {
  const w = getWallet(userId);
  if (!w) throw new Error("Wallet no encontrada");
  if (amount <= 0 || !Number.isFinite(amount)) throw new Error("Monto inválido para unlock");
  const protegido = w.balanceProtegido ?? 0;
  if (protegido < amount) throw new Error(`Protegido insuficiente para unlock. Protegido: ${protegido}, solicitado: ${amount}`);
  w.balanceProtegido = protegido - amount;
  w.balance = (w.balance ?? 0) + amount;
}

/**
 * Acredita fondos a una wallet (ej. depósito institucional / programa).
 * Crea la wallet si no existe. No debita de otra cuenta.
 */
export function credit(userId: string, amount: number): void {
  if (amount <= 0 || !Number.isFinite(amount)) throw new Error("Monto inválido para credit");
  const w = createWallet(userId);
  w.balance = (w.balance ?? 0) + amount;
}

/**
 * Vacía el ledger (tests / reset). No usar en producción.
 */
export function clearLedger(): void {
  wallets.clear();
  transactions.clear();
  appliedEffects.clear();
}
