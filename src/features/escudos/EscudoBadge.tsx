"use client";

/**
 * Badge visual de un escudo (Insurtech, Fintech, Regalos, Comunidad).
 * UI tipo badge: icono + etiqueta; activo/inactivo; clickeable para activar.
 */

import type { EscudoId } from "./types";
import { ESCUDOS_CONFIG } from "./config";

export interface EscudoBadgeProps {
  escudoId: EscudoId;
  /** Si el escudo está activo (resaltado). */
  active?: boolean;
  /** Callback al hacer click (activar/desactivar o navegar). */
  onClick?: (escudoId: EscudoId) => void;
  /** Tamaño: sm | md | lg. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "min-h-[32px] px-2.5 py-1.5 text-xs gap-1.5",
  md: "min-h-[40px] px-3 py-2 text-sm gap-2",
  lg: "min-h-[48px] px-4 py-2.5 text-base gap-2.5",
};

const ICON_SIZES = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

/**
 * Badge de un escudo: icono + label; activo = borde y fondo resaltado.
 */
export default function EscudoBadge({
  escudoId,
  active = false,
  onClick,
  size = "md",
  className = "",
}: EscudoBadgeProps) {
  const config = ESCUDOS_CONFIG[escudoId];
  if (!config) return null;

  const isSecurity = config.layer === "security";
  const baseClasses =
    "inline-flex items-center rounded-full border-2 font-medium transition-[transform,box-shadow] touch-manipulation";
  const activeSecurity =
    "border-yapo-blue bg-yapo-blue/15 text-yapo-blue shadow-[0_2px_8px_rgba(0,35,149,0.2)]";
  const activeBenefit =
    "border-yapo-red/50 bg-yapo-red/10 text-yapo-red shadow-[0_2px_8px_rgba(213,43,30,0.2)]";
  const inactive =
    "border-black/15 bg-black/5 text-black/70 hover:border-yapo-blue/30 hover:bg-yapo-blue/5";

  const styleClasses = active
    ? isSecurity
      ? activeSecurity
      : activeBenefit
    : inactive;

  return (
    <button
      type="button"
      onClick={() => onClick?.(escudoId)}
      className={`
        ${baseClasses}
        ${SIZE_CLASSES[size]}
        ${styleClasses}
        ${onClick ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}
        ${className}
      `}
      aria-label={config.label}
      aria-pressed={active}
      title={config.description}
    >
      <span className={`shrink-0 leading-none ${ICON_SIZES[size]}`} aria-hidden>
        {config.icon}
      </span>
      <span className="truncate">{config.label}</span>
    </button>
  );
}
