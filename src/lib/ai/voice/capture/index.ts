/**
 * Captura de voz: Web Speech API (actual).
 * Preparado para reemplazar por OpenAI Whisper (mismo IVoiceCapture).
 */

import { createWebSpeechCapture } from "./web-speech-capture";
import type { IVoiceCapture } from "../types";

/** Crea el capturador de voz por defecto (Web Speech). Para Whisper: crear implementación que use getAudioBlob + API. */
export function createVoiceCapture(lang = "es-ES"): IVoiceCapture {
  return createWebSpeechCapture(lang);
}

export { createWebSpeechCapture } from "./web-speech-capture";
export {
  createWebSpeechAPI,
  type WebSpeechAPIOptions,
  type WebSpeechAPIHandle,
} from "./web-speech-api";