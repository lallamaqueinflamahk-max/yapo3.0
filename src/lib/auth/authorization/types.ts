/**
 * Tipos para autorización (qué puede hacer el usuario).
 * Separado de autenticación (quién es el usuario).
 */

import type { ActionId, Identity, PermissionCheck, RoleId } from "../types";

export interface IAuthorizationService {
  can(identity: Identity, actionId: ActionId): PermissionCheck;
  canWithRoles(roles: RoleId[], actionId: ActionId): PermissionCheck;
  getRolesForAction(actionId: ActionId): RoleId[];
}
