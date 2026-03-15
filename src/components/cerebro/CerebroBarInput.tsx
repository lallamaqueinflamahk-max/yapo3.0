"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { createSpeechToText } from "@/lib/ai";
import IconBuscar from "@/components/icons/IconBuscar";

const DEFAULT_PLACEHOLDER = "¿Qué necesitás hoy?";

export interface CerebroBarInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** Placeholder dinámico contextual (ej. por pantalla). */
  placeholder?: string;
  /** CTA principal con label de beneficio (ej. "Encontrar al mejor en 2 minutos"). */
  primaryCtaLabel?: string;
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
  primaryCtaLabel,
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
      className={`flex min-h-[56px] flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2 ${className}`}
      aria-label="Barra del Cerebro"
    >
      <div className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2">
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
          type="submit"
          disabled={!canSubmit}
          aria-label="Buscar"
          className="btn-interactive inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-yapo-blue outline-none ring-0 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:hover:scale-100"
        >
          <IconBuscar className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
        </button>
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled}
          aria-label={isListening ? "Dejar de escuchar" : "Usar voz"}
          aria-pressed={isListening}
          className={`btn-interactive inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-yapo-blue outline-none ring-0 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:hover:scale-100 ${isListening ? "animate-pulse" : ""}`}
        >
          <MicIcon className={`h-10 w-10 shrink-0 sm:h-12 sm:w-12 ${isListening ? "opacity-90 ring-2 ring-yapo-cta/50 rounded-full" : ""}`} />
        </button>
      </div>
      {primaryCtaLabel ? (
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-interactive flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-yapo-cta px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-yapo-cta-hover focus:outline-none focus:ring-2 focus:ring-yapo-cta focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:shrink-0 sm:min-w-[180px]"
          aria-label={primaryCtaLabel}
        >
          {primaryCtaLabel}
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Buscar"
            className="btn-interactive inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 outline-none ring-0 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:hover:scale-100"
          >
            <IconBuscar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
          </button>
          <button
            type="button"
            onClick={toggleMic}
            disabled={disabled}
            aria-label={isListening ? "Dejar de escuchar" : "Usar voz"}
            aria-pressed={isListening}
            className={`btn-interactive inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-yapo-blue outline-none ring-0 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:hover:scale-100 ${isListening ? "animate-pulse" : ""}`}
          >
            <MicIcon className={`h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem] ${isListening ? "opacity-90 ring-2 ring-yapo-cta/50 rounded-full" : ""}`} />
          </button>
        </div>
      )}
    </form>
  );
}

const MIC_ICON = "/images/icon-mic.png";

function MicIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className ?? "h-6 w-6"}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MIC_ICON} alt="" className="h-full w-full object-contain" />
    </span>
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
