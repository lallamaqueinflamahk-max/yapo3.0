"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import { runBarQuery } from "@/lib/cerebro";
import type { BarResult } from "@/lib/cerebro";
import type { RoleId } from "@/lib/cerebro";
import { createTextToSpeech } from "@/lib/ai";
import { runWithIntent, buildIntentContext } from "@/lib/ai/cerebroEngine";
import type { CerebroResult, CerebroIntent, CerebroRole } from "@/lib/ai/cerebro";
import { MOCK_INTENT_CHIPS } from "@/lib/ai/knowledge/cerebro-mock-chips";
import CerebroBarInput from "./CerebroBarInput";
import CerebroBarResult from "./CerebroBarResult";
import CerebroBarHistory, { type HistoryEntry } from "./CerebroBarHistory";
import { ChipBubbleIntent } from "./ChipBubble";

export const CEREBRO_BAR_HEIGHT = 72;

export type CerebroBarStatus = "idle" | "thinking" | "responding";

/** Placeholder dinámico por pantalla (origen). */
const PLACEHOLDERS: Record<string, string> = {
  "/": "¿Qué necesitás hoy?",
  "/home": "¿Qué necesitás hoy?",
  "/wallet": "¿Transferir? ¿Ver saldo?",
  "/profile": "¿Verificar? ¿Ver perfil?",
  "/chat": "¿Enviar mensaje?",
  "/cerebro": "Preguntá al Buscador YAPÓ",
  "/dashboard": "¿Validar tarea?",
};

function getPlaceholder(screen: string): string {
  return PLACEHOLDERS[screen] ?? "¿Qué necesitás hoy?";
}

function nextHistoryId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CerebroBarProps {
  /** Query inicial (ej. desde chip: /cerebro?q=...). Se ejecuta una vez al montar. */
  initialQuery?: string | null;
}

/**
 * Barra Cerebro: input texto + micrófono (Web Speech API) + contexto de pantalla + historial.
 * Construye CerebroContext (userId desde SAFE MODE, roles, acción inferida, origen) y llama a decide().
 */
