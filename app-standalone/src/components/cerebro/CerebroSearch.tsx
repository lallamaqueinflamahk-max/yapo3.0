"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { analyzeQuery } from "@/lib/ai/engine";
import type { CerebroResult, Suggestion, Action } from "@/lib/ai/engine";
import { createVoiceOutput } from "@/lib/ai/voice";
import VoiceButton from "./VoiceButton";

export default function CerebroSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CerebroResult | null>(null);
  const voiceOutputRef = useRef<ReturnType<typeof createVoiceOutput> | null>(null);
  const lastQueryWasVoiceRef = useRef(false);

  useEffect(() => {
    voiceOutputRef.current = createVoiceOutput();
    return () => {
      voiceOutputRef.current?.stop();
      voiceOutputRef.current = null;
    };
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const next = analyzeQuery(value);
      setResult(next);
    },
    []
  );

  useEffect(() => {
    if (result?.message && lastQueryWasVoiceRef.current) {
      lastQueryWasVoiceRef.current = false;
      voiceOutputRef.current?.speak(result.message, { lang: "es-ES" });
    }
  }, [result?.message]);

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      lastQueryWasVoiceRef.current = true;
      handleSearch(text);
    },
    [handleSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Cerebro] Buscar:", query);
    handleSearch(query);
  };

  const handleChipClick = (suggestion: Suggestion) => {
    console.log("[Cerebro] Chip:", suggestion.text, suggestion.query);
    const nextQuery = suggestion.query ?? suggestion.text;
    setQuery(nextQuery);
    setResult(analyzeQuery(nextQuery));
  };

  const handleActionClick = (action: Action) => {
    console.log("[Cerebro] Acción:", action.label, action.href);
  };

  const initialResult = result ?? analyzeQuery("");

  return (
    <div className="flex flex-col">
      {/* Barra de búsqueda superior fija (dentro del scroll del layout) */}
      <div className="sticky top-0 z-10 border-b border-yapo-blue/20 bg-yapo-white px-4 pb-3 pt-2 shadow-sm">
        <form onSubmit={handleSubmit} role="search" className="flex gap-2">
          <label htmlFor="cerebro-search" className="sr-only">
            Buscar o preguntar al asistente
          </label>
          <input
            id="cerebro-search"
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="¿Qué necesitás?"
            autoComplete="off"
            className="min-h-[48px] flex-1 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 text-base text-foreground placeholder:text-yapo-blue/50 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20"
            aria-describedby="cerebro-message"
          />
          <button
            type="submit"
            className="min-h-[48px] min-w-[48px] rounded-xl bg-yapo-red font-semibold text-yapo-white transition-[transform] active:scale-95"
            aria-label="Buscar"
          >
            Ir
          </button>
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onInterim={setQuery}
            aria-label="Usar voz"
          />
        </form>

        {/* Chips inteligentes debajo del input */}
        <div
          id="cerebro-chips"
          className="mt-2 flex flex-wrap gap-2"
          role="list"
        >
          {initialResult.suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleChipClick(s)}
              className="rounded-full border-2 border-yapo-blue/40 bg-yapo-blue/5 px-4 py-2 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/15"
              role="listitem"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Área de resultado: mensaje + pantalla sugerida + acciones/rutas */}
      <div className="flex flex-col gap-4 p-4">
        {result?.message && (
          <>
            <p
              id="cerebro-message"
              className="text-sm text-yapo-blue/90"
              role="status"
            >
              {result.message}
            </p>
            <button
              type="button"
              onClick={() => voiceOutputRef.current?.speak(result!.message!, { lang: "es-ES" })}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/40 bg-yapo-blue/10 px-4 py-2 text-sm font-medium text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/20"
              aria-label="Escuchar respuesta"
            >
              <SpeakerIcon className="h-5 w-5" />
              Escuchar respuesta
            </button>
          </>
        )}

        {/* Guía a pantalla correcta (desde base de conocimiento JSON) */}
        {result?.screen && (
          <Link
            href={result.screen}
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-yapo-red px-4 py-3 font-semibold text-yapo-white transition-[transform] active:scale-95"
          >
            Ir a {result.screen === "/home" ? "Inicio" : result.screen === "/profile" ? "Perfil" : result.screen === "/wallet" ? "Billetera" : result.screen === "/chat" ? "Chat" : result.screen === "/cerebro" ? "Cerebro" : result.screen}
          </Link>
        )}

        {/* Acciones sugeridas según contexto (desde base JSON) */}
        {result?.suggestedActions && result.suggestedActions.length > 0 && (
          <section aria-label="Sugeridas por contexto" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
              Sugeridas
            </h2>
            <ul className="flex flex-wrap gap-2">
              {result.suggestedActions.map((label, i) => (
                <li key={`${label}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[Cerebro] Sugerida:", label);
                      handleSearch(label);
                    }}
                    className="rounded-full border-2 border-yapo-red/50 bg-yapo-red/10 px-4 py-2 text-sm font-medium text-yapo-red transition-[transform,background] active:scale-95 active:bg-yapo-red/20"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Acciones sugeridas" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
            Acciones
          </h2>
          <ul className="flex flex-col gap-2">
            {initialResult.actions.map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  onClick={() => handleActionClick(action)}
                  className="flex min-h-[48px] items-center justify-between rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 py-3 text-left font-medium text-yapo-blue transition-[transform,background] active:scale-[0.99] active:bg-yapo-blue/5"
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

        <section aria-label="Rutas de navegación" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-yapo-blue/70">
            Navegar
          </h2>
          <ul className="flex flex-wrap gap-2">
            {initialResult.routes.map((route) => (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-yapo-blue px-4 py-2 text-sm font-semibold text-yapo-white transition-[transform] active:scale-95"
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
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
