"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { createSpeechToText } from "@/lib/ai";

const DEFAULT_PLACEHOLDER = "¿Qué necesitás hoy?";

export interface CerebroBarInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** Placeholder dinámico contextual (ej. por pantalla). */
  placeholder?: string;
  /** aria-label del input */
  "aria-label"?: string;
  className?: string;
}

/**
 * Input de texto + micrófono (Web Speech API) + botón enviar.
 * Todo clickable con acción: enviar o toggle mic.
 */
export default function CerebroBarInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = DEFAULT_PLACEHOLDER,
  "aria-label": ariaLabel = "Preguntar al Cerebro",
  className = "",
}: CerebroBarInputProps) {
  const [isListening, setIsListening] = useState(false);
  const sttRef = useRef<ReturnType<typeof createSpeechToText> | null>(null);
  const onResultRef = useRef<(text: string) => void>(() => {});

  onResultRef.current = (text: string) => {
    if (text?.trim()) onChange(value ? `${value} ${text}` : text);
  };

  useEffect(() => {
    const stt = createSpeechToText({
      lang: "es-ES",
      onResult: (text: string) => onResultRef.current(text),
    });
    sttRef.current = stt;
    return () => {
      try {
        stt.stopListening();
      } catch {
        // ignore
      }
      sttRef.current = null;
    };
  }, []);

  const toggleMic = useCallback(async () => {
    const stt = sttRef.current;
    if (!stt) return;
    if (isListening) {
      stt.stopListening();
      setIsListening(false);
      return;
    }
    const started = await stt.startListening();
    setIsListening(!!started);
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) onSubmit();
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex min-h-[56px] items-center gap-2 ${className}`}
      aria-label="Barra del Cerebro"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-label={ariaLabel}
        className="min-h-[48px] min-w-0 flex-1 rounded-2xl border-2 border-yapo-blue/30 bg-yapo-white px-4 text-base text-foreground outline-none placeholder:text-yapo-blue/50 focus:border-yapo-blue focus:ring-2 focus:ring-yapo-blue/25 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={toggleMic}
        disabled={disabled}
        aria-label={isListening ? "Dejar de escuchar" : "Usar voz"}
        aria-pressed={isListening}
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-200 active:scale-95 disabled:opacity-50
          ${isListening
            ? "animate-pulse border-yapo-red bg-yapo-red text-yapo-white"
            : "border-yapo-blue/40 bg-yapo-blue/10 text-yapo-blue"
          }
        `}
      >
        <MicIcon className="h-5 w-5" />
      </button>
      <button
        type="submit"
        disabled={!canSubmit}
        aria-label="Enviar"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yapo-red text-yapo-white transition-all duration-200 active:scale-95 disabled:opacity-50"
      >
        <SendIcon className="h-5 w-5" />
      </button>
    </form>
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

function SendIcon({ className }: { className?: string }) {
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
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}
