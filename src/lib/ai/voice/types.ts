/**
 * Tipos de voz: captura (Whisper-ready) y salida (ElevenLabs-ready).
 * Sin APIs externas aún; interfaces preparadas para integración futura.
 */

/** Resultado de transcripción (Web Speech API hoy; Whisper luego) */
export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  /** Para Whisper: confidence o alternativas */
  confidence?: number;
  /** Para Whisper: idioma detectado */
  lang?: string;
}

/** Opciones de síntesis de voz (Web Speech hoy; ElevenLabs luego) */
export interface SpeakOptions {
  /** Idioma (ej. "es-ES") */
  lang?: string;
  /** Velocidad (0.1–10; 1 = normal) */
  rate?: number;
  /** Volumen (0–1) */
  volume?: number;
  /** Para ElevenLabs: voiceId */
  voiceId?: string;
  /** Para ElevenLabs: tono humano, claro, empático */
  tone?: "human" | "clear" | "empathetic" | "professional";
}

/**
 * Interfaz de captura de voz.
 * Implementaciones: Web Speech API (actual), OpenAI Whisper (futuro).
 */
export interface IVoiceCapture {
  /** Inicia la captura (micrófono). Devuelve true si se pudo iniciar. */
  start(): Promise<boolean>;
  /** Detiene la captura. */
  stop(): void;
  /** Callback con transcripción (interim y final). */
  onTranscript(callback: (result: TranscriptResult) => void): void;
  /** Indica si está grabando. */
  readonly isListening: boolean;
  /** Para Whisper: devolver audio blob en lugar de transcripción en cliente. */
  getAudioBlob?(): Promise<Blob | null>;
}

/**
 * Proveedor de voz: solo speak(text) asíncrono.
 * Implementaciones: Speech Synthesis, ElevenLabs, etc.
 */
export interface VoiceProvider {
  speak(text: string): Promise<void>;
}

/**
 * Interfaz de salida de voz.
 * Implementaciones: Web Speech Synthesis (actual), ElevenLabs (futuro).
 */
export interface IVoiceOutput {
  /** Reproduce texto con voz sintética. */
  speak(text: string, options?: SpeakOptions): Promise<void>;
  /** Detiene la reproducción actual. */
  stop(): void;
  /** Indica si está reproduciendo. */
  readonly isSpeaking: boolean;
  /** Para ElevenLabs: lista de voces disponibles (si aplica). */
  getVoices?(): Promise<{ id: string; name: string; lang?: string }[]>;
}
