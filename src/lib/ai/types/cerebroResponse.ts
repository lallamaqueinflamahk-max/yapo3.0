/**
 * Respuesta normalizada del Cerebro.
 * Misma forma para motor local y OpenAI; la voz nunca bloquea.
 */

export interface CerebroResponseAction {
  id: string;
  label: string;
  href?: string;
  description?: string;
}

/** Respuesta estándar del Cerebro (local o OpenAI). */
export interface CerebroResponse {
  /** Mensaje en lenguaje natural para la UI. */
  text: string;
  /** Texto listo para TTS (sin markup). */
  textForTTS: string;
  /** Acciones sugeridas (navegación, etc.). */
  suggestedActions: CerebroResponseAction[];
  /** Navegación principal si aplica. */
  navigation?: { href: string; label: string };
  /** Balance de wallet si aplica. */
  balance?: number;
  /** Permisos del usuario (ej. wallet:view). */
  permissions?: string[];
  /** Si la acción está permitida. */
  actionAllowed?: boolean;
  /** Motivo cuando no permitido. */
  reason?: string;
  /** Paso previo sugerido (no romper flujo). */
  suggestedStep?: { label: string; href: string };
  /** Intent detectado. */
  intentId?: string | null;
  /** Acción canónica (ej. wallet:view). */
  action?: string;
  /** Origen: local | openai (para debug). */
  source?: "local" | "openai";
}
