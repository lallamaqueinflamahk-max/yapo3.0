"use client";

/**
 * Sincroniza la sesión de NextAuth con el SessionProvider de YAPÓ.
 * Cuando no hay SAFE MODE: sesión NextAuth → Identity/Session interno.
 * SAFE MODE y Master Key se mantienen sin tocar.
 */

import { useEffect, useRef } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession } from "@/lib/auth";
import { SAFE_MODE_CLIENT } from "@/lib/auth/dev/safeMode";
import type { Session as YapoSession } from "@/lib/auth/types";
import type { RoleId } from "@/lib/auth";

const EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;

function nextAuthToYapoSession(
  userId: string,
  role: RoleId,
  expires?: Date
): YapoSession {
  return {
    sessionId: `auth-${userId}`,
    identity: {
      userId,
      roles: [role],
      verified: true,
    },
    expiresAt: expires ? expires.getTime() : Date.now() + EXPIRES_MS,
  };
}

export function AuthSessionBridge({ children }: { children: React.ReactNode }) {
  const { data: authSession, status } = useNextAuthSession();
  const { setSession, isSafeMode } = useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (SAFE_MODE_CLIENT || isSafeMode) return;

    if (status === "authenticated" && authSession?.user) {
      const user = authSession.user as { id?: string; role?: RoleId };
      const userId = user.id ?? (authSession.user as { id?: string }).id ?? "";
      const role: RoleId =
        user.role && ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"].includes(user.role)
          ? (user.role as RoleId)
          : "vale";
      if (userId && userId !== lastUserId.current) {
        lastUserId.current = userId;
        const exp = authSession.expires ? new Date(authSession.expires * 1000) : undefined;
        setSession(nextAuthToYapoSession(userId, role, exp));
      }
    } else if (status === "unauthenticated") {
      lastUserId.current = null;
      setSession(null);
    }
  }, [status, authSession, setSession, isSafeMode]);

  return <>{children}</>;
}
