/**
 * Flags de activación del Cerebro: AI (local | openai) y Voz (local | elevenlabs).
 * Por defecto: local. Nunca exponer API keys al frontend.
 */

export type AIMode = "local" | "openai";
export type VoiceMode = "local" | "elevenlabs";

const AI_MODE_ENV = process.env.NEXT_PUBLIC_AI_MODE?.trim().toLowerCase();
const VOICE_MODE_ENV = process.env.NEXT_PUBLIC_VOICE_MODE?.trim().toLowerCase();

/** Modo de razonamiento: local (rules + KB) o openai (delegado). Por defecto local. */
export function getAIMode(): AIMode {
  if (AI_MODE_ENV === "openai") return "openai";
  return "local";
}

/** Modo de voz: local (SpeechSynthesis) o elevenlabs (API). Por defecto local. */
export function getVoiceMode(): VoiceMode {
  if (VOICE_MODE_ENV === "elevenlabs") return "elevenlabs";
  return "local";
}

/** Si el Cerebro debe delegar razonamiento a OpenAI (solo server-side; el cliente usa /api/ai). */
export const AI_MODE = getAIMode();

/** Si la voz debe usar ElevenLabs (el cliente llama /api/voice; fallback a SpeechSynthesis si falla). */
export const VOICE_MODE = getVoiceMode();
