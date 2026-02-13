"use client";

import { useState } from "react";
import type { BarResult } from "@/lib/cerebro";
import CerebroBarResult from "./CerebroBarResult";

export interface HistoryEntry {
  id: string;
  query: string;
  result: BarResult;
  timestamp: number;
}

export interface CerebroBarHistoryProps {
  entries: HistoryEntry[];
  /** Máximo de entradas a mostrar en la lista colapsada. */
  maxCollapsed?: number;
  className?: string;
}

/**
 * Historial de consultas al Cerebro: lista de query + resultado.
 * Cada ítem muestra la query y, al expandir o al ser el último, el resultado completo.
 */
export default function CerebroBarHistory({
  entries,
  maxCollapsed = 5,
  className = "",
}: CerebroBarHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    entries.length > 0 ? entries[entries.length - 1].id : null
  );

  if (entries.length === 0) return null;

  const visible = entries.slice(-maxCollapsed);
  const lastId = entries[entries.length - 1]?.id;

  return (
    <section
      className={`space-y-3 ${className}`}
      aria-label="Historial del Cerebro"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-yapo-blue/70">
        Historial
      </h2>
      <ul className="flex flex-col gap-2">
        {visible.map((entry) => {
          const isExpanded = expandedId === entry.id || entry.id === lastId;
          return (
            <li
              key={entry.id}
              className="rounded-xl border border-yapo-blue/15 bg-yapo-white/80 shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded && entry.id !== lastId ? null : entry.id)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-yapo-blue active:bg-yapo-blue/5"
                aria-expanded={isExpanded}
                aria-controls={`cerebro-history-${entry.id}`}
              >
                <span className="truncate">{entry.query || "Consulta"}</span>
                <span
                  className={`ml-2 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  ▼
                </span>
              </button>
              {isExpanded && (
                <div
                  id={`cerebro-history-${entry.id}`}
                  className="border-t border-yapo-blue/10 px-4 pb-4 pt-2"
                >
                  <CerebroBarResult result={entry.result} query={entry.query} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
