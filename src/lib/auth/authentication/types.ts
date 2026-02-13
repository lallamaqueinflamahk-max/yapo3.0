/**
 * Tipos para autenticación (identidad y sesión).
 * Separado de autorización (permisos).
 */

import type { Identity, Session } from "../types";

export interface IAuthProvider {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  logout(sessionId: string): Promise<void>;
}

export interface ISessionStore {
  create(identity: Identity): Session;
  get(sessionId: string): Session | null;
  invalidate(sessionId: string): void;
  refresh(sessionId: string): Session;
}

export type AuthCredentials = {
  userId: string;
  password?: string;
};

export type AuthResult =
  | { success: true; identity: Identity; session: Session }
  | { success: false; reason: string };

export type BiometricPayload = {
  type: "face" | "fingerprint" | "voice";
  data: unknown;
};
