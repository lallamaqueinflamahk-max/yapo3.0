"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createVoiceCapture } from "@/lib/ai/voice";
import type { TranscriptResult } from "@/lib/ai/voice";

interface VoiceButtonProps {
  /** Callback con transcripción final (texto a enviar al motor). */
  onTranscript: (text: string) => void;
  /** Transcripción intermedia (opcional, para mostrar en input). */
  onInterim?: (text: string) => void;
  /** Deshabilitado (ej. sin permiso de mic). */
  disabled?: boolean;
  /** Clases adicionales. */
  className?: string;
  /** aria-label. */
  "aria-label"?: string;
}

/**
 * Botón de micrófono: captura de voz (Web Speech API).
 * Separa captura de procesamiento: solo entrega texto vía onTranscript/onInterim.
 */
export default function VoiceButton({
  onTranscript,
  onInterim,
  disabled = false,
  className = "",
  "aria-label": ariaLabel = "Usar voz",
}: VoiceButtonProps) {
  const captureRef = useRef<ReturnType<typeof createVoiceCapture> | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimRef = useRef(onInterim);
  const [isListening, setIsListening] = useState(false);

  onTranscriptRef.current = onTranscript;
  onInterimRef.current = onInterim ?? (() => {});

  useEffect(() => {
    const capture = createVoiceCapture("es-ES");
    captureRef.current = capture;
    capture.onTranscript((result: TranscriptResult) => {
      if (result.isFinal && result.text.trim()) {
        onTranscriptRef.current(result.text.trim());
      } else if (!result.isFinal) {
        onInterimRef.current(result.text);
      }
    });
    return () => {
      capture.stop();
      captureRef.current = null;
    };
  }, []);

  const toggle = useCallback(async () => {
    const capture = captureRef.current;
    if (!capture) return;
    if (isListening) {
      capture.stop();
      setIsListening(false);
      return;
    }
    const started = await capture.start();
    setIsListening(started);
    if (!started) {
      console.warn("[VoiceButton] No se pudo iniciar el micrófono");
    }
  }, [isListening]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isListening}
      className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 transition-[transform,background] active:scale-95 disabled:opacity-50 ${
        isListening
          ? "border-yapo-red bg-yapo-red text-yapo-white"
          : "border-yapo-blue/40 bg-yapo-blue/10 text-yapo-blue"
      } ${className}`}
    >
      <MicIcon className="h-6 w-6" />
    </button>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <path d="M12 19v3" />
      <path d="M9 22h6" />
    </svg>
  );
}
