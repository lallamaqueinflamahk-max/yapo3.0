/**
 * Motor de decisión del Cerebro (capa cerebro/).
 * Adapta tipos cerebro → intents, llama decide() del catálogo, devuelve CerebroResult.
 */

import { decide as decideIntents } from "@/lib/ai/intents";
import type { CerebroResult as IntentsCerebroResult, DecideContext } from "@/lib/ai/intents";
import type { CerebroIntent, CerebroContext, CerebroResult } from "./types";
import type { RoleId } from "@/lib/auth";

function toDecideContext(ctx: CerebroContext): DecideContext {
  const role: RoleId = ctx.role;
  return {
    user: {
      userId: ctx.userId,
      roles: [role],
      verified: undefined,
    },
    screen: ctx.currentScreen ?? "/",
    permissions: [],
    history: [],
    biometricValidated: ctx.biometricValidated,
  };
}

function toIntentsIntent(intent: CerebroIntent) {
  return {
    intentId: intent.intentId,
    payload: intent.payload,
    label: intent.intentId,
  };
}

function toCerebroResult(result: IntentsCerebroResult): CerebroResult {
  const suggestedActions: CerebroIntent[] = (result.suggestedActions ?? []).map(
    (a) => ({
      intentId: a.id ?? (a.target ? `navigate.${a.target}` : "navigate.home"),
      payload: a.target ? { screen: a.target } : {},
      source: "system" as const,
    })
  );

  return {
    allowed: result.allowed,
    message: result.message,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
    navigationTarget: result.navigationTarget
      ? { screen: result.navigationTarget, params: undefined }
      : undefined,
    requiresValidation: result.requiresValidation ?? false,
    validationType: result.validationType,
    state: result.state,
    requiresBiometricLevel: result.requiresBiometricLevel,
  };
}

/**
 * Decide el resultado para un intent en el contexto dado.
 * Punto de entrada único de la capa cerebro/.
 */
export function decide(intent: CerebroIntent, context: CerebroContext): CerebroResult {
  const decideContext = toDecideContext(context);
  const intentsIntent = toIntentsIntent(intent);
  const raw = decideIntents(decideContext, intentsIntent);
  return toCerebroResult(raw);
}
