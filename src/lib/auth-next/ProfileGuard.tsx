"use client";

/**
 * Si el usuario está autenticado (no SAFE MODE) y profileStatus === "INCOMPLETO",
 * redirige a /profile al intentar acceder a Wallet, Cerebro, Chat, Video o Dashboard.
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import { SAFE_MODE_CLIENT } from "@/lib/auth/dev/safeMode";

const PROFILE_PATH = "/profile";
const BLOCKED_PATHS = ["/wallet", "/cerebro", "/chat", "/dashboard", "/video"];

function isBlockedPath(path: string | null): boolean {
  if (!path) return false;
  return BLOCKED_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { identity, isSafeMode } = useSession();
  const checked = useRef(false);

  useEffect(() => {
    if (SAFE_MODE_CLIENT || isSafeMode) return;
    if (!identity?.userId) return;
    if (identity.userId === "dev-master" || identity.userId === "safe-user") return;
    if (pathname === PROFILE_PATH || !isBlockedPath(pathname ?? null)) return;

    if (checked.current) return;
    checked.current = true;

    fetch("/api/auth/profile-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.profileStatus === "INCOMPLETO") {
          router.replace(PROFILE_PATH);
        }
      })
      .catch(() => {})
      .finally(() => {
        checked.current = false;
      });
  }, [pathname, identity?.userId, isSafeMode, router]);

  return <>{children}</>;
}
