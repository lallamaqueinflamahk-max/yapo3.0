/**
 * Motor de decisión del Cerebro YAPÓ.
 * decide(context) → CerebroDecision.
 * Valida rol, acción y monto; devuelve decisiones claras (no booleanos sueltos).
 * Sin UI. Sin OpenAI. 100% testeable.
 */

import type { CerebroContext, CerebroDecision, ActionId } from "./types";
import { can, getAllowedActions, getNextSteps, CEREBRO_ACTIONS } from "./rules";

const EVENT_DECIDE = "cerebro:decide";
const EVENT_AUTHORIZED = "cerebro:authorized";
const EVENT_REJECTED = "cerebro:rejected";
const EVENT_AMOUNT_INVALID = "cerebro:amount_invalid";

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 1e12;

function getPrimaryRole(context: CerebroContext): string | null {
  const roles = context.roles ?? [];
  const first = roles[0];
  return first != null ? String(first).trim().toLowerCase() : null;
}

function validateAmount(
  amount: number | undefined,
  action: string
): { valid: boolean; reason?: string } {
  if (amount === undefined) return { valid: true };
  const amountActions = [
    CEREBRO_ACTIONS.release_payment,
    CEREBRO_ACTIONS.hold_payment,
  ];
  if (!amountActions.includes(action)) return { valid: true };
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return { valid: false, reason: "Monto debe ser un número válido." };
  }
  if (amount < AMOUNT_MIN) {
    return { valid: false, reason: `Monto no puede ser menor que ${AMOUNT_MIN}.` };
  }
  if (amount > AMOUNT_MAX) {
    return { valid: false, reason: `Monto excede el límite permitido (${AMOUNT_MAX}).` };
  }
  return { valid: true };
}

/**
 * Toma una decisión a partir del contexto.
 * Valida rol, acción y monto; devuelve CerebroDecision con reason, nextSteps y allowedActions.
 */
export function decide(context: CerebroContext): CerebroDecision {
  const events: string[] = [EVENT_DECIDE];
  const primaryRole = getPrimaryRole(context);
  const action = (context.action ?? "").toString().trim() as ActionId;

  if (!primaryRole) {
    return {
      authorized: false,
      reason: "Rol no informado. Se requiere al menos un rol en context.roles.",
      allowedActions: [],
      nextSteps: ["Completar identidad y roles antes de ejecutar la acción."],
      events: [...events, EVENT_REJECTED],
    };
  }

  const amountResult = validateAmount(context.amount, action);
  if (!amountResult.valid) {
    const allowedActions = getAllowedActions(primaryRole);
    return {
      authorized: false,
      reason: amountResult.reason ?? "Monto inválido.",
      allowedActions,
      nextSteps: ["Ingresar un monto válido para la operación."],
      events: [...events, EVENT_AMOUNT_INVALID, EVENT_REJECTED],
    };
  }

  const authorized = can(primaryRole, action);
  const allowedActions = getAllowedActions(primaryRole);
  const nextSteps = getNextSteps(primaryRole, action, authorized);

  if (authorized) {
    return {
      authorized: true,
      reason: "Acción permitida por rol y reglas del Cerebro.",
      allowedActions,
      nextSteps: [],
      events: [...events, EVENT_AUTHORIZED],
    };
  }

  return {
    authorized: false,
    reason: `El rol "${primaryRole}" no puede ejecutar la acción "${action}".`,
    allowedActions,
    nextSteps,
    events: [...events, EVENT_REJECTED],
  };
}

/**
 * Compatibilidad con consumidores que envían context con role (singular).
 * Normaliza a roles y devuelve la forma legacy Decision.
 */
export function decidir(legacyContext: {
  userId: string;
  role?: string;
  roles?: string[];
  action: string;
  origin: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}): {
  authorized: boolean;
  reason?: string;
  allowedActions: string[];
  events: string[];
} {
  const roles = (legacyContext.roles ?? (legacyContext.role ? [legacyContext.role] : [])) as import("./types").RoleId[];
  const decision = decide({
    userId: legacyContext.userId,
    roles,
    action: legacyContext.action as import("./types").ActionId,
    origin: legacyContext.origin,
    amount: legacyContext.amount,
    metadata: legacyContext.metadata,
  });
  return {
    authorized: decision.authorized,
    reason: decision.reason,
    allowedActions: decision.allowedActions as string[],
    events: decision.events,
  };
}
