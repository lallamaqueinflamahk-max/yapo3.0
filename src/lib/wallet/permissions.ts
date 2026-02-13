/**
 * Permisos de billetera por rol.
 * Mapeo: acción wallet → roles que pueden ejecutarla.
 */

import type { Identity, RoleId } from "@/lib/auth";

/** Acciones de billetera */
export const WALLET_ACTIONS = {
  view: "wallet:view",
  transfer: "wallet:transfer",
  admin: "wallet:admin",
} as const;

export type WalletActionId =
  | (typeof WALLET_ACTIONS)[keyof typeof WALLET_ACTIONS];

/** Roles que pueden ejecutar cada acción */
const ACTION_ROLES: Record<WalletActionId, RoleId[]> = {
  [WALLET_ACTIONS.view]: ["vale", "capeto", "kavaju", "mbarete", "pyme", "enterprise"],
  [WALLET_ACTIONS.transfer]: ["capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
  [WALLET_ACTIONS.admin]: ["mbarete", "pyme", "enterprise"],
};

/**
 * Comprueba si la identidad puede usar la acción de billetera.
 * Valé: view | Capeto/Kavaju: view, transfer | Mbareté/PyME/Enterprise: all | Cliente: transfer
 */
export function canUseWallet(
  identity: Identity,
  action: WalletActionId
): { allowed: boolean; reason?: string; requiredRoles?: RoleId[] } {
  const requiredRoles = ACTION_ROLES[action];
  if (!requiredRoles?.length) {
    return { allowed: false, reason: "Acción no definida", requiredRoles: [] };
  }
  const hasRole = identity.roles.some((r) => requiredRoles.includes(r));
  return {
    allowed: hasRole,
    reason: hasRole ? undefined : "Tu rol no permite esta acción de billetera",
    requiredRoles,
  };
}
