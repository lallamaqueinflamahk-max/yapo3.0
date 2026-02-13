/**
 * Motor de razonamiento del Cerebro.
 * Orden obligatorio: buscar en (a) conocimiento YAPÓ, (b) FAQ, (c) aprendizaje.
 * Si hay respuesta suficiente → usar solo conocimiento interno; nunca "no sé".
 * Si no hay → orientar dentro del ecosistema (sin GPT por ahora).
 */

import {
  INTENT_PATTERNS,
  DEFAULT_SUGGESTIONS,
} from "@/lib/ai/knowledge-base/intents";
import { searchInOrder } from "./search";
import { ensureNoForbiddenPhrase, getOrientationMessage } from "./response-policy";
import type {
  CerebroResult,
  IntentKind,
  Suggestion,
  Action,
  NavRoute,
} from "./types";

const ROUTES_BY_INTENT: Record<IntentKind, NavRoute[]> = {
  buscar_trabajo: [{ path: "/home", label: "Inicio", description: "Ver trabajos y ofertas" }],
  ver_perfil: [{ path: "/profile", label: "Perfil", description: "Ver y editar tu perfil" }],
  ir_billetera: [{ path: "/wallet", label: "Billetera", description: "Pagos y saldo" }],
  ir_chat: [{ path: "/chat", label: "Chat", description: "Mensajes" }],
  ir_inicio: [{ path: "/home", label: "Inicio", description: "Pantalla principal" }],
  general: [
    { path: "/home", label: "Inicio" },
    { path: "/cerebro", label: "Cerebro" },
    { path: "/chat", label: "Chat" },
    { path: "/wallet", label: "Billetera" },
    { path: "/profile", label: "Perfil" },
  ],
};

function detectIntent(query: string): { kind: IntentKind; message: string } {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { kind: "general", message: "Escribí qué necesitás y te guío." };
  }

  for (const pattern of INTENT_PATTERNS) {
    const match = pattern.keywords.some((kw) =>
      normalized.includes(kw.toLowerCase())
    );
    if (match) {
      const msg = ensureNoForbiddenPhrase(pattern.message, query);
      return { kind: pattern.kind, message: msg };
    }
  }

  const fallback = ensureNoForbiddenPhrase(
    "Encontré opciones que podrían ayudarte.",
    query
  );
  return { kind: "general", message: fallback };
}

function buildActions(intent: IntentKind): Action[] {
  const routes = ROUTES_BY_INTENT[intent] ?? ROUTES_BY_INTENT.general;
  return routes.map((r) => ({
    id: r.path,
    label: r.label,
    href: r.path,
    description: r.description,
  }));
}

function buildSuggestions(intent: IntentKind, query: string): Suggestion[] {
  if (query.trim()) {
    return DEFAULT_SUGGESTIONS.filter((s) =>
      s.text.toLowerCase().includes(query.trim().toLowerCase())
    ).slice(0, 4);
  }
  return DEFAULT_SUGGESTIONS;
}

/**
 * Analiza la consulta: primero búsqueda obligatoria (conocimiento → FAQ → aprendizaje).
 * Si hay respuesta suficiente en YAPÓ, usa solo esa; si no, intención + orientación (nunca "no sé").
 */
export function analyzeQuery(query: string): CerebroResult {
  const searchResult = searchInOrder(query);
  let message: string;

  if (searchResult.sufficient && searchResult.message) {
    message = ensureNoForbiddenPhrase(searchResult.message, query);
  } else {
    const { message: intentMessage } = detectIntent(query);
    message = intentMessage.trim()
      ? ensureNoForbiddenPhrase(intentMessage, query)
      : getOrientationMessage(query);
  }

  const { kind: intent } = detectIntent(query);
  const suggestions = buildSuggestions(intent, query);
  const actions = buildActions(intent);
  const routes = ROUTES_BY_INTENT[intent] ?? ROUTES_BY_INTENT.general;

  return {
    intent,
    suggestions,
    actions,
    routes,
    message,
    ...(searchResult.sufficient && {
      screen: searchResult.screen,
      suggestedActions: searchResult.suggestedActions,
    }),
  };
}
