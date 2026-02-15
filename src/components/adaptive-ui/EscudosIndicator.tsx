"use client";

import Link from "next/link";
import IconEscudo from "@/components/icons/IconEscudo";
import type { DashboardConfig } from "@/lib/adaptive-ui";

interface EscudosIndicatorProps {
  /** Etiqueta: "Mis Escudos" o "Seguro Colectivo Activo" según rol */
  label?: string;
  config?: DashboardConfig | null;
  /** Nivel opcional (ej. "Activo", "3/4") para mostrar junto al label */
  level?: string;
  className?: string;
}

/**
 * Indicador de estatus de escudos en header.
 * No es un botón más: muestra el nivel de protección actual.
 * PYME/Enterprise: "Seguro Colectivo Activo".
 */
export default function EscudosIndicator({ label, config, level, className = "" }: EscudosIndicatorProps) {
  const text = config?.escudo_label ?? label ?? "Mis Escudos";
  const display = level ? `${text} · ${level}` : text;

  return (
    <Link
      href="/escudos"
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-yapo-blue/30 bg-yapo-blue-light/40 px-3 py-1.5 text-xs font-medium text-yapo-blue transition-[background,border-color] active:bg-yapo-blue/20 ${className}`}
      aria-label={`Estado de protección: ${display}`}
    >
      <IconEscudo className="h-5 w-5 shrink-0" />
      <span className="max-w-[140px] truncate">{display}</span>
    </Link>
  );
}
