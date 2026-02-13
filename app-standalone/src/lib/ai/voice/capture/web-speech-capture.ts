/**
 * Captura de voz con Web Speech API (SpeechRecognition).
 * Transcripción a texto en el navegador.
 * Arquitectura preparada para reemplazar por OpenAI Whisper (mismo IVoiceCapture).
 */

import type { IVoiceCapture, TranscriptResult } from "../types";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export function createWebSpeechCapture(lang = "es-ES"): IVoiceCapture {
  let recognition: SpeechRecognitionInstance | null = null;
  let transcriptCallback: ((result: TranscriptResult) => void) | null = null;
  let listening = false;

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  function init(): SpeechRecognitionInstance | null {
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const alternative = result[0];
      if (alternative && transcriptCallback) {
        transcriptCallback({
          text: alternative.transcript.trim(),
          isFinal: result.isFinal,
          confidence: alternative.confidence,
        });
      }
    };
    rec.onerror = () => {
      listening = false;
    };
    rec.onend = () => {
      listening = false;
    };
    return rec;
  }

  return {
    get isListening() {
      return listening;
    },

    async start(): Promise<boolean> {
      if (!SpeechRecognition) return false;
      if (recognition) recognition.stop();
      recognition = init();
      if (!recognition) return false;
      try {
        recognition.start();
        listening = true;
        return true;
      } catch {
        listening = false;
        return false;
      }
    },

    stop(): void {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      listening = false;
    },

    onTranscript(callback: (result: TranscriptResult) => void): void {
      transcriptCallback = callback;
    },
  };
}