export default function CerebroBar({ initialQuery }: CerebroBarProps = {}) {
  const pathname = usePathname();
  const { identity } = useSession();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<CerebroBarStatus>("idle");
  const [lastResult, setLastResult] = useState<BarResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const ttsRef = useRef<ReturnType<typeof createTextToSpeech> | null>(null);
  const initialQueryRunRef = useRef(false);

  const screenContext = useMemo(
    () => ({
      screen: pathname ?? "/",
      userId: identity?.userId ?? "safe-user",
      roles: (identity?.roles ?? ["vale"]) as RoleId[],
      amount: undefined as number | undefined,
    }),
    [pathname, identity?.userId, identity?.roles]
  );

  /** Contexto para CerebroEngine (decide por intents). */
  const intentContext = useMemo(
    () =>
      buildIntentContext({
        userId: identity?.userId ?? "safe-user",
        role: (identity?.roles?.[0] ?? "vale") as CerebroRole,
        currentScreen: pathname ?? "/",
      }),
    [identity?.userId, identity?.roles, pathname]
  );

  const [lastCerebroResult, setLastCerebroResult] = useState<CerebroResult | null>(null);
  const router = useRouter();

  const handleIntent = useCallback(
    (intent: CerebroIntent) => {
      const result = runWithIntent(intent, intentContext);
      setLastCerebroResult(result);
      if (result.navigationTarget?.screen) {
        router.push(result.navigationTarget.screen);
      }
      return result;
    },
    [intentContext, router]
  );

  const placeholder = useMemo(() => getPlaceholder(pathname ?? "/"), [pathname]);

  useEffect(() => {
    const tts = createTextToSpeech({ lang: "es-ES" });
    ttsRef.current = tts;
    return () => {
      try {
        tts.stop();
      } catch {
        // ignore
      }
      ttsRef.current = null;
    };
  }, []);

  const runQuery = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      setStatus("thinking");
      let result: BarResult;
      try {
        result = runBarQuery(query.trim(), screenContext);
      } catch (err) {
        result = {
          response: "No pude procesar eso. Probá de nuevo.",
          authorized: false,
          suggestedActions: [],
          events: ["cerebro-bar:error"],
        };
      }
      setLastResult(result);
      setHistory((prev) =>
        prev.concat({
          id: nextHistoryId(),
          query: query.trim(),
          result,
          timestamp: Date.now(),
        })
      );
      setStatus("responding");
      if (result.response?.trim()) {
        try {
          ttsRef.current?.speak(result.response);
        } catch {
          // ignore TTS errors
        }
      }
    },
    [screenContext]
  );

  const handleSubmit = useCallback(() => {
    const query = value.trim();
    if (!query) return;
    setValue("");
    runQuery(query);
  }, [value, runQuery]);

  useEffect(() => {
    const q = initialQuery?.trim();
    if (q && !initialQueryRunRef.current) {
      initialQueryRunRef.current = true;
      setValue(q);
      runQuery(q);
    }
  }, [initialQuery, runQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-yapo-white">
      {/* Barra: input + mic + enviar */}
      <header
        className="sticky top-0 z-50 w-full border-b-2 border-yapo-blue/20 bg-yapo-blue/10 shadow-sm transition-shadow"
        style={{ paddingTop: "env(safe-area-inset-top, 0)" }}
      >
        <div
          className="px-3 py-3"
          style={{ minHeight: CEREBRO_BAR_HEIGHT }}
        >
          <CerebroBarInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            disabled={status === "thinking"}
            placeholder={placeholder}
            aria-label="Preguntar al Buscador YAPÓ"
          />
        </div>
      </header>

      {/* Chips de intents: cada uno ejecuta un comando (wallet, transferir, chat, perfil, etc.) */}
      <section
        className="border-b border-yapo-blue/15 bg-yapo-blue-light/40 px-3 py-3"
        aria-label="Chips de acción"
      >
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          role="list"
        >
          {MOCK_INTENT_CHIPS.map((chip) => (
            <div key={chip.id} role="listitem" className="shrink-0">
              <ChipBubbleIntent
                label={chip.label}
                icon={<span className="text-base leading-none">{chip.icon}</span>}
                intent={{
                  intentId: chip.intentId,
                  payload: chip.payload,
                  source: "chip",
                }}
                onIntent={handleIntent}
              />
            </div>
          ))}
        </div>
        {/* Resultado del último intent (mensaje, navegación, requiereValidación) */}
        {lastCerebroResult && (
          <div
            className="mt-2 rounded-xl border-2 border-yapo-blue/25 bg-yapo-blue-light p-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-yapo-blue">
              {lastCerebroResult.allowed ? "✓ " : ""}
              {lastCerebroResult.message ?? "Listo."}
            </p>
            {lastCerebroResult.requiresValidation && (
              <p className="mt-1 text-yapo-red text-xs font-medium">
                Requiere validación {lastCerebroResult.validationType === "biometric" ? "(biometría)" : ""}
              </p>
            )}
            {lastCerebroResult.suggestedActions && lastCerebroResult.suggestedActions.length > 0 && (
              <p className="mt-1 text-yapo-blue/70 text-xs">
                Acciones: {lastCerebroResult.suggestedActions.map((a) => a.intentId).join(", ")}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Feedback visual: pensando */}
      {status === "thinking" && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-yapo-blue/80" role="status">
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:300ms]" />
        </div>
      )}

      {/* Contexto de pantalla (sutil) */}
      <p className="px-4 py-1 text-xs text-yapo-blue/50" aria-hidden>
        Pantalla: {screenContext.screen} · Rol: {screenContext.roles.join(", ") || "—"}
      </p>

      {/* Área de respuesta e historial */}
      <section
        className="flex-1 overflow-y-auto px-4 py-4"
        aria-label="Respuestas del Buscador YAPÓ"
      >
        {/* Última respuesta */}
        {lastResult && (
          <div className="mb-6 transition-opacity duration-300">
            <CerebroBarResult
              result={lastResult}
              query={history[history.length - 1]?.query}
              onSpeak={() => {
                if (lastResult.response?.trim()) ttsRef.current?.speak(lastResult.response);
              }}
            />
          </div>
        )}

        {/* Historial (entradas anteriores) */}
        {history.length > 1 && (
          <CerebroBarHistory
            entries={history.slice(0, -1)}
            maxCollapsed={10}
          />
        )}

        {!lastResult && history.length === 0 && (
          <p className="text-center text-sm text-yapo-blue/50">
            Escribí o tocá el micrófono para consultar al Buscador YAPÓ.
          </p>
        )}
      </section>
    </div>
  );
}
