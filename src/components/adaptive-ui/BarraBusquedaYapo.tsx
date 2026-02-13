"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth";
import { runBarQuery } from "@/lib/cerebro";
import type { BarResult } from "@/lib/cerebro";
import type { RoleId } from "@/lib/cerebro";
import { createTextToSpeech } from "@/lib/ai";
import type { DashboardConfig } from "@/lib/adaptive-ui";
import CerebroBarInput from "@/components/cerebro/CerebroBarInput";
import CerebroBarResult from "@/components/cerebro/CerebroBarResult";

interface BarraBusquedaYapoProps {
  /** Placeholder desde config (ej. "Buscar con YAPÓ", "Buscar trabajadores con YAPÓ") */
  config?: DashboardConfig | null;
  placeholder?: string;
}

/**
 * Barra de búsqueda YAPÓ: Cerebro interactivo real (no mock).
 * Mismo motor: input + mic (Web Speech) + runBarQuery + TTS. Placeholder por rol.
 */
/** Sustituye {name} y {city} en el placeholder Smart-Bar. */
function resolveSmartBarPlaceholder(
  template: string,
  name?: string | null,
  city?: string | null
): string {
  let out = template;
  if (name?.trim()) out = out.replace(/\{name\}/g, name.trim());
  else out = out.replace(/\{name\}/g, "").replace(/Hola\s*,?\s*/i, "Hola, ");
  if (city?.trim()) out = out.replace(/\{city\}/g, city.trim());
  else out = out.replace(/\{city\}/g, "tu zona");
  return out.replace(/\s{2,}/g, " ").trim() || "¿Qué necesitás hoy? Preguntale a YAPÓ AI.";
}

export default function BarraBusquedaYapo({ config, placeholder }: BarraBusquedaYapoProps) {
  const pathname = usePathname();
  const { identity } = useSession();
  const rawPlaceholder =
    config?.smart_bar_placeholder ?? config?.search_placeholder ?? placeholder ?? "Buscar con YAPÓ";
  const text = useMemo(
    () =>
      resolveSmartBarPlaceholder(
        rawPlaceholder,
        (identity as { name?: string; displayName?: string })?.name ??
          (identity as { displayName?: string })?.displayName,
        (identity as { city?: string; location?: string })?.city ??
          (identity as { location?: string })?.location
      ),
    [rawPlaceholder, identity]
  );
  const quickSuggestions = config?.quick_suggestions ?? [];

  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "responding">("idle");
  const [lastResult, setLastResult] = useState<BarResult | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const ttsRef = useRef<ReturnType<typeof createTextToSpeech> | null>(null);

  const screenContext = useMemo(
    () => ({
      screen: pathname ?? "/home",
      userId: identity?.userId ?? "safe-user",
      roles: (identity?.roles ?? ["vale"]) as RoleId[],
      amount: undefined as number | undefined,
    }),
    [pathname, identity?.userId, identity?.roles]
  );

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
      const q = query.trim();
      if (!q) return;
      setLastQuery(q);
      setStatus("thinking");
      let result: BarResult;
      try {
        result = runBarQuery(q, screenContext);
      } catch {
        result = {
          response: "No pude procesar eso. Probá de nuevo.",
          authorized: false,
          suggestedActions: [],
          events: ["cerebro-bar:error"],
        };
      }
      setLastResult(result);
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

  const onSuggestionClick = useCallback(
    (suggestion: string) => {
      runQuery(suggestion);
    },
    [runQuery]
  );

  return (
    <div className="w-full space-y-3" role="search" aria-label="Buscador YAPÓ">
      <div className="rounded-xl border border-yapo-blue/20 bg-white/70 bg-gradient-to-r from-yapo-blue-light/20 to-transparent px-3 py-2 shadow-sm backdrop-blur-sm">
        <CerebroBarInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          disabled={status === "thinking"}
          placeholder={text}
          aria-label="YAPÓ AI Smart-Bar"
        />
      </div>
      {quickSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sugerencias rápidas">
          {quickSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestionClick(s)}
              className="min-h-[44px] min-w-[44px] rounded-full border border-yapo-blue/30 bg-yapo-blue-light/30 px-4 py-2 text-sm font-medium text-yapo-blue transition-[transform,opacity] duration-75 hover:bg-yapo-blue-light/50 hover:opacity-90 active:scale-[0.98] active:opacity-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {status === "thinking" && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-yapo-blue/80" role="status">
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:300ms]" />
        </div>
      )}
      {lastResult && (
        <div className="rounded-xl border-2 border-yapo-blue/20 bg-yapo-blue-light/20 p-3">
          <CerebroBarResult
            result={lastResult}
            query={lastQuery}
            onSpeak={() => lastResult.response?.trim() && ttsRef.current?.speak(lastResult.response)}
          />
        </div>
      )}
    </div>
  );
}
