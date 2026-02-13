/**
 * Acciones permitidas según estado del semáforo.
 * Verde: según rol (permisos normales). Amarillo: sensibles con validación. Rojo: solo lectura / mínimas.
 */

import type { SemaphoreState } from "./types";
import { ACTIONS } from "@/lib/auth/actions";

/** Acciones que siempre se permiten (solo lectura / navegación) incluso en rojo. */
const ALWAYS_ALLOWED = new Set<string>([
  ACTIONS.home_view,
  ACTIONS.profile_view,
  ACTIONS.wallet_view,
  ACTIONS.chat_open,
  ACTIONS.chat_private,
  ACTIONS.chat_group,
  ACTIONS.chat_new,
  ACTIONS.video_join,
]);

/** Acciones sensibles que en amarillo requieren validación; en rojo se bloquean. */
const SENSITIVE_ACTIONS = new Set<string>([
  ACTIONS.wallet_transfer,
  ACTIONS.video_call,
  ACTIONS.offer_create,
  ACTIONS.offer_apply,
  ACTIONS.upload_performance,
  ACTIONS.territory_semaphore,
  ACTIONS.admin_dashboard,
]);

/**
 * Indica si una acción está permitida por el semáforo (sin considerar rol).
 * - Verde: todas permitidas (el rol se valida aparte).
 * - Amarillo: siempre permitidas + sensibles con requiresValidation.
 * - Rojo: solo ALWAYS_ALLOWED; sensibles bloqueadas.
 */
export function isActionAllowedBySemaphore(
  state: SemaphoreState,
  actionId: string
): { allowed: boolean; requiresValidation?: boolean } {
  if (ALWAYS_ALLOWED.has(actionId)) {
    return { allowed: true };
  }
  if (state === "green") {
    return { allowed: true };
  }
  if (state === "yellow") {
    if (SENSITIVE_ACTIONS.has(actionId)) {
      return { allowed: true, requiresValidation: true };
    }
    return { allowed: true };
  }
  // red
  if (SENSITIVE_ACTIONS.has(actionId)) {
    return { allowed: false };
  }
  return { allowed: true };
}

/**
 * Lista de IDs de acciones permitidas según el estado del semáforo.
 * Útil para filtrar menús o chips por semáforo.
 */
export function getAllowedActionIdsBySemaphore(state: SemaphoreState): string[] {
  const all = [...ALWAYS_ALLOWED, ...SENSITIVE_ACTIONS];
  if (state === "green") return all;
  if (state === "yellow") return all;
  return [...ALWAYS_ALLOWED];
}
