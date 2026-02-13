/**
 * Permisos por acción.
 * Mapeo: acción → roles que pueden ejecutarla.
 * Regla: lista vacía → cualquier usuario autenticado puede.
 */

import type { RoleId } from "./types";
import type { PermissionCheck } from "./types";
import { ACTIONS } from "./actions";

type ActionId = string;

/** Roles que pueden ejecutar cada acción. Vacío = cualquier usuario autenticado puede. */
export const ACTION_ROLES: Record<string, RoleId[]> = {
  [ACTIONS.home_view]: [],
  [ACTIONS.profile_view]: [],
  [ACTIONS.wallet_view]: [],
  [ACTIONS.wallet_transfer]: ["capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
  [ACTIONS.chat_open]: [],
  [ACTIONS.chat_new]: [],
  [ACTIONS.chat_private]: [],
  [ACTIONS.chat_group]: [],
  [ACTIONS.video_call]: [],
  [ACTIONS.video_join]: [],
  [ACTIONS.offer_create]: ["cliente", "pyme", "enterprise"],
  [ACTIONS.offer_apply]: [],
  [ACTIONS.upload_performance]: ["vale", "capeto", "kavaju", "mbarete"],
  [ACTIONS.territory_semaphore]: ["kavaju", "mbarete"],
  [ACTIONS.admin_dashboard]: ["enterprise"],
};

/**
 * Devuelve los roles que pueden ejecutar la acción.
 * Lista vacía = cualquier usuario autenticado puede.
 */
export function getRolesForAction(actionId: ActionId): RoleId[] {
  return ACTION_ROLES[actionId] ?? [];
}

/**
 * Comprueba si los roles del usuario permiten ejecutar la acción.
 * Devuelve PermissionCheck (allowed, reason?, requiredRoles?).
 */
export function hasPermissionForAction(
  userRoles: RoleId[],
  actionId: ActionId
): PermissionCheck {
  const requiredRoles = getRolesForAction(actionId);
  if (requiredRoles.length === 0) {
    return { allowed: true };
  }
  const allowed = userRoles.some((r) => requiredRoles.includes(r));
  return {
    allowed,
    reason: allowed ? undefined : "Rol insuficiente para esta acción",
    requiredRoles,
  };
}
