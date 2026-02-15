"use client";

import type { Escudo } from "@/lib/wallet";

const ESCUDO_LABELS: Record<string, string> = {
  biometrico: "Biometría",
  tiempo: "Tiempo",
  monto: "Límite monto",
  territorial: "Territorial",
};

export interface EscudosChipsProps {
  escudos: Escudo[];
  className?: string;
}

/**
 * Chips visuales de escudos activos. Solo lectura; no modifica estado.
 */
export default function EscudosChips({ escudos, className = "" }: EscudosChipsProps) {
  const active = escudos.filter((e) => e.enabled);
  if (active.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white/80 p-4 ${className}`}
      aria-label="Escudos activos"
    >
      <h2 className="mb-3 text-sm font-semibold text-yapo-blue">Escudos activos</h2>
      <ul className="flex flex-wrap gap-2">
        {active.map((e) => (
          <li key={e.id}>
            <span
              className="btn-interactive inline-flex min-h-[40px] items-center rounded-full border-2 border-yapo-blue/40 bg-yapo-blue/10 px-4 py-2 text-sm font-semibold text-yapo-blue shadow-sm hover:bg-yapo-blue/20"
              title={e.kind}
            >
              {ESCUDO_LABELS[e.kind] ?? e.kind}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
