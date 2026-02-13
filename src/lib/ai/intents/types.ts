/**
 * Tipos base del modelo de intents del Cerebro.
 * El Cerebro entiende QUÉ se quiere hacer (intent) antes de decidir CÓMO (result).
 * Sin UI; deterministico y extensible; preparado para NLP luego.
 */

import type { RoleId } from "@/lib/auth";

// -----------------------------------------------------------------------------
// Intent IDs y categorías
// -----------------------------------------------------------------------------

/** Identificador canónico de un intent (ej. search.workers, navigate.wallet). */
export type IntentId = string;

/** Categoría del intent: search, navigate, action, info. */
export type IntentCategory = "search" | "navigate" | "action" | "info";

/** Acción resultante: búsqueda, navegación a pantalla, o ejecución directa. */
export type ResultAction = "search" | "navigate" | "execute";

/** Parámetros esperados del intent (payload). */
export type IntentPayload = Record<string, unknown>;

// -----------------------------------------------------------------------------
// Definición de un intent en el catálogo
// -----------------------------------------------------------------------------

export interface IntentDefinition {
  /** ID canónico (ej. search.workers). */
  id: IntentId;
  /** Categoría. */
  category: IntentCategory;
  /** Descripción legible (para logs y NLP). */
  description: string;
  /** Roles que pueden disparar este intent (vacío = todos los autenticados). */
  allowedRoles: RoleId[];
  /** Parámetros esperados (nombres; validación opcional). */
  expectedParams?: string[];
  /** Acción resultante: search | navigate | execute. */
  resultAction: ResultAction;
  /** Ruta de navegación si resultAction === "navigate". */
  navigationTarget?: string;
  /** Si la acción requiere validación adicional (ej. Cerebro Central, biometría). */
  requiresValidation?: boolean;
  /** Mensaje por defecto cuando se autoriza. */
  defaultMessage?: string;
  /** Mensaje cuando se deniega por rol. */
  deniedMessage?: string;
}

// -----------------------------------------------------------------------------
// Intent enviado al Cerebro (input)
// -----------------------------------------------------------------------------

/** Intent estructurado que recibe el Cerebro (no string suelto). */
export interface CerebroIntent {
  /** ID del intent (del catálogo). */
  intentId: IntentId;
  /** Parámetros opcionales (query, filters, etc.). */
  payload?: IntentPayload;
  /** Etiqueta para UI / accesibilidad (opcional). */
  label?: string;
  /** Texto original si vino de NLP (opcional, para trazabilidad). */
  rawQuery?: string;
}

// -----------------------------------------------------------------------------
// Contexto de decisión (input)
// -----------------------------------------------------------------------------

/** Usuario mínimo para decisión. */
export interface DecideUser {
  userId: string;
  roles: RoleId[];
  verified?: boolean;
}

/**
 * Contexto pasado a decide(context, intent).
 * Para usar con buildCerebroContext() ver @/lib/ai/cerebroContext (CerebroContext).
 */
export interface DecideContext {
  /** Usuario actual (null = anónimo). */
  user: DecideUser | null;
  /** Pantalla actual / ruta (ej. /wallet, /cerebro). */
  screen: string;
  /** IDs de acciones permitidas (ej. wallet:transfer). */
  permissions: string[];
  /** Historial corto (últimas intenciones/respuestas) para contexto. */
  history?: { intentId?: IntentId; at: number }[];
  /** Validación biométrica reciente (evita re-pedir en la misma ventana). */
  biometricValidated?: { level: number; at: number };
}

// -----------------------------------------------------------------------------
// Resultado de decisión (output)
// -----------------------------------------------------------------------------

export interface SuggestedAction {
  id: string;
  label: string;
  /** Navegación: ruta. Ejecución: identificador de acción. */
  target?: string;
  /** Tipo: navigate | execute | search. */
  type?: "navigate" | "execute" | "search";
}

/** Estado final opcional (ej. wallet_transfer: transactionId, status). */
export type CerebroResultState = Record<string, unknown>;

/** Resultado de cerebro.decide(context, intent). Determinístico. */
export interface CerebroResult {
  /** Mensaje para el usuario (autorizado, denegado, sugerencia). */
  message: string;
  /** Acciones sugeridas (navegación, siguiente paso). */
  suggestedActions: SuggestedAction[];
  /** Ruta a la que navegar si aplica (navigate). */
  navigationTarget?: string;
  /** Si la acción requiere validación adicional antes de ejecutar (ej. biometría). */
  requiresValidation: boolean;
  /** Tipo: "biometric" = flujo biométrico; "confirmation" = confirmación simple. Emitido cuando requiresValidation. */
  validationType?: "biometric" | "confirmation";
  /** Si el intent fue autorizado. */
  allowed: boolean;
  /** Intent ID que se evaluó (para trazabilidad). */
  intentId: IntentId;
  /** Razón cuando allowed === false (rol, permiso, etc.). */
  reason?: string;
  /** Estado final opcional (ej. transactionId, status para wallet_transfer). */
  state?: CerebroResultState;
  /** Nivel biométrico requerido (1–3) cuando validationType === "biometric". */
  requiresBiometricLevel?: 0 | 1 | 2 | 3;
}
