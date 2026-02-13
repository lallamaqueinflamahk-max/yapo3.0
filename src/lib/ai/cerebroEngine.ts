/**
 * CerebroEngine: orquestador por intents (chips → decide → CerebroResult).
 * Chips emiten intentId + payload; el engine llama decide(intent, context) y devuelve CerebroResult.
 * Incluye: mensaje, navegación, acciones sugeridas, requiereValidación.
 * Log en consola para debugging; preparado para OpenAI + ElevenLabs (capa texto/voz encima).
 */

import { decide } from "@/lib/ai/cerebro/CerebroEngine";
import type { CerebroIntent, CerebroContext, CerebroResult } from "@/lib/ai/cerebro/index";
import { getBiometricValidatedForContext } from "@/lib/security/biometrics";

const LOG_PREFIX = "[CerebroEngine]";

/**
 * Ejecuta un intent en el contexto dado y devuelve CerebroResult.
 * Todas las acciones reales (mock) pasan por aquí: wallet, escudos, navegación.
 */
export function runWithIntent(intent: CerebroIntent, context: CerebroContext): CerebroResult {
  if (typeof window !== "undefined") {
    console.log(`${LOG_PREFIX} intent emitido`, {
      intentId: intent.intentId,
      payload: intent.payload ?? {},
      source: intent.source,
      userId: context.userId,
      role: context.role,
    });
  }

  const result = decide(intent, context);

  if (typeof window !== "undefined") {
    console.log(`${LOG_PREFIX} resultado`, {
      allowed: result.allowed,
      message: result.message,
      navigationTarget: result.navigationTarget?.screen,
      requiresValidation: result.requiresValidation,
      validationType: result.validationType,
    });
  }

  return result;
}

/**
 * Construye CerebroContext desde sesión/identidad (para uso en UI).
 * Compatible con useSession() y SAFE MODE.
 */
export function buildIntentContext(params: {
  userId: string;
  role: CerebroContext["role"];
  currentScreen?: string;
  location?: { lat: number; lng: number };
  biometricValidated?: { level: number; at: number };
}): CerebroContext {
  const biometricValidated =
    params.biometricValidated ?? getBiometricValidatedForContext();
  return {
    userId: params.userId,
    role: params.role,
    currentScreen: params.currentScreen ?? "/",
    location: params.location,
    biometricValidated: biometricValidated ?? undefined,
  };
}

export type { CerebroIntent, CerebroContext, CerebroResult };
