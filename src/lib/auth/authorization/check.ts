/**
 * AuthorizationService: permisos por acción.
 * Usa solo permissions.ts (identity, roles, actionId). No sesiones ni login.
 */

import type { ActionId, Identity, PermissionCheck, RoleId } from "../types";
import { hasPermissionForAction, getRolesForAction } from "../permissions";
import type { IAuthorizationService } from "./types";

export class AuthorizationService implements IAuthorizationService {
  can(identity: Identity, actionId: ActionId): PermissionCheck {
    return this.canWithRoles(identity.roles, actionId);
  }

  canWithRoles(roles: RoleId[], actionId: ActionId): PermissionCheck {
    return hasPermissionForAction(roles, actionId);
  }

  getRolesForAction(actionId: ActionId): RoleId[] {
    return getRolesForAction(actionId);
  }
}

const defaultService = new AuthorizationService();

export function createAuthorizationService(): IAuthorizationService {
  return defaultService;
}

/** Atajo: ¿la identidad puede ejecutar la acción? */
export function can(
  identity: Identity,
  actionId: ActionId
): PermissionCheck {
  return defaultService.can(identity, actionId);
}

/** Atajo: ¿estos roles pueden ejecutar la acción? */
export function canWithRoles(
  roles: RoleId[],
  actionId: ActionId
): PermissionCheck {
  return defaultService.canWithRoles(roles, actionId);
}
