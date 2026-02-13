/**
 * Capa de voz YAPÓ: VoiceEngine (ElevenLabs + fallback SpeechSynthesis).
 * Voz nunca bloquea la respuesta.
 */

export {
  createVoiceEngine,
  getVoiceEngine,
} from "./voiceEngine";
export type {
  VoiceEngineHandle,
  VoiceEngineOptions,
  TextToSpeechResult,
} from "./voiceEngine";
