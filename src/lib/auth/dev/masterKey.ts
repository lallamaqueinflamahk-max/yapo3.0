/**
 * Master Key de desarrollo para YAPÓ v2.
 * Solo para entornos de desarrollo; no usar en producción.
 */

import type { Identity, RoleId, Session } from "../types";

/** Si no está definido o vacío, no hay master key (isMasterKeyProvided siempre false). */
export const DEV_MASTER_KEY =
  process.env.YAPO_MASTER_KEY?.trim() ?? "";

const ALL_ROLES: RoleId[] = [
  "vale",
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

/** Expiración muy larga para sesión dev (año 2099). */
const DEV_SESSION_EXPIRES_AT = new Date("2099-12-31T23:59:59Z").getTime();

export function isMasterKeyProvided(input?: string): boolean {
  return Boolean(DEV_MASTER_KEY && input === DEV_MASTER_KEY);
}

export function createMasterIdentity(): Identity {
  return {
    userId: "dev-master",
    roles: [...ALL_ROLES],
    verified: true,
  };
}

export function createMasterSession(): Session {
  return {
    sessionId: "dev-master-session",
    identity: createMasterIdentity(),
    expiresAt: DEV_SESSION_EXPIRES_AT,
  };
}
