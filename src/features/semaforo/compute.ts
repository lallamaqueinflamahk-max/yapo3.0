/**
 * Cálculo del estado del semáforo a partir de uso, fraude y rol.
 * Verde: bajo riesgo. Amarillo: validación. Rojo: bloqueo.
 */

import type { SemaphoreFactors, SemaphoreResult, SemaphoreState } from "./types";

/** Umbral de fraude por encima del cual → rojo. */
const FRAUD_RED_THRESHOLD = 0.6;
/** Umbral de fraude por encima del cual → amarillo. */
const FRAUD_YELLOW_THRESHOLD = 0.3;
/** Uso alto + fraude bajo puede bajar a amarillo (validación). */
const USAGE_HIGH_THRESHOLD = 0.7;

/** Roles con criterios más estrictos (menor tolerancia a fraude). */
const STRICT_ROLES = new Set(["vale", "capeto"]);
/** Roles con criterios más flexibles (ej. enterprise). */
const FLEX_ROLES = new Set(["enterprise", "pyme"]);

const REASON_RED = "Semáforo en rojo: riesgo alto. Acciones sensibles bloqueadas.";
const REASON_YELLOW = "Semáforo en amarillo: se requiere validación para continuar.";
const REASON_GREEN = "Semáforo en verde: operaciones permitidas según tu rol.";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number(n) || 0));
}

/**
 * Calcula el estado del semáforo a partir de uso, fraude y rol.
 * - Rojo: fraude alto (o uso muy alto + fraude medio en roles estrictos).
 * - Amarillo: fraude medio o uso alto (validación).
 * - Verde: fraude bajo y uso normal.
 */
export function getSemaphoreState(factors: SemaphoreFactors): SemaphoreResult {
  const usage = clamp01(factors.usage);
  const fraud = clamp01(factors.fraud);
  const role = String(factors.role ?? "").toLowerCase();

  const strict = STRICT_ROLES.has(role);
  const flex = FLEX_ROLES.has(role);

  const fraudRed = flex ? 0.75 : strict ? 0.5 : FRAUD_RED_THRESHOLD;
  const fraudYellow = flex ? 0.45 : strict ? 0.25 : FRAUD_YELLOW_THRESHOLD;

  let state: SemaphoreState = "green";
  let reason = REASON_GREEN;
  let requiresValidation = false;
  let blocked = false;

  if (fraud >= fraudRed || (strict && fraud >= 0.4 && usage >= 0.8)) {
    state = "red";
    reason = REASON_RED;
    blocked = true;
  } else if (fraud >= fraudYellow || (usage >= USAGE_HIGH_THRESHOLD && fraud > 0.1)) {
    state = "yellow";
    reason = REASON_YELLOW;
    requiresValidation = true;
  }

  return {
    state,
    reason,
    factors: { usage, fraud, role },
    requiresValidation,
    blocked,
  };
}
