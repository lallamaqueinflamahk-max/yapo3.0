/**
 * Semáforo: Verde / Amarillo / Rojo.
 * Basado en uso, fraude y rol. Afecta acciones permitidas.
 */

/** Estado del semáforo: Verde = permitido, Amarillo = validación, Rojo = bloqueado. */
export type SemaphoreState = "green" | "yellow" | "red";

/** Factores que determinan el estado del semáforo. */
export interface SemaphoreFactors {
  /** Nivel de uso (0–1): bajo = 0, alto = 1. Ej: transacciones/día normalizado. */
  usage: number;
  /** Riesgo de fraude (0–1): bajo = 0, alto = 1. Ej: score de fraude o señales. */
  fraud: number;
  /** Rol del usuario (vale, capeto, kavaju, mbarete, cliente, pyme, enterprise). */
  role: string;
}

/** Resultado del semáforo: estado + razón y factores opcionales. */
export interface SemaphoreResult {
  state: SemaphoreState;
  /** Mensaje para UI o Cerebro. */
  reason?: string;
  /** Factores que produjeron el estado (para auditoría/UI). */
  factors?: SemaphoreFactors;
  /** Si requiere validación adicional (biometría, confirmación) antes de acciones sensibles. */
  requiresValidation?: boolean;
  /** Si bloquea todas las acciones sensibles. */
  blocked?: boolean;
}

/** Etiquetas en español para UI. */
export const SEMAPHORE_STATE_LABELS: Record<SemaphoreState, string> = {
  green: "Verde",
  yellow: "Amarillo",
  red: "Rojo",
};

export function isSemaphoreBlocked(state: SemaphoreState): boolean {
  return state === "red";
}

export function isSemaphoreRequiresValidation(state: SemaphoreState): boolean {
  return state === "yellow";
}

export function isSemaphoreAllowed(state: SemaphoreState): boolean {
  return state === "green";
}
