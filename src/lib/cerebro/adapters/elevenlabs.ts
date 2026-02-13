/**
 * Adapter ElevenLabs para salida de voz del Cerebro.
 * Arquitectura preparada; no conectado aún.
 * Uso futuro: TTS de la respuesta del Cerebro con voz ElevenLabs.
 */

export interface ElevenLabsCerebroConfig {
  /** API key (no usar en cliente; solo server-side o proxy). */
  apiKey?: string;
  /** Voice ID en ElevenLabs. */
  voiceId?: string;
  /** Modelo (ej. eleven_multilingual_v2). */
  model?: string;
  /** Idioma. */
  lang?: string;
}

export interface ElevenLabsSpeakOptions {
  /** Texto a sintetizar. */
  text: string;
  /** Voice ID (override config). */
  voiceId?: string;
  /** Idioma (override). */
  lang?: string;
}

/**
 * Adapter ElevenLabs: no conectado. Lanzará si se llama.
 */
export interface IElevenLabsCerebroAdapter {
  /** Sintetizar y reproducir (o devolver stream/URL). */
  speak(options: ElevenLabsSpeakOptions): Promise<void>;
  /** Detener reproducción. */
  stop(): void;
}

const NOT_CONNECTED = "ElevenLabs adapter no conectado. Configurar y conectar antes de usar.";

/**
 * Stub: lanza al llamar speak. Conectar cuando se tenga API key y se quiera usar.
 */
export function createElevenLabsCerebroAdapter(
  _config?: ElevenLabsCerebroConfig
): IElevenLabsCerebroAdapter {
  return {
    async speak(_options: ElevenLabsSpeakOptions): Promise<void> {
      throw new Error(NOT_CONNECTED);
    },
    stop(): void {
      // no-op cuando no conectado
    },
  };
}
