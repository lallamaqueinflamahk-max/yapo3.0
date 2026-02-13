/**
 * WalletService en memoria (starter).
 * - Crear wallet por usuario
 * - Obtener balance
 * - Transferir entre wallets
 * - Validar fondos suficientes
 * - Ledger en memoria
 * NO dinero real. Sin localStorage. Sin librerías externas.
 */

import type { Wallet, WalletId, Transfer, TransferStatus, TransferTipo } from "./domain";

// --- Store en memoria (legacy UI) ---
const walletsByUserId = new Map<string, Wallet>();
const walletsById = new Map<WalletId, Wallet>();
const transfersStore: Transfer[] = [];

const CURRENCY = "PYG" as const;
const INITIAL_BALANCE = 0;
const MIN_AMOUNT = 0.01;

function nextWalletId(): WalletId {
  return `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function assertUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("userId inválido");
  }
}

function assertAmount(amount: number): void {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    throw new Error("Monto debe ser un número");
  }
  if (amount < MIN_AMOUNT) {
    throw new Error(`Monto mínimo ${MIN_AMOUNT}`);
  }
}

/**
 * Crea una wallet para el usuario. Un usuario = una wallet.
 * Si ya existe, devuelve la existente.
 */
export function createWallet(userId: string): Wallet {
  assertUserId(userId);
  const trimmed = userId.trim();
  const existing = walletsByUserId.get(trimmed);
  if (existing) {
    return existing;
  }
  const wallet: Wallet = {
    walletId: nextWalletId(),
    userId: trimmed,
    balance: INITIAL_BALANCE,
    currency: CURRENCY,
    encrypted: true,
    createdAt: Date.now(),
  };
  walletsByUserId.set(trimmed, wallet);
  walletsById.set(wallet.walletId, wallet);
  return wallet;
}

/**
 * Obtiene la wallet del usuario, si existe.
 */
export function getWalletByUser(userId: string): Wallet | null {
  assertUserId(userId);
  return walletsByUserId.get(userId.trim()) ?? null;
}

/**
 * Obtiene una wallet por su id (para resolver historial).
 */
export function getWalletById(walletId: WalletId): Wallet | null {
  return walletsById.get(walletId) ?? null;
}

/**
 * Obtiene el balance del usuario. Devuelve 0 si no tiene wallet.
 */
export function getBalance(userId: string): number {
  const wallet = getWalletByUser(userId);
  return wallet?.balance ?? 0;
}

/**
 * Transfiere fondos de un usuario a otro.
 * Valida fondos suficientes y registra en el ledger.
 * @param from_user_id Usuario origen
 * @param to_user_id Usuario destino
 * @param amount Monto (PYG)
 * @param concepto Concepto o descripción
 * @param tipo "simulado" (por defecto) o "real"
 * @throws Error si userIds inválidos, monto inválido, fondos insuficientes o mismo usuario
 */
export function transfer(
  from_user_id: string,
  to_user_id: string,
  amount: number,
  concepto: string,
  tipo: TransferTipo = "simulado"
): Transfer {
  assertUserId(from_user_id);
  assertUserId(to_user_id);
  if (from_user_id.trim() === to_user_id.trim()) {
    throw new Error("No se puede transferir al mismo usuario");
  }
  assertAmount(amount);

  const from = getWalletByUser(from_user_id.trim());
  const to = getWalletByUser(to_user_id.trim());

  if (!from) {
    throw new Error(`Wallet no encontrada para usuario: ${from_user_id}`);
  }
  if (!to) {
    throw new Error(`Wallet no encontrada para usuario: ${to_user_id}`);
  }

  if (from.balance < amount) {
    throw new Error(
      `Fondos insuficientes. Balance: ${from.balance}, solicitado: ${amount}`
    );
  }

  const timestamp = Date.now();
  const status: TransferStatus = "completed";

  from.balance -= amount;
  to.balance += amount;

  const record: Transfer = {
    fromWalletId: from.walletId,
    toWalletId: to.walletId,
    amount,
    timestamp,
    status,
    concepto: concepto?.trim() || undefined,
    tipo,
  };
  transfersStore.push(record);
  return record;
}

/**
 * Ledger de transferencias (solo lectura). Para auditoría/historial.
 */
export function getLedgerTransfers(): readonly Transfer[] {
  return transfersStore;
}

/**
 * Transfers que involucran una wallet (origen o destino).
 */
export function getTransfersForWallet(walletId: WalletId): readonly Transfer[] {
  return transfersStore.filter(
    (t) => t.fromWalletId === walletId || t.toWalletId === walletId
  );
}
