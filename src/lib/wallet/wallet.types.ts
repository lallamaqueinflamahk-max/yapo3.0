/**
 * Modelo de datos de la Wallet YAPÓ.
 * Tipos base, Wallet, Transaction, Balance. Sin lógica de negocio.
 * Comentarios solo donde aporten claridad legal/fintech.
 */

// -----------------------------------------------------------------------------
// Tipos base (identificadores canónicos)
// -----------------------------------------------------------------------------

export type WalletId = string;
export type TransactionId = string;
export type EscudoId = string;

// -----------------------------------------------------------------------------
// Límites (fintech: trazabilidad de topes)
// -----------------------------------------------------------------------------

export interface WalletLimits {
  /** Límite de retiro/transferencia por día (unidad base). 0 = sin límite explícito. */
  diario: number;
  /** Límite de retiro/transferencia por mes (unidad base). 0 = sin límite explícito. */
  mensual: number;
}

// -----------------------------------------------------------------------------
// Estado de la wallet (compliance: bloqueo, suspensión)
// -----------------------------------------------------------------------------

export type WalletEstado = "active" | "locked" | "suspended";

// -----------------------------------------------------------------------------
// Wallet
// -----------------------------------------------------------------------------

export interface Wallet {
  id: WalletId;
  ownerUserId: string;
  balanceDisponible: number;
  balanceProtegido: number;
  escudosActivos: EscudoId[];
  limites: WalletLimits;
  estado: WalletEstado;
  createdAt: number;
  updatedAt: number;
}

// -----------------------------------------------------------------------------
// Transaction: tipo y estado (auditoría y trazabilidad legal)
// -----------------------------------------------------------------------------

export type TransactionType = "transfer" | "subsidy" | "refund" | "internal";

export type TransactionStatus =
  | "pending"
  | "blocked"
  | "completed"
  | "failed";

export interface Transaction {
  id: TransactionId;
  fromWalletId: WalletId;
  toWalletId: WalletId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  /** Motivo de bloqueo/fallo o referencia (opcional). */
  reason?: string;
  /** Nivel de biometría requerido para liberar (opcional). */
  requiredBiometricLevel?: 0 | 1 | 2 | 3;
  createdAt: number;
}

// -----------------------------------------------------------------------------
// Balance (vista agregada: total = disponible + protegido)
// -----------------------------------------------------------------------------

export interface Balance {
  total: number;
  disponible: number;
  protegido: number;
}
