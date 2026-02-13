/**
 * Cerebro: punto de entrada unificado del asistente AI.
 * Orquesta: input → intent → contexto → acción → respuesta.
 * Integra wallet, permisos y navegación. Solo lógica, sin UI.
 */

import { parseIntent } from "./engine/intentParser";
import { resolveContext } from "./engine/contextResolver";
import { planAction } from "./engine/actionPlanner";
import { buildResponse } from "./engine/responseBuilder";
import { buildCerebroContext } from "./cerebroContext";
import { getWalletIntents } from "./knowledge";
import { createSpeechToText } from "./voice/speechToText";
import { createTextToSpeech } from "./voice/textToSpeech";
import type { ParseIntentResult, IntentEntry, KnowledgeBase } from "./engine/intentParser";
import type { UserContext, ResolvedContext, SessionState } from "./engine/contextResolver";
import type { CerebroContext } from "./cerebroContext";
import type { ResolveIntentResult } from "./engine/actionPlanner";
import type { ActionResultResponse } from "./engine/responseBuilder";
import type { CerebroFinalResponse } from "./engine/responseBuilder";
import type { WebSpeechAPIHandle } from "./voice/capture";
import type { SpeechSynthesisAPIHandle } from "./voice/output";

/** Resultado de processInput: respuesta + contexto enriquecido (wallet, permisos). */
export interface ProcessInputResult extends ActionResultResponse {
  /** Balance de la wallet (si aplica). */
  balance?: number;
  /** Permisos del usuario (ej. wallet:view, wallet:transfer). */
  permissions: string[];
  /** Si la acción está permitida. */
  actionAllowed: boolean;
  /** Motivo cuando actionAllowed es false. */
  reason?: string;
  /** Paso previo sugerido cuando no permitido (no romper flujo). */
  suggestedStep?: { label: string; href: string };
  /** Intent detectado (ej. wallet_balance). */
  intentId?: string | null;
  /** Acción canónica (ej. wallet:view). */
  action?: string;
}

/**
 * Orquesta todo el flujo: input → intent → contexto → acción → respuesta.
 * Integra wallet, permisos y navegación. Sin UI.
 */
export function processInput(
  text: string,
  userContext: UserContext
): ProcessInputResult {
  const knowledgeBase = getWalletIntents();
  const parsed = parseIntent(text.trim(), knowledgeBase);
  const intent = parsed.intentId ?? parsed.entry?.action ?? "general";
  const resolvedContext = resolveContext(intent, userContext);

  const identity = userContext.userId
    ? {
        userId: userContext.userId,
        roles: userContext.roles,
        verified: userContext.verified,
      }
    : null;
  const cerebroContext: CerebroContext = buildCerebroContext({
    identity,
    permissions: resolvedContext.permissions,
    screen: userContext.screen,
    memory: [],
  });

  const actionResult: ResolveIntentResult = planAction({
    parsed,
    context: cerebroContext,
  });

  const response = buildResponse(actionResult);

  // CEREBRO CENTRAL: si la acción no está permitida, agregar paso sugerido (no romper flujo).
  const suggestedActions = [...response.suggestedActions];
  if (!resolvedContext.actionAllowed && resolvedContext.suggestedStep) {
    suggestedActions.push({
      id: "suggested-step",
      label: resolvedContext.suggestedStep.label,
      href: resolvedContext.suggestedStep.href,
      description: resolvedContext.reason,
    });
  }

  return {
    ...response,
    suggestedActions,
    balance: resolvedContext.balance,
    permissions: resolvedContext.permissions,
    actionAllowed: resolvedContext.actionAllowed,
    reason: resolvedContext.reason,
    suggestedStep: resolvedContext.suggestedStep,
    intentId: parsed.intentId,
    action: resolvedContext.action,
  };
}

export { parseIntent, resolveContext, planAction, buildResponse, buildFinalResponse };
export { createSpeechToText, createTextToSpeech };
// Re-export desde cerebro/ para que @/lib/ai/cerebro (este archivo) exponga decide y runCerebroWithIntent
export { decide, runCerebroWithIntent, processInputWithIntent, useCerebroNavigation } from "./cerebro/index";
export type {
  ParseIntentResult,
  IntentEntry,
  KnowledgeBase,
  UserContext,
  ResolvedContext,
  SessionState,
  CerebroContext,
  ResolveIntentResult,
  CerebroFinalResponse,
  ActionResultResponse,
  WebSpeechAPIHandle,
  SpeechSynthesisAPIHandle,
};
export type { CerebroResult, CerebroAction } from "./cerebro/index";
