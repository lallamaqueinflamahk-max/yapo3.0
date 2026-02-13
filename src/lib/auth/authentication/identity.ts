/**
 * Proveedor de autenticación por credenciales (userId + password).
 * Si Safe Mode → sesión safe. Si Master Key → sesión master. Si no → login normal.
 */

import type { RoleId } from "../types";
import type { Identity } from "../types";
import type { AuthCredentials, AuthResult, IAuthProvider } from "./types";
import { createSessionStore } from "./session";
import { isSafeMode, getSafeSession } from "../dev/safeMode";
import { isMasterKeyProvided, createMasterSession } from "../dev/masterKey";

/** Contraseña mock fija para todos los usuarios. */
const MOCK_PASSWORD = "yapo123";

/** Usuarios mock: userId → rol. NO usar en producción. */
const MOCK_USERS = new Map<string, RoleId[]>([
  ["user-1", ["vale"]],
  ["user-2", ["capeto"]],
  ["user-3", ["kavaju"]],
  ["user-4", ["mbarete"]],
  ["user-5", ["cliente"]],
  ["user-6", ["pyme"]],
  ["user-7", ["enterprise"]],
]);

const sessionStore = createSessionStore();

export class PasswordAuthProvider implements IAuthProvider {
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    if (isSafeMode()) {
      const session = getSafeSession();
      return { success: true, identity: session.identity, session };
    }
    if (isMasterKeyProvided(credentials.password)) {
      const session = createMasterSession();
      return { success: true, identity: session.identity, session };
    }
    const roles = MOCK_USERS.get(credentials.userId);
    if (!roles) return { success: false, reason: "Usuario no encontrado" };
    const password = credentials.password ?? "";
    if (password !== MOCK_PASSWORD) {
      return { success: false, reason: "Contraseña incorrecta" };
    }
    const identity: Identity = {
      userId: credentials.userId,
      roles,
      verified: true,
    };
    const session = sessionStore.create(identity);
    return { success: true, identity, session };
  }

  async logout(sessionId: string): Promise<void> {
    sessionStore.invalidate(sessionId);
  }
}

const defaultProvider = new PasswordAuthProvider();

export function createAuthProvider(): IAuthProvider {
  return defaultProvider;
}
