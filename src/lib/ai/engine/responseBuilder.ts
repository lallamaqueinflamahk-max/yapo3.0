/**
 * Construcción de respuesta del Cerebro: mensaje, sugerencias, acciones, rutas.
 * Usa knowledge (rutas por intent, sugerencias) y política de respuesta.
 * buildResponse(actionResult): salida para texto y voz (TTS).
 */

import {
  getRoutesByIntent,
  getDefaultSuggestions,
  type IntentKind,
  type RouteEntry,
} from "@/lib/ai/knowledge";
import { ensureNoForbiddenPhrase, getOrientationMessage } from "./response-policy";
import type { CerebroResult, Action, NavRoute, Suggestion } from "./types";
import type { CerebroSearchResult } from "./search";
import type { ResolveIntentResult, ResolvedAction } from "./intentResolver";

/** Respuesta final del Cerebro: texto humano + sugerencias + acciones clickeables. */
export interface CerebroFinalResponse {
  /** Mensaje en lenguaje natural para el usuario. */
  text: string;
  /** Chips/sugerencias clickeables (refinan búsqueda). */
  suggestions: Suggestion[];
  /** Acciones clickeables (navegación o ejecución). */
  actions: ClickeableAction[];
  /** CTA principal opcional (ej. "Ir a Billetera"). */
  primaryAction?: { label: string; href: string };
  /** Etiquetas de acciones sugeridas por contexto (clickeables como query). */
  suggestedActionLabels?: string[];
}

/** Acción clickeable: link o botón con destino. */
export interface ClickeableAction {
  id: string;
  label: string;
  href: string;
  description?: string;
}

/** Respuesta construida a partir del resultado de una acción (para texto y TTS). */
export interface ActionResultResponse {
  /** Texto humano para mostrar en UI. */
  text: string;
  /** Acciones sugeridas (label + href o target). */
  suggestedActions: { id: string; label: string; href?: string; description?: string }[];
  /** Navegación principal si la acción es type navigate. */
  navigation?: { href: string; label: string };
  /** Mismo texto listo para TTS (sin markup, normalizado). */
  textForTTS: string;
}

export interface BuildResponseInput {
  intent: IntentKind;
  intentMessage: string;
  searchResult: CerebroSearchResult;
  query: string;
}

export function buildResponseFromIntent(input: BuildResponseInput): CerebroResult {
  const { intent, intentMessage, searchResult, query } = input;
  let message: string;

  if (searchResult.sufficient && searchResult.message) {
    message = ensureNoForbiddenPhrase(searchResult.message, query);
  } else {
    message = intentMessage.trim()
      ? ensureNoForbiddenPhrase(intentMessage, query)
      : getOrientationMessage(query);
  }

  const routes = getRoutesByIntent(intent);
  const actions: Action[] = routes.map((r) => routeToAction(r));
  const suggestions = buildSuggestionsForQuery(intent, query);
  const navRoutes: NavRoute[] = routes.map((r) => ({
    path: r.path,
    label: r.label,
    description: r.description,
  }));

  return {
    intent,
    suggestions,
    actions,
    routes: navRoutes,
    message,
    ...(searchResult.sufficient && {
      screen: searchResult.screen,
      suggestedActions: searchResult.suggestedActions,
    }),
  };
}

const SCREEN_LABELS: Record<string, string> = {
  "/home": "Inicio",
  "/profile": "Perfil",
  "/wallet": "Billetera",
  "/chat": "Chat",
  "/cerebro": "Cerebro",
};

/**
 * Construye la respuesta final del Cerebro: texto humano, sugerencias y acciones clickeables.
 * Pensada para la UI (overlay, barra, chat).
 */
export function buildFinalResponse(result: CerebroResult): CerebroFinalResponse {
  const text = result.message ?? "¿En qué te ayudo?";
  const suggestions = result.suggestions;
  const actions: ClickeableAction[] = result.actions.map((a) => ({
    id: a.id,
    label: a.label,
    href: a.href,
    description: a.description,
  }));
  const primaryAction = result.screen
    ? {
        label: `Ir a ${SCREEN_LABELS[result.screen] ?? result.screen}`,
        href: result.screen,
      }
    : undefined;
  const suggestedActionLabels = result.suggestedActions;

  return {
    text,
    suggestions,
    actions,
    ...(primaryAction && { primaryAction }),
    ...(suggestedActionLabels?.length && { suggestedActionLabels }),
  };
}

const SCREEN_LABELS_NAV: Record<string, string> = {
  "/home": "Inicio",
  "/profile": "Perfil",
  "/wallet": "Billetera",
  "/chat": "Chat",
  "/cerebro": "Cerebro",
  "/video": "Videollamada",
};

/**
 * Construye la respuesta final a partir del resultado de una acción.
 * Salida para texto (UI) y voz (TTS).
 */
export function buildResponse(
  actionResult: ResolveIntentResult
): ActionResultResponse {
  const text = actionResult.message?.trim() ?? "¿En qué te ayudo?";
  const suggestedActions: ActionResultResponse["suggestedActions"] = [];
  let navigation: ActionResultResponse["navigation"];

  if (actionResult.action) {
    const a = actionResult.action as ResolvedAction;
    const href = a.type === "navigate" ? a.target : (a.params?.path as string) ?? "/home";
    const label = (a.params?.label as string) ?? SCREEN_LABELS_NAV[href] ?? href;
    suggestedActions.push({
      id: a.target,
      label: a.type === "navigate" ? `Ir a ${label}` : label,
      href: a.type === "navigate" ? a.target : href,
      description: actionResult.message,
    });
    if (a.type === "navigate") {
      navigation = { href: a.target, label: SCREEN_LABELS_NAV[a.target] ?? label };
    }
  }

  const textForTTS = text.replace(/\s+/g, " ").trim();

  return {
    text,
    suggestedActions,
    ...(navigation && { navigation }),
    textForTTS,
  };
}

function routeToAction(r: RouteEntry): Action {
  return {
    id: r.path,
    label: r.label,
    href: r.path,
    description: r.description,
  };
}

function buildSuggestionsForQuery(_intent: IntentKind, query: string): Suggestion[] {
  const defaultList = getDefaultSuggestions();
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    return defaultList
      .filter((s) => s.text.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({ id: s.id, text: s.text, query: s.query }));
  }
  return defaultList.map((s) => ({ id: s.id, text: s.text, query: s.query }));
}
