"use client";

import React from "react";
import { trackFirstSearch } from "@/lib/analytics/ux-tracking";

export interface SmartSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  /** Ej: 3200 - se muestra como "+3.200 profesionales verificados" */
  professionalsCount?: number;
  className?: string;
}

/**
 * Bloque de búsqueda optimizado para conversión (neuroventas + jerarquía clara).
 * Una sola CTA, microcopy orientado a beneficio, prueba social.
 */
export default function SmartSearch({
  query,
  onQueryChange,
  onSearch,
  professionalsCount = 3200,
  className = "",
}: SmartSearchProps) {
  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed) {
      trackFirstSearch({
        query: trimmed,
        hasZone: /\b(fdm|asunción|asuncion|lambare|luque|central|botánico|sajonia)\b/i.test(trimmed),
      });
    }
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const displayCount =
    professionalsCount >= 1000
      ? `+${Math.floor(professionalsCount / 1000)}.${(professionalsCount % 1000).toString().padStart(3, "0")}`
      : `+${professionalsCount}`;

  return (
    <section
      className={`space-y-4 rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-5 shadow-md ${className}`}
      aria-label="Búsqueda de profesionales"
    >
      <h2 className="text-xl font-semibold text-yapo-petroleo">
        Encontrá profesionales confiables en minutos
      </h2>
      <p className="text-sm text-foreground/70">
        Buscá por oficio y zona · Los resultados aparecen en el mapa
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="¿Qué servicio necesitás hoy?"
        className="w-full h-14 rounded-xl border-2 border-yapo-blue/25 bg-yapo-blue-light/10 px-4 text-lg text-yapo-petroleo placeholder:text-yapo-blue/60 focus:border-yapo-cta focus:outline-none focus:ring-2 focus:ring-yapo-cta/20"
        aria-label="Servicio u oficio a buscar"
      />

      <button
        type="button"
        onClick={handleSubmit}
        className="btn-interactive flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-yapo-cta text-lg font-semibold text-white shadow-md transition-all hover:bg-yapo-cta-hover focus:outline-none focus:ring-2 focus:ring-yapo-cta focus:ring-offset-2 active:scale-[0.98]"
        aria-label="Buscar profesionales cerca mío"
      >
        <span aria-hidden>🔍</span>
        Buscar profesionales cerca mío
      </button>

      <p className="text-sm text-foreground/60">
        {displayCount} profesionales verificados cerca tuyo
      </p>
    </section>
  );
}
