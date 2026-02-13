/**
 * SAFE MODE — seguridad progresiva.
 * El starter nunca se bloquea. No login real. No usar en producción.
 */

/** true = starter nunca se bloquea; usuario mock inyectado. */
export const SAFE_MODE = true;

/** Roles configurables para el usuario mock (Valé, Capeto, Kavaju, Mbareté). */
export type SafeModeRole = "vale" | "capeto" | "kavaju" | "mbarete";

const ROLES: SafeModeRole[] = ["vale", "capeto", "kavaju", "mbarete"];

const DEFAULT_SAFE_ROLE: SafeModeRole = "capeto";

function parseRole(role: string | undefined): SafeModeRole {
  const r = (role ?? process.env?.YAPO_SAFE_ROLE ?? "")
    .toString()
    .toLowerCase()
    .trim();
  return ROLES.includes(r as SafeModeRole) ? (r as SafeModeRole) : DEFAULT_SAFE_ROLE;
}

/** Identidad mock devuelta por getSafeIdentity(). */
export interface SafeIdentity {
  userId: string;
  roles: SafeModeRole[];
}

/**
 * Retorna usuario mock con userId y roles configurables (Valé, Capeto, Kavaju, Mbareté).
 * Rol por defecto desde YAPO_SAFE_ROLE o argumento.
 */
export function getSafeIdentity(roles?: SafeModeRole | SafeModeRole[]): SafeIdentity {
  if (roles == null) {
    const r = parseRole(process.env?.YAPO_SAFE_ROLE);
    return { userId: "safe-user", roles: [r] };
  }
  const list = Array.isArray(roles)
    ? roles.filter((r): r is SafeModeRole => ROLES.includes(r))
    : [parseRole(roles as string)];
  const finalRoles = list.length > 0 ? list : [DEFAULT_SAFE_ROLE];
  return { userId: "safe-user", roles: finalRoles };
}

/** Indica si el login debe saltearse (SAFE_MODE activo). */
export function shouldSkipLogin(): boolean {
  return SAFE_MODE === true;
}

/** Rol por defecto del usuario mock (env YAPO_SAFE_ROLE o capeto). */
export function getSafeModeRole(): SafeModeRole {
  return parseRole(process.env?.YAPO_SAFE_ROLE);
}

/** Usuario mock (compatibilidad). */
export interface SafeModeUser {
  userId: string;
  role: SafeModeRole;
  roles: SafeModeRole[];
  verified: boolean;
}

export function getSafeModeUser(role?: SafeModeRole | string): SafeModeUser {
  const r = role != null ? parseRole(role as string) : getSafeModeRole();
  return {
    userId: "safe-user",
    role: r,
    roles: [r],
    verified: true,
  };
}

/** Sesión mock (compatibilidad). */
export interface SafeModeSession {
  sessionId: string;
  identity: SafeModeUser;
  expiresAt: number;
}

export function getSafeModeSession(role?: SafeModeRole | string): SafeModeSession {
  return {
    sessionId: "safe-session",
    identity: getSafeModeUser(role),
    expiresAt: new Date("2099-12-31T23:59:59Z").getTime(),
  };
}
