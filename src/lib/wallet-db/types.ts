/**
 * FASE 2 – Tipos Wallet + Escudos (DB).
 */

export type WalletStatus = "ACTIVE" | "FROZEN";
export type TransactionType = "CREDIT" | "DEBIT" | "TRANSFER";
export type ShieldType = "SALUD" | "FINTECH" | "COMUNIDAD" | "SUBSIDIO";
export type UserShieldStatus = "ACTIVE" | "SUSPENDED";

export const WALLET_STATUSES: WalletStatus[] = ["ACTIVE", "FROZEN"];
export const TRANSACTION_TYPES: TransactionType[] = ["CREDIT", "DEBIT", "TRANSFER"];
export const SHIELD_TYPES: ShieldType[] = ["SALUD", "FINTECH", "COMUNIDAD", "SUBSIDIO"];

export interface WalletView {
  id: string;
  userId: string;
  balance: number;
  status: WalletStatus;
  createdAt: Date;
}

export interface TransactionView {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  reason: string | null;
  createdAt: Date;
  devOnly: boolean;
}

export interface ShieldView {
  id: string;
  type: ShieldType;
  level: number;
  territoryId: string | null;
  active: boolean;
}

export interface UserShieldView {
  id: string;
  userId: string;
  shieldId: string;
  status: UserShieldStatus;
  shield?: ShieldView;
}
