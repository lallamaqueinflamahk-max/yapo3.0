/**
 * Elegibilidad para atención por voz (ElevenLabs) — regla 6.
 * SOLO habilitada para:
 * a) Subscribers premium
 * b) Pymes activas
 * c) Enterprises
 * d) Usuarios MBareté con +500 referidos
 * Tono: humano, claro, empático y profesional.
 */

export type UserTier =
  | "vale"
  | "capeto"
  | "kavaju"
  | "mbareté"
  | "subscriber_premium"
  | "pyme"
  | "enterprise";

export interface VoiceEligibilityContext {
  tier: UserTier;
  isPremiumSubscriber?: boolean;
  isPymeActive?: boolean;
  isEnterprise?: boolean;
  /** Solo para mbareté: cantidad de referidos */
  referidosCount?: number;
}

export const MBARETE_REFERIDOS_MIN = 500;

/**
 * Indica si el usuario puede usar atención por voz (ElevenLabs).
 */
export function canUseVoice(ctx: VoiceEligibilityContext): boolean {
  if (ctx.isPremiumSubscriber) return true;
  if (ctx.isPymeActive) return true;
  if (ctx.isEnterprise) return true;
  if (ctx.tier === "mbareté" && (ctx.referidosCount ?? 0) >= MBARETE_REFERIDOS_MIN) {
    return true;
  }
  return false;
}

export const VOICE_TONE = {
  human: true,
  clear: true,
  empathetic: true,
  professional: true,
} as const;
