/**
 * Motor de la barra Cerebro.
 * Primero intenta la base de conocimiento (processInput); si hay match, devuelve esa respuesta.
 * Si no, usa queryToAction + decidir() para navegación por palabras clave.
 * Sin llamadas externas (OpenAI/ElevenLabs no conectados aquí).
 */

import { decidir } from "./engine";
import type { RoleId } from "./types";
import type { Decision } from "./types";
import { CEREBRO_ACTIONS } from "./rules";
import { processInput } from "@/lib/ai/cerebro";
import type { ProcessInputResult } from "@/lib/ai/cerebro";

export interface BarScreenContext {
  /** Ruta actual (origen: pantalla actual). */
  screen: string;
  /** Usuario actual (desde SAFE MODE o sesión). */
  userId: string;
  /** Roles del usuario (desde sesión). */
  roles: RoleId[];
  /** Monto opcional si la query lo menciona (futuro: NER). */
  amount?: number;
}

/** Una acción sugerida en la UI: id, label y href para navegación. */
export interface BarSuggestedAction {
  id: string;
  label: string;
  href: string;
}

/** Resultado de la barra: respuesta, autorización, acciones sugeridas, navegación. */
export interface BarResult {
  /** Texto de respuesta (reason del Cerebro o mensaje amigable). */
  response: string;
  /** Si la acción consultada está autorizada. */
  authorized: boolean;
  /** Acciones permitidas para el rol, mapeadas a label + href. */
  suggestedActions: BarSuggestedAction[];
  /** Navegación directa principal (ej. "Ir a Billetera"). */
  navigation?: { href: string; label: string };
  /** Eventos del Cerebro (auditoría). */
  events: string[];
  /** Decisión cruda (opcional, para debugging). */
  decision?: Decision;
}

/** Mapeo acción canónica → label y ruta para la UI. */
const ACTION_UI: Record<string, { label: string; href: string }> = {
  [CEREBRO_ACTIONS.release_payment]: { label: "Liberar pago", href: "/wallet" },
  [CEREBRO_ACTIONS.hold_payment]: { label: "Retener pago", href: "/wallet" },
  [CEREBRO_ACTIONS.validate_task]: { label: "Validar tarea", href: "/dashboard" },
  [CEREBRO_ACTIONS.view]: { label: "Ver", href: "/home" },
  [CEREBRO_ACTIONS.admin]: { label: "Admin", href: "/profile" },
  contract_publish: { label: "Transferir", href: "/wallet" },
  contract_view: { label: "Ver Wallet", href: "/wallet" },
};

/** Palabras clave en la query → acción del Cerebro. */
const QUERY_TO_ACTION: { pattern: RegExp; action: string }[] = [
  { pattern: /\b(liberar|soltar|pagar)\s*(pago|plata)?/i, action: CEREBRO_ACTIONS.release_payment },
  { pattern: /\b(transferir|transferencia|fondos|plata)\b/i, action: "contract_publish" },
  { pattern: /\b(retener|retener\s*pago|hold)\b/i, action: CEREBRO_ACTIONS.hold_payment },
  { pattern: /\b(validar|validación)\s*(tarea|trabajo)?/i, action: CEREBRO_ACTIONS.validate_task },
  { pattern: /\b(admin|administrar)\b/i, action: CEREBRO_ACTIONS.admin },
  { pattern: /\b(billetera|wallet|saldo)\b/i, action: "contract_view" },
  { pattern: /\b(ver|inicio|home|perfil|chat)\b/i, action: CEREBRO_ACTIONS.view },
];

const DEFAULT_ACTION = CEREBRO_ACTIONS.view;
const ORIGIN_BAR = "cerebro-bar";

/**
 * Resuelve la query de texto a una acción del Cerebro.
 */
export function queryToAction(query: string): string {
  const q = (query ?? "").trim();
  if (!q) return DEFAULT_ACTION;
  for (const { pattern, action } of QUERY_TO_ACTION) {
    if (pattern.test(q)) return action;
  }
  return DEFAULT_ACTION;
}

/**
 * Convierte el resultado de processInput (base de conocimiento) a BarResult.
 */
function processInputResultToBarResult(result: ProcessInputResult): BarResult {
  const suggestedActions: BarSuggestedAction[] = (result.suggestedActions ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    href: s.href ?? "#",
  }));
  return {
    response: result.text?.trim() || result.reason || "Listo.",
    authorized: result.actionAllowed,
    suggestedActions,
    navigation: result.navigation,
    events: ["cerebro-bar:knowledge"],
  };
}

/**
 * Ejecuta la barra: primero intenta la base de conocimiento (wallet, intents).
 * Si hay match (intentId), devuelve esa respuesta. Si no, usa palabras clave + decidir().
 */
export function runBarQuery(query: string, context: BarScreenContext): BarResult {
  const trimmed = query.trim();
  if (trimmed) {
    const userContext = {
      screen: context.screen,
      roles: context.roles as string[],
      userId: context.userId,
      verified: false,
    };
    try {
      const result = processInput(trimmed, userContext);
      if (result.intentId != null) {
        return processInputResultToBarResult(result);
      }
    } catch {
      // Si falla processInput, seguimos con el flujo por palabras clave.
    }
  }

  const action = queryToAction(query);
  const decision = decidir({
    userId: context.userId,
    roles: context.roles,
    action,
    origin: ORIGIN_BAR,
    amount: context.amount,
    metadata: { screen: context.screen, query: trimmed },
  });

  const suggestedActions: BarSuggestedAction[] = decision.allowedActions
    .map((a) => {
      const ui = ACTION_UI[a];
      if (!ui) return null;
      return { id: a, label: ui.label, href: ui.href };
    })
    .filter((a): a is BarSuggestedAction => a !== null);

  const response = decision.reason ?? (decision.authorized ? "Acción permitida." : "Acción no permitida para tu rol.");
  const navigation =
    suggestedActions.length > 0 && action !== CEREBRO_ACTIONS.view
      ? { href: ACTION_UI[action]?.href ?? "/home", label: ACTION_UI[action]?.label ?? "Ver" }
      : undefined;

  const legacyDecision: Decision = {
    authorized: decision.authorized,
    reason: decision.reason,
    allowedActions: decision.allowedActions as string[],
    events: decision.events,
  };

  return {
    response,
    authorized: decision.authorized,
    suggestedActions,
    navigation,
    events: decision.events,
    decision: legacyDecision,
  };
}
