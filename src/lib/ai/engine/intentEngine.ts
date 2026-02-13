/**
 * Motor de intención: detecta intent a partir del texto del usuario.
 * Usa solo knowledge (patrones) y política de respuesta; sin búsqueda ni acciones.
 */

import { getIntentPatterns } from "@/lib/ai/knowledge";
import type { IntentKind } from "@/lib/ai/knowledge";
import { ensureNoForbiddenPhrase, getOrientationMessage } from "./response-policy";

export interface IntentResult {
  kind: IntentKind;
  message: string;
}

export function detectIntent(query: string): IntentResult {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return {
      kind: "general",
      message: "Escribí qué necesitás y te guío.",
    };
  }

  const patterns = getIntentPatterns();
  for (const pattern of patterns) {
    const match = pattern.keywords.some((kw) =>
      normalized.includes(kw.toLowerCase())
    );
    if (match) {
      const msg = ensureNoForbiddenPhrase(pattern.message, query);
      return { kind: pattern.kind as IntentKind, message: msg };
    }
  }

  const fallback = ensureNoForbiddenPhrase(
    "Encontré opciones que podrían ayudarte.",
    query
  );
  return { kind: "general", message: fallback };
}
