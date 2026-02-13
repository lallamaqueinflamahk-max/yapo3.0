"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CerebroIntent, CerebroResult } from "@/lib/ai/cerebro";
import { runWithIntent, buildIntentContext } from "@/lib/ai/cerebroEngine";
import type { CerebroRole } from "@/lib/ai/cerebro";
import type { CategoryChipConfig, CategoryId } from "@/data/category-chips";
import { recordChipClick } from "@/data/bubble-chips-dynamic";
import { getMockRecentUsers, type ChipRecentUser } from "@/data/chip-stats-mock";

export type CategoryBubbleChipProps = {
  chip: CategoryChipConfig;
  currentRole: CerebroRole;
  userId: string;
  onResult?: (result: CerebroResult) => void;
  /** Llamado al actualizar estadística local (preparado para backend analítica) */
  onStatsChange?: (chipId: string, clicks: number) => void;
  /** Mostrar estadísticas en tiempo real (clicks, últimos usuarios) */
  showStats?: boolean;
  /** Chip seleccionado / activo (filtro aplicado) → pulso de color */
  selected?: boolean;
  /** Deshabilitado si no aplica al rol o contexto */
  disabled?: boolean;
  /** Mostrar tooltip con mini-info al hover / tap */
  showTooltip?: boolean;
  className?: string;
};

/** Colores por categoría: paleta Paraguay colorida (vivos y distintivos) */
const CATEGORY_STYLES: Record<
  CategoryId,
  { bg: string; border: string; text: string; shadow: string; hover: string; selected: string }
> = {
  oficios: {
    bg: "bg-yapo-blue-light",
    border: "border-yapo-blue/50",
    text: "text-yapo-blue",
    shadow: "shadow-[0_4px_14px_rgba(0,35,149,0.2)]",
    hover: "hover:bg-yapo-blue/20 hover:shadow-[0_8px_24px_rgba(0,35,149,0.25)]",
    selected: "ring-2 ring-yapo-blue ring-offset-2",
  },
  movilidad: {
    bg: "bg-yapo-amber-light",
    border: "border-yapo-amber/50",
    text: "text-yapo-amber-dark",
    shadow: "shadow-[0_4px_14px_rgba(232,163,23,0.2)]",
    hover: "hover:bg-yapo-amber/20 hover:shadow-[0_8px_24px_rgba(232,163,23,0.25)]",
    selected: "ring-2 ring-yapo-amber ring-offset-2",
  },
  cuidados: {
    bg: "bg-yapo-red-light",
    border: "border-yapo-red/40",
    text: "text-yapo-red",
    shadow: "shadow-[0_4px_14px_rgba(213,43,30,0.15)]",
    hover: "hover:bg-yapo-red/20 hover:shadow-[0_8px_24px_rgba(213,43,30,0.2)]",
    selected: "ring-2 ring-yapo-red ring-offset-2",
  },
  profesional: {
    bg: "bg-yapo-emerald-light",
    border: "border-yapo-emerald/50",
    text: "text-yapo-emerald",
    shadow: "shadow-[0_4px_14px_rgba(5,150,105,0.2)]",
    hover: "hover:bg-yapo-emerald/20 hover:shadow-[0_8px_24px_rgba(5,150,105,0.25)]",
    selected: "ring-2 ring-yapo-emerald ring-offset-2",
  },
  escudos: {
    bg: "bg-yapo-red-light",
    border: "border-yapo-red/50",
    text: "text-yapo-red",
    shadow: "shadow-[0_4px_14px_rgba(213,43,30,0.2)]",
    hover: "hover:bg-yapo-red/25 hover:shadow-[0_8px_24px_rgba(213,43,30,0.3)]",
    selected: "ring-2 ring-yapo-red ring-offset-2",
  },
};

/** Contador de clicks y últimos usuarios (mock); preparado para backend analítica */
function useChipStats(
  chipId: string,
  showStats: boolean,
  onStatsChange?: (chipId: string, clicks: number) => void
): { clicks: number; recentUsers: string[]; increment: () => void } | null {
  const [clicks, setClicks] = useState(0);
  const recentUsers = ["Vos", "Usuario 2", "Usuario 3"].slice(0, 1 + (clicks % 2));
  const increment = useCallback(() => {
    setClicks((c) => {
      const next = c + 1;
      onStatsChange?.(chipId, next);
      return next;
    });
  }, [chipId, onStatsChange]);
  return showStats ? { clicks, recentUsers, increment } : null;
}

/**
 * Chip bubble mejorado: interactivo, animado, feedback visual inmediato.
 * Emite CerebroIntent con payload { chipId, tipo, rol, categoría, extra }.
 * decide(intent) → CerebroResult: navegación, filtrado feed, activación escudos.
 * Tap → scale 1.1→1; Hover → sombra/glow; Activo → pulso. Transición 0.2s.
 * Tooltip con mini-info (clicks, últimos usuarios). Estados: activo, deshabilitado.
 */
