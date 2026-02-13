/**
 * Planificador de acciones: intent + contexto → acción permitida o denegada.
 * Delega en intentResolver (resolveIntentToAction).
 */

import { resolveIntentToAction } from "./intentResolver";
import type { ResolveIntentResult, ResolvedAction } from "./intentResolver";
import type { CerebroContext } from "@/lib/ai/cerebroContext";
import type { ParseIntentResult } from "./intentParser";
import type { IntentEntity } from "./textAnalyzer";

export type { ResolveIntentResult, ResolvedAction };

export interface PlanActionInput {
  parsed: ParseIntentResult;
  context: CerebroContext;
}

/**
 * Planifica la acción a ejecutar a partir del intent parseado y el contexto.
 * Usa parsed.entry?.action como actionId cuando viene del knowledge-base.
 */
export function planAction(input: PlanActionInput): ResolveIntentResult {
  const { parsed, context } = input;
  const actionId = parsed.entry?.action;
  const entity: IntentEntity = actionId
    ? { actionId, path: "/wallet", label: "Billetera" }
    : {};
  const intentType = parsed.intentId ? "action" : "search";
  const analysis: import("./textAnalyzer").TextAnalysisResult = {
    intentType: intentType as import("./textAnalyzer").IntentType,
    entity,
    confidence: parsed.confidence,
  };
  return resolveIntentToAction(analysis, context);
}
