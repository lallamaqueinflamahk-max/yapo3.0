/**
 * Validación de montos y parámetros de pago.
 */

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 100_000_000;
const ALLOWED_CURRENCIES = ["PYG", "USD"] as const;

export function validateAmountCents(amountCents: unknown): { valid: boolean; error?: string } {
  if (amountCents == null || typeof amountCents !== "number") {
    return { valid: false, error: "Monto es obligatorio" };
  }
  if (Number.isNaN(amountCents) || amountCents < MIN_AMOUNT_CENTS) {
    return { valid: false, error: `Monto mínimo: ${MIN_AMOUNT_CENTS} (centavos/unidad)` };
  }
  if (amountCents > MAX_AMOUNT_CENTS) {
    return { valid: false, error: "Monto máximo excedido" };
  }
  if (!Number.isInteger(amountCents)) {
    return { valid: false, error: "Monto debe ser entero (centavos)" };
  }
  return { valid: true };
}

export function validateCurrency(currency: unknown): { valid: boolean; error?: string } {
  if (typeof currency !== "string" || !ALLOWED_CURRENCIES.includes(currency as (typeof ALLOWED_CURRENCIES)[number])) {
    return { valid: false, error: `Moneda no soportada. Usar: ${ALLOWED_CURRENCIES.join(", ")}` };
  }
  return { valid: true };
}

export function validateUserId(userId: unknown): { valid: boolean; error?: string } {
  if (typeof userId !== "string" || !userId.trim()) {
    return { valid: false, error: "Usuario inválido" };
  }
  return { valid: true };
}
