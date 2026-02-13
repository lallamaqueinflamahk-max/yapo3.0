/**
 * Modelo definitivo CerebroIntent y CerebroResult para toda la app YAPÓ.
 * Punto único de entrada: intent + contexto → decide() → result.
 * Arquitectura: sistemas cognitivos + producto.
 */

// -----------------------------------------------------------------------------
// CerebroIntent — qué quiere hacer el usuario
// -----------------------------------------------------------------------------

/** Origen del intent (chip, chat, voz, sistema). */
export type CerebroIntentSource = "chip" | "chat" | "voice" | "system";

export interface CerebroIntent {
  /** Identificador canónico del intent. */
  intentId: string;
  /** Origen: chip, chat, voice, system. */
  source: CerebroIntentSource;
  /** Parámetros opcionales (query, screen, amount, etc.). */
  payload?: Record<string, unknown>;
  /** Rol con el que se emite (opcional; si no se envía, se usa el del contexto). */
  role?: CerebroRole;
  /** Si el intent exige usuario autenticado para ser evaluado. */
  requiresAuth?: boolean;
}

// -----------------------------------------------------------------------------
// Intents base — catálogo mínimo para toda la app
// -----------------------------------------------------------------------------

export type CerebroBaseIntentId =
  | "ui_chip_click"
  | "wallet_action"
  | "chat_open"
  | "video_call_request"
  | "biometric_required"
  | "subsidy_check"
  | "role_switch";

/** IntentIds base; el resto (navigate.*, search.*, escudo_activate, etc.) se mapean o extienden desde aquí en el catálogo. */
export const CEREBRO_BASE_INTENTS: CerebroBaseIntentId[] = [
  "ui_chip_click",
  "wallet_action",
  "chat_open",
  "video_call_request",
  "biometric_required",
  "subsidy_check",
  "role_switch",
];

// -----------------------------------------------------------------------------
// CerebroResult — qué debe hacer la app (mensaje + acciones + severidad)
// -----------------------------------------------------------------------------

/** Tipos de acción que el Cerebro puede devolver. */
export type CerebroActionType =
  | "NAVIGATE"
  | "OPEN_MODAL"
  | "EXECUTE_WALLET"
  | "REQUEST_BIOMETRY"
  | "SHOW_WARNING"
  | "ACTIVATE_ESCUDO";

/** Semáforo de severidad para UI (verde / amarillo / rojo). */
export type CerebroSeverity = "green" | "yellow" | "red";

export interface CerebroAction {
  type: CerebroActionType;
  /** Parámetros de la acción (screen, modalId, amount, escudoId, etc.). */
  payload?: Record<string, unknown>;
  /** Etiqueta para UI (opcional). */
  label?: string;
}

export interface CerebroResult {
  /** Mensaje para el usuario (toast, panel, etc.). */
  message?: string;
  /** Acciones concretas a ejecutar (NAVIGATE, OPEN_MODAL, REQUEST_BIOMETRY, etc.). */
  actions?: CerebroAction[];
  /** Navegación directa (pantalla + params). Compatible con useCerebroNavigation. */
  navigation?: {
    screen: string;
    params?: Record<string, unknown>;
  };
  /** Si se requiere validación adicional (biometría, confirmación) antes de ejecutar. */
  requiresValidation?: boolean;
  /** Semáforo: green = ok, yellow = precaución, red = bloqueo / error. */
  severity?: CerebroSeverity;

  // --- Compatibilidad con capa existente (decide → intents) ---
  /** Si la acción fue autorizada por el Cerebro. */
  allowed?: boolean;
  /** Sugerencias como intents (legacy); preferir actions[]. */
  suggestedActions?: CerebroIntent[];
  /** Alias de navigation para compatibilidad. */
  navigationTarget?: {
    screen: string;
    params?: Record<string, unknown>;
  };
  /** Tipo de validación: biometric | confirmation. */
  validationType?: "biometric" | "confirmation";
  /** Estado final opcional (transactionId, status, etc.). */
  state?: Record<string, unknown>;
  /** Nivel biométrico requerido (1–3) cuando validationType === "biometric". */
  requiresBiometricLevel?: 0 | 1 | 2 | 3;
}

// -----------------------------------------------------------------------------
// Rol y contexto
// -----------------------------------------------------------------------------

/** Rol para contexto Cerebro; incluye laborales y contratantes. */
export type CerebroRole =
  | "vale"
  | "capeto"
  | "kavaju"
  | "mbarete"
  | "cliente"
  | "pyme"
  | "enterprise";

export type CerebroContext = {
  userId: string;
  role: CerebroRole;
  location?: { lat: number; lng: number };
  currentScreen?: string;
  /** Validación biométrica reciente (evita re-pedir en wallet_transfer). */
  biometricValidated?: { level: number; at: number };
};

// -----------------------------------------------------------------------------
// Constantes de acciones y severidad (para UI)
// -----------------------------------------------------------------------------

export const CEREBRO_ACTION_TYPES: CerebroActionType[] = [
  "NAVIGATE",
  "OPEN_MODAL",
  "EXECUTE_WALLET",
  "REQUEST_BIOMETRY",
  "SHOW_WARNING",
  "ACTIVATE_ESCUDO",
];

export const CEREBRO_SEVERITIES: CerebroSeverity[] = ["green", "yellow", "red"];
