/**
 * OpenAI Whisper: STT por API.
 * Arquitectura preparada; integración real cuando se configure OPENAI_API_KEY.
 * Mismo flujo: micrófono → audio → transcripción (en servidor).
 */

import type { IVoiceCapture, TranscriptResult } from "../types";

export interface WhisperCaptureOptions {
  /** API key (o process.env.OPENAI_API_KEY en servidor). */
  apiKey?: string;
  /** Idioma preferido (ej. "es"). */
  lang?: string;
  /** Callback con transcripción (interim/final según API). */
  onTranscript?: (result: TranscriptResult) => void;
}

let listening = false;
let transcriptCallback: ((result: TranscriptResult) => void) | null = null;

/**
 * Crea un capturador de voz que usa OpenAI Whisper para transcripción.
 * Stub: devuelve implementación que no graba hasta que se integre la API.
 */
export function createWhisperCapture(_options: WhisperCaptureOptions = {}): IVoiceCapture {
  return {
    async start(): Promise<boolean> {
      // TODO: cuando OPENAI_API_KEY esté configurado, iniciar grabación y enviar chunks a Whisper.
      listening = false;
      return false;
    },
    stop(): void {
      listening = false;
    },
    onTranscript(callback: (result: TranscriptResult) => void): void {
      transcriptCallback = callback;
    },
    get isListening(): boolean {
      return listening;
    },
    async getAudioBlob(): Promise<Blob | null> {
      // Para Whisper: devolver el blob grabado y enviarlo a /v1/audio/transcriptions.
      return null;
    },
  };
}
