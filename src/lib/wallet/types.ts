/**
 * Tipos de la Wallet YAPÓ — lógica real, preparada para producción futura.
 * Sin UI. Preparado para integración bancaria (no integrado aún).
 * Wallet + Escudos: balanceDisponible, balanceProtegido, escudosActivos.
 */

/** Moneda por defecto de la billetera (validación en transferencias). */
export const WALLET_CURRENCY = "PYG";

/** Billetera por usuario. balance = disponible; heldBalance = en transacciones held; balanceProtegido = bajo escudos. */
export interface Wallet {
  userId: string;
  balance: number;
  heldBalance: number;
  /** Monto protegido por escudos (lock). Opcional para compatibilidad. */
  balanceProtegido?: number;
  /** Escudos activos para este usuario. */
  escudosActivos?: Escudo[];
}

/** Balance expuesto: disponible (para gastar) y protegido (bajo escudos). */
export interface Balance {
  balanceDisponible: number;
  balanceProtegido: number;
}

/** Tipos de escudo. */
export type EscudoKind = "biometrico" | "tiempo" | "monto" | "territorial";

/** Base de escudo (discriminado por kind). */
export interface EscudoBase {
  id: string;
  kind: EscudoKind;
  enabled: boolean;
}

/** Requiere biometría nivel 2+. */
export interface EscudoBiometrico extends EscudoBase {
  kind: "biometrico";
  minLevel: 2 | 3;
}

/** Delay mínimo antes de retiro (ms). */
export interface EscudoTiempo extends EscudoBase {
  kind: "tiempo";
  delayMs: number;
}

/** Límite diario de retiro. */
export interface EscudoMonto extends EscudoBase {
  kind: "monto";
  limitDaily: number;
  /** Reset: timestamp inicio del día (UTC). */
  dayStartAt?: number;
}

/** Zona roja: bloquea transferencias si el usuario está en la zona. */
export interface EscudoTerritorial extends EscudoBase {
  kind: "territorial";
  redZones: Array<{ lat: number; lng: number; radiusMeters: number }>;
}

export type Escudo =
  | EscudoBiometrico
  | EscudoTiempo
  | EscudoMonto
  | EscudoTerritorial;

/** Estado de una transacción en el flujo: pending → held → released | blocked | audit. */
export type TransactionStatus =
  | "pending"
  | "held"
  | "released"
  | "blocked"
  | "audit";

/** Transacción. from/to son userId. El dinero pasa por held; solo Cerebro autoriza release. */
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  status: TransactionStatus;
  createdAt: number;
}

/** Puerto para futura conexión bancaria (no implementado). */
export interface BankConnection {
  debit(userId: string, amount: number, reference: string): Promise<void>;
  credit(userId: string, amount: number, reference: string): Promise<void>;
  getBalance(userId: string): Promise<number>;
}
