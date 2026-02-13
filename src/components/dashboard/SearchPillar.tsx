"use client";

import React from "react";

export type QuickFilterType = "certificado" | "amateur" | "kavaju" | null;

export interface SearchPillarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onQuerySubmit?: () => void;
  /** Si true, solo muestra la barra "Buscador YAPÓ" + botón Buscar (sin chips ni Mbareté). */
  simple?: boolean;
  /** Solo cuando simple=false */
  quickFilter?: QuickFilterType;
  onQuickFilterChange?: (value: QuickFilterType) => void;
  soloEquiposMbareté?: boolean;
  onSoloEquiposMbaretéChange?: (value: boolean) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Pilar de búsqueda: modo simple (solo barra YAPÓ) o completo con filtros rápidos.
 */
export default function SearchPillar({
  query,
  onQueryChange,
  onQuerySubmit,
  simple = true,
  quickFilter = null,
  onQuickFilterChange,
  soloEquiposMbareté = false,
  onSoloEquiposMbaretéChange,
  placeholder = "ej. plomero Fernando de la Mora San Miguel",
  className = "",
}: SearchPillarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onQuerySubmit?.();
  };

  return (
    <section
      className={`rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm ${className}`}
      aria-label={simple ? "Buscador YAPÓ" : "Búsqueda solución inmediata"}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/90">
        {simple ? "Buscador YAPÓ" : "Solución inmediata"}
      </h2>

      <div className="relative mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-yapo-blue/25 bg-yapo-blue-light/10 py-3 pl-4 pr-10 text-base text-yapo-blue placeholder:text-yapo-blue/60 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20"
          aria-label={placeholder}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-yapo-blue/60" aria-hidden>🔍</span>
      </div>
      {onQuerySubmit && (
        <button
          type="button"
          onClick={onQuerySubmit}
          className="w-full rounded-xl bg-yapo-blue py-2.5 text-sm font-semibold text-white transition-[transform,background] active:scale-[0.99] active:bg-yapo-blue-dark"
        >
          Buscar
        </button>
      )}

      {!simple && (
        <>
          <p className="mb-2 mt-4 text-xs font-medium text-foreground/70">Filtros rápidos</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "certificado" as const, label: "Profesional Certificado" },
              { id: "amateur" as const, label: "Amateur / Práctico" },
              { id: "kavaju" as const, label: "Kavaju (Emergencias)" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onQuickFilterChange?.(quickFilter === id ? null : id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  quickFilter === id ? "bg-yapo-blue text-white shadow-md" : "bg-yapo-blue-light/30 text-yapo-blue hover:bg-yapo-blue/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-yapo-blue/15 bg-yapo-blue-light/10 px-3 py-2.5">
            <input
              type="checkbox"
              checked={soloEquiposMbareté}
              onChange={(e) => onSoloEquiposMbaretéChange?.(e.target.checked)}
              className="h-4 w-4 rounded border-yapo-blue/40 text-yapo-blue focus:ring-yapo-blue"
              aria-describedby="mbarete-filter-desc"
            />
            <span id="mbarete-filter-desc" className="text-sm text-foreground/90">
              Mostrar solo equipos recomendados por líderes de mi zona
            </span>
          </label>
        </>
      )}
    </section>
  );
}
