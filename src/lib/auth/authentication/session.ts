/**
 * InMemorySessionStore: sesiones en Map, expiración simple, refresh extiende expiresAt.
 * En producción reemplazar por Redis/DB o cookies firmadas.
 */

import type { Identity, Session } from "../types";
import type { ISessionStore } from "./types";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** Entrada interna: sesión + timestamp de expiración (ms) para chequeo rápido. */
type SessionEntry = { session: Session; expiresAt: number };

/** Sesiones en Map: sessionId → { session, expiresAt }. */
const sessions = new Map<string, SessionEntry>();

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export class InMemorySessionStore implements ISessionStore {
  create(identity: Identity): Session {
    const sessionId = generateSessionId();
    const now = Date.now();
    const expiresAt = now + DEFAULT_TTL_MS;
    const session: Session = { sessionId, identity, expiresAt };
    sessions.set(sessionId, { session, expiresAt });
    return session;
  }

  get(sessionId: string): Session | null {
    const entry = sessions.get(sessionId);
    if (!entry) return null;
    // Expiración simple: si pasó expiresAt, borrar y devolver null
    if (Date.now() > entry.expiresAt) {
      sessions.delete(sessionId);
      return null;
    }
    return entry.session;
  }

  invalidate(sessionId: string): void {
    sessions.delete(sessionId);
  }

  refresh(sessionId: string): Session {
    const entry = sessions.get(sessionId);
    if (!entry) throw new Error("Sesión no encontrada");
    if (Date.now() > entry.expiresAt) {
      sessions.delete(sessionId);
      throw new Error("Sesión expirada");
    }
    // Refresh extiende expiresAt desde ahora
    const newExpiresAt = Date.now() + DEFAULT_TTL_MS;
    const updated: Session = { ...entry.session, expiresAt: newExpiresAt };
    sessions.set(sessionId, { session: updated, expiresAt: newExpiresAt });
    return updated;
  }
}

const defaultStore = new InMemorySessionStore();

export function createSessionStore(): ISessionStore {
  return defaultStore;
}
