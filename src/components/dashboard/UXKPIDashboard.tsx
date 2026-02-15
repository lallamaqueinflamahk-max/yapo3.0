"use client";

import { useState, useEffect } from "react";
import { onTrackUX, type TrackUXPayload, type UXMetricId } from "@/lib/analytics/ux-tracking";

const METRIC_LABELS: Record<UXMetricId, string> = {
  time_to_first_search: "Tiempo a 1ª búsqueda",
  clicks_to_result: "Clics hasta resultado",
  scroll_depth: "Profundidad scroll",
  filter_usage: "Uso de filtros",
  abandonment_probability: "Riesgo abandono",
  task_success: "Task success",
};

/** Dashboard de KPIs UX (datos en memoria para demo; en producción conectar a API). */
export default function UXKPIDashboard({ className = "" }: { className?: string }) {
  const [events, setEvents] = useState<TrackUXPayload[]>([]);

  useEffect(() => {
    const unsub = onTrackUX((payload) => {
      setEvents((prev) => [...prev.slice(-99), payload]);
    });
    return unsub;
  }, []);

  const taskSuccessCount = events.filter((e) => e.task === "Ver perfil" || e.task === "Contratar").length;
  const searchCount = events.filter((e) => e.task === "Buscar profesional" && e.metrics.includes("time_to_first_search")).length;

  return (
    <section
      className={`rounded-2xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm ${className}`}
      aria-label="Dashboard KPIs UX"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        KPIs UX – Búsqueda mapa
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-yapo-blue-light/20 p-3">
          <p className="text-2xl font-bold text-yapo-blue">{events.length}</p>
          <p className="text-xs text-foreground/70">Eventos (sesión)</p>
        </div>
        <div className="rounded-xl bg-yapo-emerald/15 p-3">
          <p className="text-2xl font-bold text-yapo-emerald-dark">{taskSuccessCount}</p>
          <p className="text-xs text-foreground/70">Task success</p>
        </div>
        <div className="rounded-xl bg-yapo-amber/15 p-3">
          <p className="text-2xl font-bold text-yapo-amber-dark">{searchCount}</p>
          <p className="text-xs text-foreground/70">Búsquedas</p>
        </div>
        <div className="rounded-xl bg-yapo-blue-light/20 p-3">
          <p className="text-xs font-medium text-foreground/80">Métricas</p>
          <p className="text-[10px] text-foreground/60">
            {(["time_to_first_search", "clicks_to_result", "scroll_depth"] as UXMetricId[])
              .map((id) => METRIC_LABELS[id])
              .join(", ")}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-foreground/50">
        Datos en memoria (dev). Conectar onTrackUX a tu API para producción.
      </p>
    </section>
  );
}
