"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Identity, RoleId, Session } from "../types";
import { isDevMode, createDevSession, logDevModeWarning } from "../dev/devMode";
import { SAFE_MODE_CLIENT, createSafeSessionForClient } from "../dev/safeMode";

interface SessionContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
  identity: Identity | null;
  roles: RoleId[];
  isVerified: boolean;
  isMaster: boolean;
  isSafeMode: boolean;
  /** Solo en SAFE MODE: cambia el rol del usuario mock (Valé, Capeto, Kavaju, etc.). */
  setSafeRole: (role: RoleId) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => {
    if (isDevMode()) return createDevSession();
    if (SAFE_MODE_CLIENT) return createSafeSessionForClient();
    return null;
  });

  const setSession = useCallback((s: Session | null) => {
    setSessionState(s);
  }, []);

  const setSafeRole = useCallback((role: RoleId) => {
    if (!SAFE_MODE_CLIENT) return;
    setSessionState(createSafeSessionForClient(role));
  }, []);

  useEffect(() => {
    if (isDevMode()) logDevModeWarning();
  }, []);

  const value = useMemo<SessionContextValue>(() => {
    const identity = session?.identity ?? null;
    const roles = identity?.roles ?? [];
    const isVerified = identity?.verified ?? false;
    const isMaster = identity?.userId === "dev-master";
    const isSafeMode = identity?.userId === "safe-user";

    return {
      session,
      setSession,
      identity,
      roles,
      isVerified,
      isMaster,
      isSafeMode,
      setSafeRole,
    };
  }, [session, setSession, setSafeRole]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return ctx;
}
