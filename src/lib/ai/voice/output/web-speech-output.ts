/**
 * Salida de voz con Web Speech API (SpeechSynthesis).
 * Reproducción de voz sintética básica en el navegador.
 * Arquitectura preparada para reemplazar por ElevenLabs (mismo IVoiceOutput).
 */

import type { IVoiceOutput, SpeakOptions } from "../types";

export function createWebSpeechOutput(): IVoiceOutput {
  let speaking = false;

  function getSynth(): SpeechSynthesis | null {
    return typeof window !== "undefined" ? window.speechSynthesis : null;
  }

  return {
    get isSpeaking() {
      return speaking;
    },

    async speak(text: string, options?: SpeakOptions): Promise<void> {
      const synth = getSynth();
      if (!synth || !text.trim()) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = options?.lang ?? "es-ES";
      utterance.rate = options?.rate ?? 1;
      utterance.volume = options?.volume ?? 1;
      const voices = synth.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es"));
      if (esVoice) utterance.voice = esVoice;
      utterance.onstart = () => {
        speaking = true;
      };
      utterance.onend = () => {
        speaking = false;
      };
      utterance.onerror = () => {
        speaking = false;
      };
      synth.speak(utterance);
    },

    stop(): void {
      const synth = getSynth();
      if (synth) {
        synth.cancel();
        speaking = false;
      }
    },

    async getVoices(): Promise<{ id: string; name: string; lang?: string }[]> {
      const synth = getSynth();
      if (!synth) return [];
      const voices = synth.getVoices();
      if (voices.length === 0) {
        return new Promise((resolve) => {
          synth.onvoiceschanged = () => {
            resolve(
              Array.from(synth.getVoices()).map((v) => ({
                id: v.voiceURI,
                name: v.name,
                lang: v.lang,
              }))
            );
          };
        });
      }
      return voices.map((v) => ({
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
      }));
    },
  };
}
