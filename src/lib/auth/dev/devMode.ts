/**
 * DEV_MODE: saltar autenticación con usuario mock Mbareté.
 * Solo para desarrollo. No usar en producción.
 */

import type { Identity, Session } from "../types";

const DEV_SESSION_EXPIRES_AT = new Date("2099-12-31T23:59:59Z").getTime();

/** Habilitado cuando NEXT_PUBLIC_DEV_MODE=true. */
export function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true";
}

/** Usuario mock Mbareté: todos los permisos (view, transfer, admin). */
export function createDevIdentity(): Identity {
  return {
    userId: "dev-mbarete",
    roles: ["mbarete"],
    verified: true,
  };
}

export function createDevSession(): Session {
  return {
    sessionId: "dev-mode-session",
    identity: createDevIdentity(),
    expiresAt: DEV_SESSION_EXPIRES_AT,
  };
}

/** Advertencia visible en consola cuando DEV_MODE está activo. */
export function logDevModeWarning(): void {
  if (!isDevMode()) return;
  const msg = [
    "%c[YAPÓ DEV_MODE]",
    "color: #D52B1E; font-weight: bold; font-size: 14px;",
    "Autenticación saltada. Usuario mock: Mbareté (dev-mbarete). Wallet sin bloqueo. NO USAR EN PRODUCCIÓN.",
  ];
  console.warn(...msg);
}
