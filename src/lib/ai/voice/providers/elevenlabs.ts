/**
 * ElevenLabs: TTS por API.
 * Arquitectura preparada; integración real cuando se configure ELEVENLABS_API_KEY.
 * Mismo flujo: texto → API → audio → reproducción.
 */

import type { IVoiceOutput, SpeakOptions } from "../types";

export interface ElevenLabsOutputOptions {
  /** API key (o process.env.ELEVENLABS_API_KEY). */
  apiKey?: string;
  /** voice_id de ElevenLabs. */
  voiceId?: string;
  /** Idioma (ej. "es-ES"). */
  lang?: string;
  /** Estabilidad / claridad según API. */
  stability?: number;
  similarityBoost?: number;
}

let speaking = false;

/**
 * Crea un reproductor de voz que usa ElevenLabs para síntesis.
 * Stub: devuelve implementación no-op hasta que se integre la API.
 */
export function createElevenLabsOutput(_options: ElevenLabsOutputOptions = {}): IVoiceOutput {
  return {
    async speak(_text: string, _options?: SpeakOptions): Promise<void> {
      // TODO: cuando ELEVENLABS_API_KEY esté configurado, POST a /v1/text-to-speech/{voice_id} y reproducir audio.
      speaking = false;
    },
    stop(): void {
      speaking = false;
    },
    get isSpeaking(): boolean {
      return speaking;
    },
    async getVoices(): Promise<{ id: string; name: string; lang?: string }[]> {
      // TODO: GET /v1/voices cuando la API esté configurada.
      return [];
    },
  };
}
