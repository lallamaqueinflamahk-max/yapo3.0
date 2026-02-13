/**
 * Tipos del motor de razonamiento del Cerebro.
 * Salida: sugerencias, acciones, rutas de navegación.
 * Contexto: ver cerebroContext.ts.
 */

import type { IntentKind as KnowledgeIntentKind } from "@/lib/ai/knowledge";

export type IntentKind = KnowledgeIntentKind;

/** Re-export del contexto (definido en cerebroContext.ts). */
export type { CerebroContext } from "@/lib/ai/cerebroContext";

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
