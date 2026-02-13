/**
 * Salida de voz: Web Speech Synthesis (actual).
 * Preparado para reemplazar por ElevenLabs (mismo IVoiceOutput).
 */

import { createWebSpeechOutput } from "./web-speech-output";
import type { IVoiceOutput } from "../types";

/** Crea el reproductor de voz por defecto (Web Speech). Para ElevenLabs: crear implementación que llame a la API con voiceId/tone. */
export function createVoiceOutput(): IVoiceOutput {
  return createWebSpeechOutput();
}

export { createWebSpeechOutput } from "./web-speech-output";
export {
  createSpeechSynthesis,
  type SpeechSynthesisLang,
  type SpeechSynthesisAPIOptions,
  type SpeechSynthesisAPIHandle,
} from "./speech-synthesis-api";
