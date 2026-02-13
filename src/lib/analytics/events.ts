/**
 * Eventos de analytics. trackEvent para intent_executed y otros.
 * Desacoplado del transporte (console, API, provider externo).
 */

export type IntentExecutedPayload = {
  type: "intent_executed";
  intentId: string;
  role: string;
  location?: { lat: number; lng: number } | null;
};

export type AnalyticsEventPayload = IntentExecutedPayload;

const listeners: Array<(payload: AnalyticsEventPayload) => void> = [];

/**
 * Registra un listener para eventos (ej. enviar a API o provider).
 */
export function onTrackEvent(fn: (payload: AnalyticsEventPayload) => void): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

/**
 * Dispara un evento. Los listeners registrados lo reciben.
 * Por defecto también se hace console.debug en desarrollo.
 */
export function trackEvent(payload: AnalyticsEventPayload): void {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.warn("[analytics] listener error", e);
    }
  });
}

/**
 * Atajo para intent_executed.
 */
export function trackIntentExecuted({
  intentId,
  role,
  location,
}: {
  intentId: string;
  role: string;
  location?: { lat: number; lng: number } | null;
}): void {
  trackEvent({
    type: "intent_executed",
    intentId,
    role,
    location,
  });
}
