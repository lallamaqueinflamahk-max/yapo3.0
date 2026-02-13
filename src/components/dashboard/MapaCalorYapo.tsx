"use client";

/**
 * Mapa de calor YAPÓ — estilo panel de control.
 * Áreas con gradiente de calor (rojo → naranja → amarillo → verde → azul)
 * y puntos superpuestos en rojo, amarillo y verde para usuarios por zona.
 */

import { useMemo } from "react";
import { getPuntosMapaCalor, REGIONES_CALOR } from "@/data/mapa-calor-posiciones";
import type { SemaphoreState } from "@/data/semaphores-map";

const REGION_FILL: Record<SemaphoreState, string> = {
  red: "#D52B1E",
  yellow: "#E8A317",
  green: "#059669",
};

const PUNTO_COLOR = {
  red: "var(--yapo-red)",
  yellow: "var(--yapo-amber)",
  green: "var(--yapo-emerald)",
} as const;

export interface MapaCalorYapoProps {
  className?: string;
  /** Ancho del SVG (alto se calcula con aspect ratio). */
  width?: number;
  height?: number;
  /** Mostrar leyenda debajo del mapa */
  showLegend?: boolean;
  /** Título del panel */
  title?: string;
}

export default function MapaCalorYapo({
  className = "",
  width = 400,
  height = 280,
  showLegend = true,
  title = "Panel de control YAPÓ",
}: MapaCalorYapoProps) {
  const puntos = useMemo(() => getPuntosMapaCalor(), []);

  return (
    <section
      className={`overflow-hidden rounded-2xl border-2 border-yapo-blue/20 bg-yapo-blue-dark/95 p-4 text-yapo-white ${className}`}
      aria-label="Mapa de calor por zona"
    >
      <h2 className="mb-2 text-center text-lg font-bold text-yapo-white">{title}</h2>

      {/* Leyenda: puntos rojos, amarillos, verdes (usuarios) */}
      {showLegend && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PUNTO_COLOR.red }}
              aria-hidden
            />
            <span>Zona prioridad / Clientes PRO</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PUNTO_COLOR.yellow }}
              aria-hidden
            />
            <span>Trabajadores activos</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PUNTO_COLOR.green }}
              aria-hidden
            />
            <span>Zona estable / Aliados</span>
          </span>
        </div>
      )}

      {/* Mapa: viewBox 0 0 100 100 para usar % */}
      <div className="rounded-xl bg-yapo-blue/30" style={{ aspectRatio: "100/70" }}>
        <svg
          viewBox="0 0 100 70"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="Mapa de calor con puntos por zona"
        >
          <defs>
            {/* Gradiente suave para dar profundidad al fondo */}
            <linearGradient id="heat-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#002395" />
              <stop offset="100%" stopColor="#001d75" />
            </linearGradient>
          </defs>

          {/* Fondo tipo mapa */}
          <rect width="100" height="70" fill="url(#heat-bg)" />

          {/* Regiones (departamentos): color de calor según estado — rojo / amarillo / verde */}
          <g aria-hidden>
            {REGIONES_CALOR.map((reg) => (
              <polygon
                key={reg.id}
                points={reg.points}
                fill={REGION_FILL[reg.state]}
                fillOpacity={0.75}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.6"
              />
            ))}
          </g>

          {/* Puntos de usuarios: rojo, amarillo, verde */}
          <g aria-label="Puntos por zona">
            {puntos.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={1.8}
                fill={PUNTO_COLOR[p.tipo]}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="0.4"
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}
