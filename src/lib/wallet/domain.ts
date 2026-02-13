/**
 * Tipos del dominio billetera en memoria (starter).
 * NO dinero real. Todo simulado.
 */

export type WalletId = string;
export type Currency = "PYG";

export interface Wallet {
  walletId: WalletId;
  userId: string;
  balance: number;
  currency: Currency;
  encrypted: boolean;
  createdAt: number;
}

export type TransferStatus = "pending" | "completed" | "rejected";

/** Tipo de transferencia: simulado (por defecto) o real. */
export type TransferTipo = "simulado" | "real";

export interface Transfer {
  fromWalletId: WalletId;
  toWalletId: WalletId;
  amount: number;
  timestamp: number;
  status: TransferStatus;
  /** Concepto o descripción de la transferencia. */
  concepto?: string;
  /** Tipo: simulado (por defecto) o real. */
  tipo?: TransferTipo;
}
