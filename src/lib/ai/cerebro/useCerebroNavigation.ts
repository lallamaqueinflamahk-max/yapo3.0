"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CerebroResult } from "./types";

function buildHref(screen: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return screen;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      search.set(k, String(v));
    }
  }
  const qs = search.toString();
  return qs ? `${screen}?${qs}` : screen;
}

/**
 * Navega cuando cerebroResult tiene navigationTarget.
 * useEffect: si cerebroResult?.navigationTarget, router.push(screen, params como query).
 */
export function useCerebroNavigation(cerebroResult: CerebroResult | null | undefined): void {
  const router = useRouter();
  const pushedRef = useRef<string | null>(null);

  useEffect(() => {
    const target = cerebroResult?.navigationTarget;
    if (!target?.screen) {
      pushedRef.current = null;
      return;
    }

    const href = buildHref(target.screen, target.params);
    if (pushedRef.current === href) return;
    pushedRef.current = href;

    router.push(href);
  }, [cerebroResult?.navigationTarget, router]);
}
