"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { getChipsForRoles } from "@/lib/ai/role-intents";
import type { RoleChip } from "@/lib/ai/role-intents";
import { buildCerebroContext } from "@/lib/ai/cerebroContext";
import { decide, toDecideContext } from "@/lib/ai/intents";
import type { CerebroIntent } from "@/lib/ai/intents";
import type { RoleId } from "@/lib/auth";

function buildIntent(chip: RoleChip): CerebroIntent {
  return {
    intentId: chip.intentId,
    payload: chip.payload,
    label: chip.label,
  };
}

/** Chip bubble por rol: mismo estilo que Chips MVP, tap → intent → Cerebro decide. */
function RoleChipBubble({
  chip,
  onTap,
}: {
  chip: RoleChip;
  onTap: (intent: CerebroIntent) => void;
}) {
  const handleClick = useCallback(() => {
    onTap(buildIntent(chip));
  }, [chip, onTap]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-yapo-blue/40 bg-yapo-blue/10 px-4 py-2.5 text-sm font-semibold text-yapo-blue shadow-sm transition-[transform,background,box-shadow] duration-150 active:scale-95 active:bg-yapo-blue/20 active:shadow-[0_0_12px_rgba(0,56,168,0.2)] touch-manipulation"
      aria-label={chip.label}
    >
      <span className="text-base leading-none" aria-hidden>
        {chip.icon}
      </span>
      <span className="truncate max-w-[120px] sm:max-w-[140px]">{chip.label}</span>
    </button>
  );
}

export interface RoleChipsProps {
  /** Si se pasa, se llama con el intent antes de ejecutar (override). */
  onIntent?: (intent: CerebroIntent) => void;
  /** Máximo de chips visibles (default 8). Contexto > cantidad. */
  maxVisible?: number;
  className?: string;
}

/**
 * Chips contextuales por rol: Valé, Capeto, Kavaju, Mbareté.
 * Detecta rol desde identity, renderiza solo chips útiles para ese rol.
 * Al tocar: emite intent → Cerebro decide → ejecuta. No se muestran chips inútiles.
 */
export default function RoleChips({
  onIntent: onIntentProp,
  maxVisible = 8,
  className = "",
}: RoleChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { identity } = useSession();
  const roles = (identity?.roles ?? []) as RoleId[];

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

  const chips = useMemo(
    () => getChipsForRoles(roles).slice(0, Math.min(maxVisible, 8)),
    [roles, maxVisible]
  );

  const handleIntent = useCallback(
    (intent: CerebroIntent) => {
      if (onIntentProp) {
        onIntentProp(intent);
        return;
      }
      const result = decide(decideContext, intent);

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

      if (!result.allowed && result.message) {
        router.push(`/cerebro?q=${encodeURIComponent(result.message)}`);
      }
    },
    [decideContext, onIntentProp, router]
  );

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="list"
        aria-label="Chips por rol"
      >
        {chips.map((chip) => (
          <div key={chip.id} role="listitem" className="shrink-0">
            <RoleChipBubble chip={chip} onTap={handleIntent} />
          </div>
        ))}
      </div>
    </div>
  );
}
