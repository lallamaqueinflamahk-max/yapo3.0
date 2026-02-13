/**
 * Safe Mode de desarrollo para YAPÓ v2.
 * Solo para entornos de desarrollo; no usar en producción.
 * SAFE MODE activo: sesión mock sin login; Cerebro no bloquea.
 */

import type { Identity, RoleId, Session } from "../types";
import { isValidRoleId } from "../roles";

/** Server: activo cuando YAPO_SAFE_MODE=true o SAFE_MODE=true. */
export const SAFE_MODE_ENABLED =
  process.env.YAPO_SAFE_MODE === "true" || process.env.SAFE_MODE === "true";

/**
 * Client: activo cuando NEXT_PUBLIC_SAFE_MODE=true o NEXT_PUBLIC_YAPO_SAFE_MODE no es "false".
 * NEXT_PUBLIC_SAFE_MODE=true tiene prioridad para compatibilidad con el starter.
 */
export const SAFE_MODE_CLIENT =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_SAFE_MODE === "true" ||
    process.env.NEXT_PUBLIC_YAPO_SAFE_MODE !== "false");

/** Rol safe desde env (ej. YAPO_SAFE_ROLE=mbarete). Por defecto: capeto. */
const SAFE_ROLE_ENV = process.env.YAPO_SAFE_ROLE?.trim().toLowerCase();
const DEFAULT_SAFE_ROLE: RoleId = "capeto";

function getSafeRoles(): RoleId[] {
  if (SAFE_ROLE_ENV && isValidRoleId(SAFE_ROLE_ENV)) {
    return [SAFE_ROLE_ENV as RoleId];
  }
  return [DEFAULT_SAFE_ROLE];
}

/** Rol safe en cliente (NEXT_PUBLIC_SAFE_ROLE / NEXT_PUBLIC_YAPO_SAFE_ROLE o capeto). */
function getSafeRoleClient(): RoleId {
  const r = (
    process.env.NEXT_PUBLIC_SAFE_ROLE ??
    process.env.NEXT_PUBLIC_YAPO_SAFE_ROLE ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
  return isValidRoleId(r) ? (r as RoleId) : DEFAULT_SAFE_ROLE;
}

/** Expiración larga para sesión safe (año 2099). */
const SAFE_SESSION_EXPIRES_AT = new Date("2099-12-31T23:59:59Z").getTime();

export function createSafeIdentity(): Identity {
  return {
    userId: "safe-user",
    roles: getSafeRoles(),
    verified: true,
  };
}

export function getSafeSession(): Session {
  return {
    sessionId: "safe-session",
    identity: createSafeIdentity(),
    expiresAt: SAFE_SESSION_EXPIRES_AT,
  };
}

/**
 * Sesión safe para cliente (SessionProvider).
 * Usa NEXT_PUBLIC_SAFE_ROLE / NEXT_PUBLIC_YAPO_SAFE_ROLE o capeto.
 * Si se pasa role, se usa ese (para UI selector de rol).
 */
export function createSafeSessionForClient(role?: RoleId): Session {
  const r = role ?? getSafeRoleClient();
  const effectiveRole = isValidRoleId(r) ? r : DEFAULT_SAFE_ROLE;
  return {
    sessionId: "safe-session",
    identity: {
      userId: "safe-user",
      roles: [effectiveRole],
      verified: true,
    },
    expiresAt: SAFE_SESSION_EXPIRES_AT,
  };
}

/** Devuelve el rol por defecto para safe mode (para UI). */
export function getDefaultSafeRoleClient(): RoleId {
  return getSafeRoleClient();
}

export function isSafeMode(): boolean {
  return SAFE_MODE_ENABLED;
}
