"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CerebroIntent, CerebroResult } from "@/lib/ai/cerebro";
import { runWithIntent, buildIntentContext } from "@/lib/ai/cerebroEngine";
import type { CerebroRole } from "@/lib/ai/cerebro";
import type { RoleChipConfig } from "@/data/role-chips";

export type RoleBubbleChipProps = {
  chip: RoleChipConfig;
  currentRole: CerebroRole;
  userId: string;
  onResult?: (result: CerebroResult) => void;
  /** Mini-estadísticas mock: clicks, usuarios recientes */
  showStats?: boolean;
  className?: string;
};

const ROLE_STYLES: Record<
  string,
  { bg: string; border: string; text: string; hover: string; active: string; animation: string; glow?: string }
> = {
  vale: {
    bg: "bg-yapo-emerald-light",
    border: "border-yapo-emerald/50",
    text: "text-yapo-emerald",
    hover: "hover:bg-yapo-emerald/20 hover:shadow-lg",
    active: "active:scale-95 active:bg-yapo-emerald/25",
    animation: "animate-role-soft",
    glow: "hover:shadow-[0_0_16px_rgba(5,150,105,0.25)]",
  },
  capeto: {
    bg: "bg-yapo-blue-light",
    border: "border-yapo-blue/50",
    text: "text-yapo-blue",
    hover: "hover:bg-yapo-blue/20 hover:shadow-lg",
    active: "active:scale-95 active:bg-yapo-blue/25",
    animation: "animate-role-bounce",
    glow: "hover:shadow-[0_0_16px_rgba(0,35,149,0.25)]",
  },
  kavaju: {
    bg: "bg-yapo-amber-light",
    border: "border-yapo-amber/50",
    text: "text-yapo-amber-dark",
    hover: "hover:bg-yapo-amber/25 hover:shadow-lg",
    active: "active:scale-95 active:bg-yapo-amber/30",
    animation: "animate-role-glow",
    glow: "hover:shadow-[0_0_16px_rgba(232,163,23,0.3)]",
  },
  mbarete: {
    bg: "bg-yapo-red-light",
    border: "border-yapo-red/50",
    text: "text-yapo-red",
    hover: "hover:bg-yapo-red/20 hover:shadow-lg",
    active: "active:scale-95 active:bg-yapo-red/25",
    animation: "animate-role-pulse",
    glow: "hover:shadow-[0_0_16px_rgba(213,43,30,0.3)]",
  },
};

/** Mini-stats mock: clicks y usuarios recientes */
function useChipStats(chipId: string) {
  const [clicks] = useState(() => Math.floor(Math.random() * 12) + 1);
  const recentUsers = ["Vos", "Usuario 2", "Usuario 3"].slice(0, 1 + (clicks % 2));
  return { clicks, recentUsers };
}

/**
 * Chip bubble por rol: colores y animación según Valé/Capeto/Kavaju/Mbareté.
 * Al tocar: dispara CerebroIntent → decide() → CerebroResult (navegación, opciones secundarias).
 * Tap → escalado; hover → sombra/glow; activo → burbuja pulsante.
 */
export default function RoleBubbleChip({
  chip,
  currentRole,
  userId,
  onResult,
  showStats = false,
  className = "",
}: RoleBubbleChipProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "denied">("idle");
  const [lastResult, setLastResult] = useState<CerebroResult | null>(null);
  const stats = useChipStats(chip.id, showStats ?? false);

  const style = ROLE_STYLES[chip.role] ?? ROLE_STYLES.vale;

  const handleTap = useCallback(() => {
    setStatus("loading");
    const context = buildIntentContext({
      userId,
      role: currentRole,
      currentScreen: typeof window !== "undefined" ? window.location.pathname : "/",
    });
    const intent: CerebroIntent = {
      intentId: chip.intentId,
      payload: {
        chipId: chip.id,
        tipo: "rol",
        rol: currentRole,
        categoría: chip.role,
        ...(chip.payload ?? {}),
      } as Record<string, unknown>,
      source: "chip",
    };
    const result = runWithIntent(intent, context);
    setLastResult(result);
    onResult?.(result);

    if (result.navigationTarget?.screen) {
      router.push(result.navigationTarget.screen);
    }

    setStatus(result.allowed === false ? "denied" : "success");
    setExpanded(true);
    setTimeout(() => setStatus("idle"), 600);
  }, [chip.intentId, chip.payload, currentRole, userId, router, onResult]);

  const suggestedActions = lastResult?.suggestedActions ?? [];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [expanded]);

  const showPanel = expanded && (suggestedActions.length > 0 || (showStats && stats) || lastResult?.message);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={handleTap}
        disabled={status === "loading"}
        className={`
          flex min-h-[48px] min-w-[44px] items-center gap-2.5 rounded-full border-2 px-4 py-3 text-left text-sm font-semibold
          transition-all duration-200 touch-manipulation
          ${style.bg} ${style.border} ${style.text}
          ${style.hover} ${style.active} ${style.glow ?? ""}
          ${status === "loading" ? "opacity-70 pointer-events-none" : ""}
          ${status === "success" ? "ring-2 ring-green-400/60" : ""}
          ${status === "denied" ? "ring-2 ring-yapo-red/50" : ""}
          ${expanded ? style.animation : ""}
        `}
        aria-label={chip.label}
        aria-expanded={expanded}
        aria-busy={status === "loading"}
      >
        <span className="text-lg leading-none" aria-hidden>
          {status === "loading" ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            chip.icon
          )}
        </span>
        <span className="flex flex-col items-start gap-0.5">
          <span className="truncate max-w-[140px]">{chip.label}</span>
          {chip.description && (
            <span className={`text-xs font-normal opacity-80 ${style.text}`}>
              {chip.description}
            </span>
          )}
        </span>
        {showStats && stats && (
          <span className="ml-auto text-xs opacity-70" aria-hidden>
            {stats.clicks} clicks
          </span>
        )}
      </button>

      {/* Opciones secundarias (suggestedActions), mensaje o mini-stats */}
      {showPanel && (
        <div
          ref={panelRef}
          className="absolute left-0 right-0 top-full z-10 mt-2 min-w-[200px] rounded-xl border border-black/10 bg-white p-2 shadow-lg"
          role="region"
          aria-label="Opciones"
        >
          {lastResult?.message && (
            <p className="mb-2 text-xs text-black/70">{lastResult.message}</p>
          )}
          {suggestedActions.length > 0 && (
            <p className="mb-2 text-xs font-medium text-yapo-blue/80">
              Acciones sugeridas
            </p>
          )}
          {suggestedActions.slice(0, 3).map((action, i) => {
            const screen = (action.payload as { screen?: string } | undefined)?.screen;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (screen) router.push(screen);
                  setExpanded(false);
                }}
                className="mb-1 w-full rounded-lg bg-yapo-blue/5 px-3 py-2 text-left text-sm text-yapo-blue active:bg-yapo-blue/15"
              >
                {action.intentId}
              </button>
            );
          })}
          {showStats && stats && stats.recentUsers.length > 0 && (
            <p className="mt-2 border-t border-black/10 pt-2 text-xs text-black/60">
              Recientes: {stats.recentUsers.join(", ")}
            </p>
          )}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-2 w-full rounded-lg bg-black/5 py-1.5 text-xs text-black/60 active:bg-black/10"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
