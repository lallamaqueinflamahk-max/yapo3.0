/**
 * Salida de voz del Cerebro.
 * Re-exporta Web Speech Synthesis; preparado para ElevenLabs u otro proveedor.
 */

export { createWebSpeechOutput } from "./output/web-speech-output";
export type { IVoiceOutput, SpeakOptions } from "./types";
