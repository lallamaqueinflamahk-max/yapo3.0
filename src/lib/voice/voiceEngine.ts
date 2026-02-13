/**
 * VoiceEngine: TTS con ElevenLabs (API) o fallback a SpeechSynthesis.
 * Voz nunca bloquea la respuesta: si falla API, usa síntesis local.
 */

import { createSpeechSynthesis } from "@/lib/ai/voice/output/speech-synthesis-api";
import type { SpeechSynthesisAPIHandle } from "@/lib/ai/voice/output/speech-synthesis-api";

const VOICE_API_TIMEOUT_MS = 15_000;

export interface VoiceEngineOptions {
  /** Base URL para /api/voice (por defecto ""). */
  apiBaseUrl?: string;
  /** voice_id de ElevenLabs (ej. 21m00Tcm4TlvDq8ikWAM). */
  voiceId?: string;
  /** Idioma fallback (SpeechSynthesis). */
  lang?: "es-ES" | "es-PY";
  /** Timeout para llamada a API. */
  timeoutMs?: number;
}

/** Resultado de textToSpeech: si usó API o fallback. */
export interface TextToSpeechResult {
  ok: boolean;
  /** true si usó ElevenLabs, false si fallback SpeechSynthesis. */
  usedApi: boolean;
  error?: string;
}

let defaultEngine: VoiceEngineHandle | null = null;

export interface VoiceEngineHandle {
  /** Sintetiza y reproduce el texto. Fallback a SpeechSynthesis si falla API. */
  textToSpeech(text: string, options?: VoiceEngineOptions): Promise<TextToSpeechResult>;
  /** Detiene la reproducción actual. */
  stop(): void;
  /** Si está reproduciendo. */
  readonly isSpeaking: boolean;
}

/**
 * Crea el VoiceEngine: intenta /api/voice; si falla usa SpeechSynthesis.
 * Voz nunca bloquea: siempre devuelve resultado (ok o usado fallback).
 */
export function createVoiceEngine(options: VoiceEngineOptions = {}): VoiceEngineHandle {
  const fallback: SpeechSynthesisAPIHandle = createSpeechSynthesis({
    lang: options.lang ?? "es-ES",
  });

  let isSpeaking = false;

  async function textToSpeech(
    text: string,
    opts?: VoiceEngineOptions
  ): Promise<TextToSpeechResult> {
    const base = opts?.apiBaseUrl ?? options.apiBaseUrl ?? "";
    const voiceId = opts?.voiceId ?? options.voiceId;
    const timeoutMs = opts?.timeoutMs ?? options.timeoutMs ?? VOICE_API_TIMEOUT_MS;

    if (!text.trim()) {
      return { ok: true, usedApi: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${base}/api/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voiceId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        isSpeaking = true;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            isSpeaking = false;
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            isSpeaking = false;
            resolve();
          };
          audio.play().catch(reject);
        });
        return { ok: true, usedApi: true };
      }
    } catch {
      clearTimeout(timeoutId);
    }

    isSpeaking = true;
    await fallback.speak(text.trim());
    isSpeaking = false;
    return { ok: true, usedApi: false };
  }

  function stop(): void {
    fallback.stop();
    isSpeaking = false;
  }

  return {
    textToSpeech,
    stop,
    get isSpeaking() {
      return isSpeaking || fallback.isSpeaking;
    },
  };
}

/**
 * Devuelve el motor de voz por defecto (singleton).
 * Usa NEXT_PUBLIC_VOICE_MODE: si elevenlabs intenta API; si no solo fallback.
 */
export function getVoiceEngine(options?: VoiceEngineOptions): VoiceEngineHandle {
  if (!defaultEngine) {
    defaultEngine = createVoiceEngine(options ?? {});
  }
  return defaultEngine;
}
