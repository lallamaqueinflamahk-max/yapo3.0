"use client";

/**
 * Si el usuario está autenticado (no SAFE MODE) y no tiene consentimiento vigente, redirige a /consent.
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import { SAFE_MODE_CLIENT } from "@/lib/auth/dev/safeMode";

const CONSENT_PATH = "/consent";
const LOGIN_PATH = "/login";
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/consent"];
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/consent"];

function isPublicPath(path: string | null): boolean {
  if (!path) return true;
  return PUBLIC_PATHS.includes(path) || path === "/legal/privacy" || path === "/legal/terms";
}

export function ConsentGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { identity, isSafeMode } = useSession();
  const consentChecked = useRef(false);

  useEffect(() => {
    if (SAFE_MODE_CLIENT || isSafeMode) return;
    if (AUTH_PATHS.some((p) => pathname?.startsWith(p))) return;

    if (!identity?.userId) {
      if (!isPublicPath(pathname ?? null)) {
        router.replace(LOGIN_PATH);
      }
      return;
    }
    if (identity.userId === "dev-master" || identity.userId === "safe-user") return;

    if (consentChecked.current) return;
    consentChecked.current = true;

    fetch("/api/auth/consent-check")
      .then((r) => r.json())
      .then((data) => {
        if (data.required === true) {
          router.replace(CONSENT_PATH);
        }
      })
      .catch(() => {})
      .finally(() => {
        consentChecked.current = false;
      });
  }, [pathname, identity?.userId, isSafeMode, router]);

  return <>{children}</>;
}
