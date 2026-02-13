/**
 * Hook/helper: factores (uso, fraude, rol) → estado del semáforo.
 * Para usar en UI o en guards que afectan acciones permitidas.
 */

import { useMemo } from "react";
import { getSemaphoreState } from "./compute";
import { isActionAllowedBySemaphore } from "./allowedActions";
import type { SemaphoreFactors, SemaphoreResult, SemaphoreState } from "./types";

export interface UseSemaphoreInput {
  /** Uso normalizado 0–1. */
  usage: number;
  /** Riesgo fraude 0–1. */
  fraud: number;
  /** Rol del usuario. */
  role: string;
}

export interface UseSemaphoreReturn {
  result: SemaphoreResult;
  state: SemaphoreState;
  isBlocked: boolean;
  requiresValidation: boolean;
  isActionAllowed: (actionId: string) => { allowed: boolean; requiresValidation?: boolean };
}

/**
 * Calcula el semáforo a partir de uso, fraude y rol.
 * Devuelve result, state y helper isActionAllowed para filtrar acciones.
 */
export function useSemaphore(input: UseSemaphoreInput): UseSemaphoreReturn {
  return useMemo(() => {
    const factors: SemaphoreFactors = {
      usage: input.usage,
      fraud: input.fraud,
      role: input.role,
    };
    const result = getSemaphoreState(factors);
    return {
      result,
      state: result.state,
      isBlocked: result.blocked ?? result.state === "red",
      requiresValidation: result.requiresValidation ?? result.state === "yellow",
      isActionAllowed: (actionId: string) =>
        isActionAllowedBySemaphore(result.state, actionId),
    };
  }, [input.usage, input.fraud, input.role]);
}

/**
 * Versión síncrona sin hook: para usar en guards o server.
 */
export function getSemaphoreResult(factors: SemaphoreFactors): SemaphoreResult {
  return getSemaphoreState(factors);
}
