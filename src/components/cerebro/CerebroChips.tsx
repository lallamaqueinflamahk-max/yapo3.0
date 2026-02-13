"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import Chips from "./Chips";
import { buildCerebroContext } from "@/lib/ai/cerebroContext";
import { decide, toDecideContext } from "@/lib/ai/intents";
import type { CerebroIntent } from "@/lib/ai/intents";

export interface CerebroChipsWrapperProps {
  /** Si se pasa, se llama con el intent antes de ejecutar (permite override). */
  onIntent?: (intent: CerebroIntent) => void;
  className?: string;
}

/**
 * Wrapper de chips MVP: al tocar un chip emite intent → Cerebro decide → ejecuta resultado.
 * - Navegar: router.push(navigationTarget)
 * - Buscar: router.push(/cerebro?q=...)
 * - Más opciones: abre bottom sheet (controlado por resultado del Cerebro)
 * No hardcodea navegación: el Cerebro decide siempre.
 */
export default function CerebroChips({
  onIntent: onIntentProp,
  className = "",
}: CerebroChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { identity } = useSession();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const decideContext = useMemo(() => {
    const cerebroCtx = buildCerebroContext({
      identity: identity
        ? { userId: identity.userId, roles: identity.roles, verified: identity.verified }
        : null,
      permissions: [],
      screen: pathname ?? "/",
    });
    return toDecideContext(cerebroCtx);
  }, [identity, pathname]);

  const handleIntent = useCallback(
    (intent: CerebroIntent) => {
      if (onIntentProp) {
        onIntentProp(intent);
        return;
      }
      const result = decide(decideContext, intent);

      if (result.intentId === "action.show_more_options" && result.allowed) {
        setMoreSheetOpen(true);
        return;
      }

      if (result.allowed && result.navigationTarget) {
        router.push(result.navigationTarget);
        return;
      }

      if (result.allowed && (result.intentId.startsWith("search.") || result.intentId === "info.explain_feature")) {
        const query =
          typeof intent.payload?.query === "string"
            ? intent.payload.query
            : intent.label ?? intent.intentId;
        router.push(`/cerebro?q=${encodeURIComponent(query)}`);
        return;
      }

      if (!result.allowed && result.reason) {
        router.push(`/cerebro?q=${encodeURIComponent(result.message)}`);
      }
    },
    [decideContext, onIntentProp, router]
  );

  return (
    <Chips
      onIntent={handleIntent}
      moreSheetOpen={moreSheetOpen}
      onMoreSheetClose={() => setMoreSheetOpen(false)}
      className={className}
    />
  );
}
