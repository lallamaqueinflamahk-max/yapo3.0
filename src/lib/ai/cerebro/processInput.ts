/**
 * processInput: texto + userContext → inferIntent → runCerebroWithIntent.
 * Punto de entrada unificado para chat/voice: NLP propone intent, Cerebro decide y ejecuta.
 */

import { inferIntent } from "@/lib/ai/adapters/openaiEngine";
import { runCerebroWithIntent } from "./runCerebro";
import type { CerebroContext, CerebroResult } from "./types";

export type ProcessInputWithIntentParams = {
  text: string;
  userContext: CerebroContext;
};

/**
 * Interpreta el texto (NLP/inferIntent) y ejecuta el Cerebro (runCerebroWithIntent).
 * inferredIntent debe ser CerebroIntent; el Cerebro valida y devuelve CerebroResult.
 */
export async function processInputWithIntent({
  text,
  userContext,
}: ProcessInputWithIntentParams): Promise<CerebroResult> {
  const inferredIntent = await inferIntent(text, userContext);
  return runCerebroWithIntent(inferredIntent, userContext);
}
