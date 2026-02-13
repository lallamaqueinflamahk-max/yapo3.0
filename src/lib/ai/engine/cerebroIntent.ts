/**
 * Intent object que el Cerebro recibe (no strings sueltos).
 * Cada chip emite un CerebroIntent; el engine ejecuta búsqueda, navegación o acción directa.
 */

export type CerebroIntentType = "search" | "navigate" | "action";

export interface CerebroIntent {
  /** Tipo: búsqueda en Cerebro, navegación a pantalla, o acción directa. */
  type: CerebroIntentType;
  /** Texto para el Cerebro (cuando type === "search"). */
  query?: string;
  /** Ruta a la que ir (cuando type === "navigate"). */
  screen?: string;
  /** ID de acción canónica (ej. wallet:view). */
  actionId?: string;
  /** Etiqueta para UI y accesibilidad. */
  label: string;
  /** Origen del chip: intent, contextual, conversacional. */
  source?: "intent" | "contextual" | "conversational";
}
