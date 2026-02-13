import type { VoiceProvider } from "../types";

/**
 * Web Speech Synthesis API: speak(text), idioma es-ES / es-PY.
 * Wrapper sobre window.speechSynthesis para síntesis de voz.
 */

export type SpeechSynthesisLang = "es-ES" | "es-PY";

export interface SpeechSynthesisAPIOptions {
  /** Idioma de síntesis (es-ES o es-PY). Por defecto es-ES. */
  lang?: SpeechSynthesisLang;
  /** Velocidad (0.1–10; 1 = normal). */
  rate?: number;
  /** Volumen (0–1). */
  volume?: number;
}

export interface SpeechSynthesisAPIHandle extends VoiceProvider {
  /** Reproduce el texto con voz sintética. Resuelve al terminar o al cancelar. */
  speak(text: string): Promise<void>;
  /** Detiene la reproducción actual. */
  stop(): void;
  /** Indica si está reproduciendo. */
  readonly isSpeaking: boolean;
}

function getSynth(): SpeechSynthesis | null {
  return typeof window !== "undefined" ? window.speechSynthesis : null;
}

function pickVoice(synth: SpeechSynthesis, lang: SpeechSynthesisLang): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (voices.length === 0) return null;
  const langTag = lang === "es-PY" ? "es-PY" : "es-ES";
  const match = voices.find((v) => v.lang === langTag || v.lang.startsWith(langTag));
  if (match) return match;
  const anySpanish = voices.find((v) => v.lang.startsWith("es"));
  return anySpanish ?? voices[0];
}

/**
 * Crea un handle de Speech Synthesis con speak(text) e idioma es-ES / es-PY.
 * Solo funciona en el navegador (usa window.speechSynthesis).
 */
export function createSpeechSynthesis(
  options: SpeechSynthesisAPIOptions = {}
): SpeechSynthesisAPIHandle {
  const { lang = "es-ES", rate = 1, volume = 1 } = options;
  let speaking = false;

  function speak(text: string): Promise<void> {
    const synth = getSynth();
    if (!synth || !text.trim()) return Promise.resolve();
    synth.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = lang === "es-PY" ? "es-PY" : "es-ES";
      utterance.rate = rate;
      utterance.volume = volume;
      const voice = pickVoice(synth, lang);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        speaking = true;
      };
      utterance.onend = () => {
        speaking = false;
        resolve();
      };
      utterance.onerror = () => {
        speaking = false;
        resolve();
      };
      synth.speak(utterance);
    });
  }

  function stop(): void {
    const synth = getSynth();
    if (synth) {
      synth.cancel();
      speaking = false;
    }
  }

  return {
    speak,
    stop,
    get isSpeaking() {
      return speaking;
    },
  };
}
