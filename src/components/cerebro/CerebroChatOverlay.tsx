"use client";

import Link from "next/link";
import type { CerebroResult, Suggestion, Action } from "@/lib/ai/engine";

interface CerebroChatOverlayProps {
  /** Última consulta del usuario (burbuja usuario). */
  lastQuery?: string;
  /** Resultado actual del Cerebro (burbuja + sugerencias + acciones). */
  result: CerebroResult | null;
  /** Al hacer clic en un chip de sugerencia (refina búsqueda). */
  onSuggestionClick: (suggestion: Suggestion) => void;
  /** Al hacer clic en una acción sugerida por contexto (texto). */
  onSuggestedActionClick: (label: string) => void;
  /** Al hacer clic en una acción (navegación). */
  onActionClick?: (action: Action) => void;
  /** Habilitar botón "Escuchar respuesta" (requiere callback). */
  onSpeakResponse?: (text: string) => void;
  /** Clases extra del contenedor. */
  className?: string;
}

const SCREEN_LABELS: Record<string, string> = {
  "/home": "Inicio",
  "/profile": "Perfil",
  "/wallet": "Billetera",
  "/chat": "Chat",
  "/cerebro": "Cerebro",
};

/**
 * Overlay tipo chat: respuestas del Cerebro, sugerencias clickeables y acciones rápidas.
 * Pensado para ir encima del contenido y encima de CerebroBar (dentro del mismo flujo).
 */
export default function CerebroChatOverlay({
  lastQuery,
  result,
  onSuggestionClick,
  onSuggestedActionClick,
  onActionClick,
  onSpeakResponse,
  className = "",
}: CerebroChatOverlayProps) {
  const hasContent =
    lastQuery?.trim() ||
    (result && (result.message || result.suggestions?.length || result.actions?.length || result.routes?.length || result.suggestedActions?.length || result.screen));

  if (!hasContent) {
    return (
      <div
        className={`flex min-h-[120px] flex-col justify-end px-4 pb-2 ${className}`}
        aria-label="Chat del asistente"
      >
        <p className="text-center text-sm text-yapo-blue/50">
          Escribí o tocá el micrófono para empezar.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 ${className}`}
      role="log"
      aria-label="Chat del asistente"
    >
      {/* Burbuja usuario */}
      {lastQuery?.trim() && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-yapo-blue px-4 py-3 text-sm font-medium text-yapo-white">
            {lastQuery.trim()}
          </div>
        </div>
      )}

      {/* Burbuja Cerebro: mensaje */}
      {result?.message && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 shadow-sm">
            <p className="text-sm text-yapo-blue/90">{result.message}</p>
            {onSpeakResponse && (
              <button
                type="button"
                onClick={() => onSpeakResponse(result.message!)}
                className="mt-2 flex items-center gap-2 text-xs font-medium text-yapo-blue transition-opacity hover:opacity-80 active:opacity-70"
                aria-label="Escuchar respuesta"
              >
                <SpeakerIcon className="h-4 w-4" />
                Escuchar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sugerencias clickeables (chips) */}
      {result?.suggestions && result.suggestions.length > 0 && (
        <section aria-label="Sugerencias" className="flex flex-wrap gap-2">
          {result.suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSuggestionClick(s)}
              className="rounded-full border-2 border-yapo-blue/40 bg-yapo-blue/5 px-4 py-2.5 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/15"
            >
              {s.text}
            </button>
          ))}
        </section>
      )}

      {/* Acción rápida: ir a pantalla sugerida */}
      {result?.screen && (
        <Link
          href={result.screen}
          className="flex min-h-[48px] items-center justify-center rounded-2xl bg-yapo-red px-4 py-3 font-semibold text-yapo-white transition-[transform] active:scale-[0.98]"
        >
          Ir a {SCREEN_LABELS[result.screen] ?? result.screen}
        </Link>
      )}

      {/* Acciones sugeridas por contexto (texto clickeable) */}
      {result?.suggestedActions && result.suggestedActions.length > 0 && (
        <section aria-label="Sugeridas por contexto">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
            Sugeridas
          </p>
          <div className="flex flex-wrap gap-2">
            {result.suggestedActions.map((label, i) => (
              <button
                key={`${label}-${i}`}
                type="button"
                onClick={() => onSuggestedActionClick(label)}
                className="rounded-full border-2 border-yapo-red/50 bg-yapo-red/10 px-4 py-2.5 text-sm font-medium text-yapo-red transition-[transform,background] active:scale-95 active:bg-yapo-red/20"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Acciones rápidas (enlaces) */}
      {(result?.actions?.length ?? 0) > 0 && (
        <section aria-label="Acciones rápidas">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
            Acciones
          </p>
          <ul className="flex flex-col gap-2">
            {result!.actions.map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  onClick={() => onActionClick?.(action)}
                  className="flex min-h-[48px] items-center justify-between rounded-2xl border-2 border-yapo-blue/30 bg-yapo-white px-4 py-3 text-left font-medium text-yapo-blue transition-[transform,background] active:scale-[0.99] active:bg-yapo-blue/5"
                >
                  <span>{action.label}</span>
                  {action.description && (
                    <span className="text-xs text-yapo-blue/70">
                      {action.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Rutas de navegación (chips rápidos) */}
      {(result?.routes?.length ?? 0) > 0 && (
        <section aria-label="Navegar">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
            Navegar
          </p>
          <div className="flex flex-wrap gap-2">
            {result!.routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="inline-flex min-h-[44px] items-center rounded-2xl bg-yapo-blue px-4 py-2.5 text-sm font-semibold text-yapo-white transition-[transform] active:scale-95"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
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
