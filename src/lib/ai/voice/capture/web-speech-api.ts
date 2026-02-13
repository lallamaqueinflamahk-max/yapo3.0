/**
 * Web Speech API: startListening(), stopListening(), onResult(text).
 * Wrapper simple sobre SpeechRecognition para transcripción a texto.
 */

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
  abort?(): void;
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

export interface WebSpeechAPIOptions {
  /** Callback con texto transcrito (interim y final). */
  onResult: (text: string) => void;
  /** Idioma (ej. "es-ES"). */
  lang?: string;
  /** Si true, onResult solo se llama con resultados finales. */
  finalOnly?: boolean;
}

export interface WebSpeechAPIHandle {
  /** Inicia la escucha (micrófono). Devuelve true si se pudo iniciar. */
  startListening(): Promise<boolean>;
  /** Detiene la escucha. */
  stopListening(): void;
  /** Indica si está escuchando. */
  readonly isListening: boolean;
}

/**
 * Crea un handle de Web Speech API con startListening(), stopListening() y onResult(text).
 * Solo funciona en el navegador (usa window.SpeechRecognition).
 */
export function createWebSpeechAPI(options: WebSpeechAPIOptions): WebSpeechAPIHandle {
  const { onResult, lang = "es-ES", finalOnly = false } = options;
  let recognition: SpeechRecognitionInstance | null = null;
  let listening = false;

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  function startListening(): Promise<boolean> {
    if (!SpeechRecognition) return Promise.resolve(false);
    stopListening();
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = !finalOnly;
    rec.lang = lang;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const alternative = result?.[0];
      if (alternative) {
        const text = alternative.transcript?.trim() ?? "";
        if (text && (finalOnly ? result.isFinal : true)) {
          onResult(text);
        }
      }
    };
    rec.onerror = () => {
      listening = false;
    };
    rec.onend = () => {
      listening = false;
    };
    recognition = rec;
    try {
      recognition.start();
      listening = true;
      return Promise.resolve(true);
    } catch {
      listening = false;
      recognition = null;
      return Promise.resolve(false);
    }
  }

  function stopListening(): void {
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        recognition.abort?.();
      }
      recognition = null;
    }
    listening = false;
  }

  return {
    startListening,
    stopListening,
    get isListening() {
      return listening;
    },
  };
}
