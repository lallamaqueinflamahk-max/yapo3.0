"use client";

import Link from "next/link";
import type { BarResult as BarResultType } from "@/lib/cerebro";

export interface CerebroBarResultProps {
  result: BarResultType;
  /** Query que generó este resultado (para mostrar arriba). */
  query?: string;
  /** Reproducir respuesta con TTS (botón real). */
  onSpeak?: () => void;
  className?: string;
}

/**
 * Muestra la respuesta del Cerebro + acciones sugeridas + navegación directa.
 * Todo clickable: enlaces navegan, botones sin href rellenan el input (no usado aquí; el bar maneja eso).
 */
export default function CerebroBarResult({
  result,
  query,
  onSpeak,
  className = "",
}: CerebroBarResultProps) {
  return (
    <section
      className={`space-y-4 ${className}`}
      aria-label="Respuesta del Cerebro"
    >
      {query && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-yapo-blue px-4 py-3 text-sm font-medium text-yapo-white">
            {query}
          </div>
        </div>
      )}

      <div className="flex justify-start">
        <div
          className={`max-w-[85%] rounded-2xl rounded-bl-md border-2 px-4 py-3 shadow-sm transition-colors ${
            result.authorized
              ? "border-yapo-blue/20 bg-yapo-white text-yapo-blue"
              : "border-yapo-red/20 bg-yapo-white text-yapo-red-dark"
          }`}
        >
          <p className="text-sm">{result.response}</p>
        </div>
      </div>

      {/* Reproducir voz (acción real) */}
      {onSpeak && result.response?.trim() && (
        <button
          type="button"
          onClick={onSpeak}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-yapo-blue/40 bg-yapo-blue/10 px-4 py-2.5 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-[0.98] active:bg-yapo-blue/20"
          aria-label="Reproducir respuesta en voz"
        >
          <SpeakerIcon className="h-5 w-5" />
          Reproducir respuesta
        </button>
      )}

      {/* Navegación directa */}
      {result.navigation && (
        <Link
          href={result.navigation.href}
          className="flex min-h-[48px] items-center justify-center rounded-2xl bg-yapo-red px-4 py-3 font-semibold text-yapo-white transition-[transform] active:scale-[0.98]"
        >
          Ir a {result.navigation.label}
        </Link>
      )}

      {/* Acciones sugeridas (navegación) */}
      {result.suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list">
          {result.suggestedActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              role="listitem"
              className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-yapo-blue/40 bg-yapo-blue/10 px-4 py-2.5 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/20"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
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
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
    </svg>
  );
}
