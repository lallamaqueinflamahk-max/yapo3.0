/**
 * Punto único de entrada al Cerebro: runCerebroWithIntent(intent, context).
 * Orquesta decide() y devuelve CerebroResult (message, suggestedActions, navigationTarget, requiresValidation).
 */

import { decide } from "./decide";
import type { CerebroIntent, CerebroContext, CerebroResult } from "./types";

export async function runCerebroWithIntent(
  intent: CerebroIntent,
  context: CerebroContext
): Promise<CerebroResult> {
  const result = decide(intent, context);

  return {
    message: result.message,
    suggestedActions: result.suggestedActions ?? [],
    navigationTarget: result.navigationTarget,
    requiresValidation: result.requiresValidation ?? false,
  };
}
