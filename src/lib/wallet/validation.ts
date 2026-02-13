/**
 * Validación de operaciones de billetera.
 * Reglas de negocio sin tocar dinero real.
 */

import { WALLET_CURRENCY } from "./types";

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 1_000_000;
const AMOUNT_DECIMALS = 2;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUserId(userId: unknown): ValidationResult {
  if (userId == null || typeof userId !== "string") {
    return { valid: false, error: "userId inválido" };
  }
  const trimmed = userId.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "userId no puede estar vacío" };
  }
  if (trimmed.length > 128) {
    return { valid: false, error: "userId demasiado largo" };
  }
  return { valid: true };
}

export function validateAmount(amount: unknown): ValidationResult {
  if (amount == null) {
    return { valid: false, error: "Monto requerido" };
  }
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (Number.isNaN(num)) {
    return { valid: false, error: "Monto debe ser un número" };
  }
  if (num < MIN_AMOUNT) {
    return { valid: false, error: `Monto mínimo ${MIN_AMOUNT}` };
  }
  if (num > MAX_AMOUNT) {
    return { valid: false, error: `Monto máximo ${MAX_AMOUNT}` };
  }
  const str = String(amount);
  const decimals = str.includes(".") ? str.split(".")[1]?.length ?? 0 : 0;
  if (decimals > AMOUNT_DECIMALS) {
    return { valid: false, error: `Máximo ${AMOUNT_DECIMALS} decimales` };
  }
  return { valid: true };
}

export function validateTransferRequest(
  fromUserId: unknown,
  toUserId: unknown,
  amount: unknown,
  currency?: unknown
): ValidationResult {
  const from = validateUserId(fromUserId);
  if (!from.valid) return from;
  const to = validateUserId(toUserId);
  if (!to.valid) return to;
  if (fromUserId === toUserId) {
    return { valid: false, error: "No se puede transferir al mismo usuario" };
  }
  const amt = validateAmount(amount);
  if (!amt.valid) return amt;
  if (currency != null && currency !== WALLET_CURRENCY) {
    return { valid: false, error: `Solo se admite moneda ${WALLET_CURRENCY}` };
  }
  return { valid: true };
}

export function formatAmountForDisplay(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(AMOUNT_DECIMALS);
}
