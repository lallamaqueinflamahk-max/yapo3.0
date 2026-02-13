/**
 * Entrada de voz del Cerebro.
 * Re-exporta captura Web Speech; preparado para Whisper u otro proveedor.
 */

export {
  createWebSpeechCapture,
} from "./capture/web-speech-capture";
export type { IVoiceCapture, TranscriptResult } from "./types";