export default function CategoryBubbleChip({
  chip,
  currentRole,
  userId,
  onResult,
  onStatsChange,
  showStats = false,
  selected = false,
  disabled = false,
  showTooltip = true,
  className = "",
}: CategoryBubbleChipProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "denied">("idle");
  const [lastResult, setLastResult] = useState<CerebroResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const stats = useChipStats(chip.id, showStats, onStatsChange);

  const style = CATEGORY_STYLES[chip.category] ?? CATEGORY_STYLES.oficios;
  const suggestedActions = lastResult?.suggestedActions ?? [];
  const isDisabled = disabled || status === "loading";

  /** Payload completo: chipId, tipo, rol, categoría, extra */
  const buildPayload = useCallback(() => {
    const tipo = chip.category === "escudos" ? "escudo" : "categoria";
    return {
      chipId: chip.id,
      tipo,
      rol: currentRole,
      categoría: chip.category,
      subcategoría: chip.subcategory,
      ...chip.payload,
      category: chip.category,
      subcategory: chip.subcategory,
    } as Record<string, unknown>;
  }, [chip.id, chip.category, chip.subcategory, chip.payload, currentRole]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    stats?.increment?.();
    recordChipClick(chip.id);
    setStatus("loading");
    const context = buildIntentContext({
      userId,
      role: currentRole,
      currentScreen: typeof window !== "undefined" ? window.location.pathname : "/",
    });
    const intent: CerebroIntent = {
      intentId: chip.intentId,
      payload: buildPayload(),
      source: "chip",
    };
    const result = runWithIntent(intent, context);
    setLastResult(result);
    onResult?.(result);
    if (!onResult && result.navigationTarget?.screen) {
      router.push(result.navigationTarget.screen);
    }

    setStatus(result.allowed === false ? "denied" : "success");
    setExpanded(true);
    setTooltipVisible(false);
    setTimeout(() => setStatus("idle"), 500);
  }, [chip.intentId, buildPayload, currentRole, userId, router, onResult, stats, isDisabled]);

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

  const showPanel = expanded && (lastResult?.message || suggestedActions.length > 0 || (showStats && stats));
  const tooltipText = showTooltip && stats
    ? `${stats.clicks} clicks · Recientes: ${stats.recentUsers.join(", ")}`
    : chip.jobsCount != null
      ? `${chip.jobsCount} trabajos recientes`
      : chip.label;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        title={tooltipText}
        className={`
          bubble-transition bubble-tap-scale bubble-hover-glow flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5
          text-center text-sm font-semibold touch-manipulation
          ${style.bg} ${style.border} ${style.text} ${style.shadow}
          ${!isDisabled ? style.hover : ""}
          ${selected ? `bubble-active-pulse ${style.selected}` : ""}
          ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${status === "loading" ? "opacity-70 pointer-events-none" : ""}
          ${status === "success" ? "ring-2 ring-green-400/60" : ""}
          ${status === "denied" ? "ring-2 ring-yapo-red/50" : ""}
        `}
        aria-label={chip.label}
        aria-expanded={expanded}
        aria-busy={status === "loading"}
        aria-disabled={isDisabled}
        aria-pressed={selected}
      >
        <span className="text-lg leading-none" aria-hidden>
          {status === "loading" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            chip.icon
          )}
        </span>
        <span className="truncate max-w-[100px]">{chip.label}</span>
        {(showStats && stats) || chip.jobsCount != null ? (
          <span className="ml-0.5 shrink-0 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-medium opacity-90">
            {showStats && stats ? stats.clicks : chip.jobsCount ?? 0}
          </span>
        ) : null}
      </button>

      {/* Tooltip: mini-info al hover / focus (y al tap en móvil vía title) */}
      {showTooltip && tooltipVisible && !expanded && (stats || chip.jobsCount != null) && (
        <div
          className="absolute left-1/2 top-full z-20 mt-1.5 w-[160px] -translate-x-1/2 rounded-lg border border-black/10 bg-black/90 px-2.5 py-2 text-center text-[10px] text-white shadow-lg"
          role="tooltip"
        >
          {stats ? (
            <>
              <p className="font-medium">{stats.clicks} clicks</p>
              <p className="mt-0.5 opacity-90">Recientes: {stats.recentUsers.join(", ")}</p>
            </>
          ) : (
            <p>{chip.jobsCount} trabajos recientes</p>
          )}
        </div>
      )}

      {/* Panel expandido: resultado Cerebro + acciones */}
      {showPanel && (
        <div
          ref={panelRef}
          className="absolute left-1/2 top-full z-10 mt-2 w-[220px] -translate-x-1/2 rounded-xl border border-black/10 bg-white p-3 shadow-lg"
          role="region"
          aria-label="Resultado"
        >
          {lastResult?.message && (
            <p className="mb-2 text-xs text-black/80">{lastResult.message}</p>
          )}
          {suggestedActions.length > 0 && (
            <>
              <p className="mb-1.5 text-xs font-medium text-yapo-blue/80">Acciones</p>
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
                    className="mb-1 w-full rounded-lg bg-yapo-blue/5 px-3 py-2 text-left text-xs text-yapo-blue active:bg-yapo-blue/15"
                  >
                    {action.intentId}
                  </button>
                );
              })}
            </>
          )}
          {showStats && stats && stats.recentUsers.length > 0 && (
            <p className="mt-2 border-t border-black/10 pt-2 text-[10px] text-black/60">
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
