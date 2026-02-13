"use client";

import Link from "next/link";
import {
  SEMAPHORES_MAP,
  getStateStyle,
  type SemaphoreState,
} from "@/data/semaphores-map";

export interface SemaphoreZone {
  zone: string;
  state: "green" | "yellow" | "red";
}

interface MapSemaforoProps {
  /** Si se pasa, se usa esta lista plana (compatibilidad con API). Si no, se usa solo departamentos. */
  zones?: SemaphoreZone[];
  className?: string;
}

const DOT_STYLES: Record<SemaphoreState, string> = {
  green: "bg-yapo-emerald",
  yellow: "bg-yapo-amber",
  red: "bg-yapo-red",
};

/** Punto de color 8px para estado */
function StateDot({ state }: { state: SemaphoreState }) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${DOT_STYLES[state]}`}
      aria-hidden
    />
  );
}

/**
 * Interfaz simple: título, leyenda en una línea, lista compacta por departamento (o lista plana si zones).
 * Sin acordeones ni jerarquía; el detalle está en /mapa.
 */
export default function MapSemaforo({ zones, className = "" }: MapSemaforoProps) {
  return (
    <section
      className={`rounded-xl border border-yapo-blue/10 bg-yapo-white p-3 ${className}`}
      aria-label="Semáforos por zona"
    >
      <h2 className="text-sm font-semibold text-yapo-blue">
        Semáforos por zona
      </h2>
      <p className="mt-1 text-xs text-foreground/60">
        ● Verde estable · ● Amarillo atención · ● Rojo prioridad
      </p>

      {zones && zones.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {zones.map((z) => (
            <li
              key={z.zone}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-yapo-blue/5"
            >
              <StateDot state={z.state as SemaphoreState} />
              <span className="text-foreground">{z.zone}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {SEMAPHORES_MAP.map((depto) => (
            <li
              key={depto.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-yapo-blue/5"
            >
              <StateDot state={depto.state} />
              <span className="text-foreground">{depto.name}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/mapa"
        className="mt-3 inline-block text-xs font-medium text-yapo-blue underline underline-offset-2 hover:no-underline"
      >
        Ver mapa
      </Link>
    </section>
  );
}
