/**
 * OpenAIEngine: conecta Cerebro con OpenAI.
 * - processInput(): texto + contexto → CerebroResult unificado.
 * - Base de conocimiento local primero; si no hay match, OpenAI (inferIntent + runCerebro).
 * Solo server-side; nunca exponer API key al frontend.
 */

import type { CerebroContext, CerebroResult, CerebroAction } from "@/lib/ai/cerebro";
import type { CerebroContext as RunContext, CerebroRole } from "@/lib/ai/cerebro/types";
import { searchKnowledgeBase, actions as kbActions } from "@/data/knowledge-base";
import type { KnowledgeSearchResult } from "@/data/knowledge-base";
import type { ActionEntry } from "@/data/knowledge-base";
import { inferIntent } from "@/lib/ai/adapters/openaiEngine";
import { runCerebroWithIntent } from "@/lib/ai/cerebro/runCerebro";

/** Umbral mínimo de score (0–1) para considerar la KB local como respuesta válida. */
const LOCAL_KB_THRESHOLD = 0.35;

/** Longitud máxima del mensaje generado desde la KB (caracteres). */
const MAX_KB_MESSAGE_LENGTH = 320;

/**
 * Construye un mapa label → screen desde las acciones de la KB para resolver NAVIGATE.
 */
function buildLabelToScreenMap(): Map<string, string> {
  const map = new Map<string, string>();
  const entries = kbActions as ActionEntry[];
  for (const entry of entries) {
    if (entry.label && entry.screen) {
      map.set(entry.label.trim(), entry.screen);
    }
  }
  return map;
}

const labelToScreen = buildLabelToScreenMap();

/**
 * Convierte un resultado de la base de conocimiento local en CerebroResult.
 */
function kbResultToCerebroResult(best: KnowledgeSearchResult): CerebroResult {
  const message =
    best.content.length > MAX_KB_MESSAGE_LENGTH
      ? `${best.content.slice(0, MAX_KB_MESSAGE_LENGTH).trim()}…`
      : best.content;

  const actions: CerebroAction[] = (best.suggestedActions ?? []).flatMap((label) => {
    const screen = labelToScreen.get(label.trim());
    if (!screen) return [];
    return [{ type: "NAVIGATE" as const, payload: { screen }, label }];
  });

  return {
    message,
    severity: "green",
    allowed: true,
    actions: actions.length > 0 ? actions : undefined,
    navigation: best.screen
      ? { screen: best.screen, params: {} }
      : undefined,
    navigationTarget: best.screen
      ? { screen: best.screen, params: {} }
      : undefined,
  };
}

export type ProcessInputParams = {
  text: string;
  context: CerebroContext;
};

/**
 * Punto de entrada unificado: procesa el texto del usuario y devuelve un CerebroResult.
 * 1. Consulta la base de conocimiento local primero.
 * 2. Si hay un match con score >= LOCAL_KB_THRESHOLD, devuelve CerebroResult desde la KB.
 * 3. Si no, infiere intent vía OpenAI y ejecuta runCerebroWithIntent (Cerebro decide y devuelve CerebroResult).
 */
export async function processInput({
  text,
  context,
}: ProcessInputParams): Promise<CerebroResult> {
  const query = (text ?? "").trim();
  if (!query) {
    return {
      message: "Escribí qué necesitás y te guío.",
      severity: "green",
      allowed: true,
    };
  }

  const localResults = searchKnowledgeBase(query);
  const best = localResults[0];
  if (best && best.score >= LOCAL_KB_THRESHOLD) {
    return kbResultToCerebroResult(best);
  }

  const inferredIntent = await inferIntent(text, context);
  const runContext: RunContext = {
    userId: context.user?.userId ?? "",
    role: (context.roles?.[0] ?? "cliente") as CerebroRole,
    currentScreen: context.screen,
  };
  return runCerebroWithIntent(inferredIntent, runContext);
}
