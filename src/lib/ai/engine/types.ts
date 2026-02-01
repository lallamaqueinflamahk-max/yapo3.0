/**
 * Tipos del motor de razonamiento del Cerebro.
 * Salida: sugerencias, acciones, rutas de navegación.
 */

import type { IntentKind as KBIntentKind } from "@/lib/ai/knowledge-base/intents";

export type IntentKind = KBIntentKind;

export interface Suggestion {
  id: string;
  text: string;
  /** Query sugerida al hacer clic (refina búsqueda) */
  query?: string;
}

export interface Action {
  id: string;
  label: string;
  /** Ruta a navegar */
  href: string;
  description?: string;
}

export interface NavRoute {
  path: string;
  label: string;
  description?: string;
}

export interface CerebroResult {
  intent: IntentKind;
  suggestions: Suggestion[];
  actions: Action[];
  routes: NavRoute[];
  /** Mensaje breve del asistente (ej. "Encontré opciones relacionadas") */
  message?: string;
  /** Pantalla a la que guiar (desde base de conocimiento JSON) */
  screen?: string;
  /** Acciones sugeridas según contexto (desde base JSON) */
  suggestedActions?: string[];
}
