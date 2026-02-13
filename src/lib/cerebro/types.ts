/**
 * Tipos del núcleo Cerebro YAPÓ.
 * Este módulo decide TODO: permisos, flujos, autorizaciones y sugerencias.
 * Sin UI. Sin OpenAI. 100% testeable.
 */

/** Rol del usuario en el sistema (alineado con roles YAPÓ). */
export type RoleId =
  | "vale"
  | "capeto"
  | "kavaju"
  | "mbarete"
  | "cliente"
  | "pyme"
  | "enterprise";

/** Alias para compatibilidad con consumidores existentes. */
export type CerebroRole = RoleId;

/** Identificador de acción evaluada por el Cerebro. */
export type ActionId =
  | "release_payment"
  | "hold_payment"
  | "validate_task"
  | "view"
  | "admin"
  | "contract_publish"
  | "contract_view"
  | string;

/**
 * Contexto de entrada para una decisión.
 * Todo lo que el Cerebro necesita para decidir.
 */
export interface CerebroContext {
  userId: string;
  roles: RoleId[];
  action: ActionId;
  origin: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Decisión de salida del Cerebro.
 * Decisiones claras; no booleanos sueltos.
 */
export interface CerebroDecision {
  authorized: boolean;
  reason: string;
  allowedActions: ActionId[];
  nextSteps: string[];
  events: string[];
}

/** Forma legacy para consumidores que usan decidir(). */
export interface Decision {
  authorized: boolean;
  reason?: string;
  allowedActions: string[];
  events: string[];
}
