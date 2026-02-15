"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth";
import { runBarQuery } from "@/lib/cerebro";
import type { BarResult } from "@/lib/cerebro";
import type { RoleId } from "@/lib/cerebro";
import { createTextToSpeech } from "@/lib/ai";
import CerebroBarInput from "@/components/cerebro/CerebroBarInput";
import CerebroBarResult from "@/components/cerebro/CerebroBarResult";
import type { DashboardConfig } from "@/lib/adaptive-ui";

function resolvePlaceholder(
  template: string,
  name?: string | null
): string {
  const n = name?.trim() ?? "";
  return template.replace(/\{name\}/g, n).replace(/\s{2,}/g, " ").trim()
    || "Preguntá lo que quieras: trabajo, billetera, escudos…";
}

/** Convierte respuesta de /api/ai a BarResult para la UI. */
function apiResponseToBarResult(data: {
  text?: string;
  textForTTS?: string;
  suggestedActions?: Array<{ id: string; label?: string; href?: string }>;
  navigation?: { href?: string; label?: string };
  actionAllowed?: boolean;
}): BarResult {
  return {
    response: data.text?.trim() || data.textForTTS?.trim() || "Listo.",
    authorized: data.actionAllowed ?? true,
    suggestedActions: (data.suggestedActions ?? []).map((a) => ({
      id: a.id,
      label: a.label ?? a.id,
      href: a.href ?? "#",
    })),
    navigation: data.navigation?.href
      ? { href: data.navigation.href, label: data.navigation.label ?? "Ir" }
      : undefined,
    events: ["cerebro-bar:api"],
  };
}

export interface BarraBusquedaYapoProps {
  config?: DashboardConfig | null;
  /** Estilo compacto para hero (una sola línea visual). */
  variant?: "default" | "hero";
  className?: string;
}

/**
 * Barra de búsqueda con IA: texto + micrófono (voz), enlazada a OpenAI (/api/ai) y ElevenLabs (/api/voice).
 * Podés preguntar lo que sea; si OpenAI está activo se usa, si no, motor local. Voz: ElevenLabs o síntesis local.
 */
export default function BarraBusquedaYapo({ config, variant = "default", className = "" }: BarraBusquedaYapoProps) {
  const pathname = usePathname();
  const { identity } = useSession();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "responding">("idle");
  const [lastResult, setLastResult] = useState<BarResult | null>(null);
  const [lastQuery, setLastQuery] = useState("");
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

  const apiContext = useMemo(
    () => {
      const uid = (identity as { userId?: string } | null)?.userId ?? "safe-user";
      const roles = (identity?.roles ?? ["vale"]) as string[];
      return {
        user: uid ? { userId: uid, roles, verified: false } : null,
        roles,
        permissions: [] as string[],
        screen: pathname ?? "/home",
        memory: [] as Array<{ query?: string; message?: string; at?: number }>,
      };
    },
    [pathname, identity]
  );

  const placeholder = useMemo(
    () =>
      resolvePlaceholder(
        config?.smart_bar_placeholder ?? "Preguntá lo que quieras: trabajo, billetera, escudos…",
        (identity as { name?: string; displayName?: string })?.name ??
          (identity as { displayName?: string })?.displayName
      ),
    [config?.smart_bar_placeholder, identity]
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

  const speak = useCallback((text: string) => {
    if (!text?.trim()) return;
    const tts = ttsRef.current;
    try {
      tts?.speak(text);
    } catch {
      // ignore
    }
  }, []);

  const speakWithElevenLabs = useCallback(async (text: string) => {
    if (!text?.trim()) return;
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        await audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback to local TTS
    }
    speak(text);
  }, [speak]);

  const runQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setStatus("thinking");
      let result: BarResult;
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), context: apiContext }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.text != null || data.textForTTS != null)) {
          result = apiResponseToBarResult(data);
          setLastResult(result);
          setLastQuery(query.trim());
          setStatus("responding");
          const textToSpeak = data.textForTTS || data.text || result.response;
          if (textToSpeak?.trim()) await speakWithElevenLabs(textToSpeak);
          return;
        }
      } catch {
        // fallback to local engine
      }
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
      setLastQuery(query.trim());
      setStatus("responding");
      if (result.response?.trim()) {
        await speakWithElevenLabs(result.response);
      }
    },
    [screenContext, apiContext, speakWithElevenLabs]
  );

  const handleSubmit = useCallback(() => {
    const q = value.trim();
    if (!q) return;
    setValue("");
    runQuery(q);
  }, [value, runQuery]);

  const inputClassName = variant === "hero"
    ? "min-h-[52px] rounded-[14px] border-2 border-gris-ui-border bg-gris-ui focus-within:border-yapo-blue focus-within:ring-2 focus-within:ring-yapo-blue/20"
    : "rounded-2xl border-2 border-yapo-blue/25 bg-yapo-white shadow-md focus-within:border-yapo-blue focus-within:ring-2 focus-within:ring-yapo-blue/20";

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <CerebroBarInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        disabled={status === "thinking"}
        placeholder={placeholder}
        aria-label="Preguntar al Buscador YAPÓ con voz o texto"
        className={inputClassName}
      />
      {status === "thinking" && (
        <div
          className="flex items-center justify-center gap-2 py-2 text-sm text-yapo-blue"
          role="status"
          aria-live="polite"
        >
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue [animation-delay:300ms]" />
        </div>
      )}
      {lastResult && status === "responding" && (
        <div className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-3 shadow-sm">
          <CerebroBarResult
            result={lastResult}
            query={lastQuery || undefined}
            onSpeak={() => {
              if (lastResult.response?.trim()) speakWithElevenLabs(lastResult.response);
            }}
          />
        </div>
      )}
    </div>
  );
}
