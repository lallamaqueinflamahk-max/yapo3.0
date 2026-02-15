/**
 * UX tracking: Task Success, abandono, tiempo a primera búsqueda, etc.
 * Uso: trackUX({ task: "Buscar profesional", metrics: [...], ... })
 * Los listeners pueden enviar a API / analytics provider.
 */

export type UXTaskId = "Buscar profesional" | "Ver perfil" | "Contratar" | "Ver mapa";

export type UXMetricId =
  | "time_to_first_search"
  | "clicks_to_result"
  | "scroll_depth"
  | "filter_usage"
  | "abandonment_probability"
  | "task_success";

export interface TrackUXPayload {
  task: UXTaskId | string;
  metrics: UXMetricId[];
  /** Valor opcional para la métrica (ej. scroll_depth: 0.8) */
  values?: Partial<Record<UXMetricId, number>>;
  /** Contexto: zona, oficio, etc. */
  context?: Record<string, string | number | boolean | null>;
  timestamp?: number;
}

const uxListeners: Array<(payload: TrackUXPayload) => void> = [];

export function onTrackUX(fn: (payload: TrackUXPayload) => void): () => void {
  uxListeners.push(fn);
  return () => {
    const i = uxListeners.indexOf(fn);
    if (i !== -1) uxListeners.splice(i, 1);
  };
}

export function trackUX(payload: TrackUXPayload): void {
  const full: TrackUXPayload = {
    ...payload,
    timestamp: payload.timestamp ?? Date.now(),
  };
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.debug("[ux]", full);
  }
  uxListeners.forEach((fn) => {
    try {
      fn(full);
    } catch (e) {
      console.warn("[ux] listener error", e);
    }
  });
}

/** Atajo: primera búsqueda enviada (medir time_to_first_search en backend). */
export function trackFirstSearch(context?: { query: string; hasZone: boolean }) {
  trackUX({
    task: "Buscar profesional",
    metrics: ["time_to_first_search", "filter_usage"],
    context: context ?? undefined,
  });
}

/** Atajo: usuario llegó a un resultado (perfil o contratar). */
export function trackResultEngagement(metric: "Ver perfil" | "Contratar", context?: Record<string, string>) {
  trackUX({
    task: metric,
    metrics: ["clicks_to_result", "task_success"],
    context: context ?? undefined,
  });
}

/** Atajo: profundidad de scroll (0-1). */
export function trackScrollDepth(depth: number) {
  trackUX({
    task: "Buscar profesional",
    metrics: ["scroll_depth"],
    values: { scroll_depth: depth },
  });
}
