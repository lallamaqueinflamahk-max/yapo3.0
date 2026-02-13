/**
 * Resolver intención → acción concreta.
 * Verifica: permisos, rol, estado de verificación.
 * Devuelve: allowed, action (navigate | execute | explain), message.
 */

import { hasPermissionForAction } from "@/lib/auth/permissions";
import type { CerebroContext } from "@/lib/ai/cerebroContext";
import type { TextAnalysisResult, IntentEntity } from "./textAnalyzer";

export type ResolvedActionType = "navigate" | "execute" | "explain";

export interface ResolvedAction {
  type: ResolvedActionType;
  /** Ruta (navigate), actionId (execute) o tema (explain). */
  target: string;
  /** Parámetros opcionales (ej. query para búsqueda). */
  params?: Record<string, unknown>;
}

export interface ResolveIntentResult {
  allowed: boolean;
  action?: ResolvedAction;
  message: string;
}

/** Acciones que requieren usuario verificado. */
const ACTIONS_REQUIRING_VERIFIED = new Set<string>([
  "wallet:transfer",
  "offer:create",
  "video:call",
]);

/** Mensaje cuando la acción requiere verificación (ej. videollamada / WhatsApp). */
const MESSAGE_VERIFICATION_REQUIRED_WHATSAPP =
  "Para usar WhatsApp primero necesitás verificar tu identidad.";

function checkAllowed(
  context: CerebroContext,
  actionId: string
): { allowed: boolean; message: string } {
  const hasPermission = context.permissions.includes(actionId);
  if (!hasPermission) {
    const denied = context.permissionDeniedMessages?.[actionId];
    const roleNames = denied?.requiredRoleNames ?? [];
    const roleList =
      roleNames.length > 0 ? roleNames.join(" o ") : "un rol con permiso";
    return {
      allowed: false,
      message: `Necesitás rol ${roleList} para esta acción.`,
    };
  }

  const roleCheck = hasPermissionForAction(
    context.roles as import("@/lib/auth").RoleId[],
    actionId
  );
  if (!roleCheck.allowed) {
    const roleList =
      (roleCheck.requiredRoles?.length ?? 0) > 0
        ? roleCheck.requiredRoles!.join(" o ")
        : "un rol con permiso";
    return {
      allowed: false,
      message: `Necesitás rol ${roleList}.`,
    };
  }

  if (ACTIONS_REQUIRING_VERIFIED.has(actionId)) {
    const verified = context.user?.verified === true;
    if (!verified) {
      const message =
        actionId === "video:call"
          ? MESSAGE_VERIFICATION_REQUIRED_WHATSAPP
          : "Necesitás tener tu cuenta verificada para esta acción.";
      return { allowed: false, message };
    }
  }

  return { allowed: true, message: "" };
}

function resolveNavigation(
  entity: IntentEntity,
  context: CerebroContext
): ResolveIntentResult {
  const path = entity.path ?? "/home";
  const label = entity.label ?? "Inicio";
  return {
    allowed: true,
    action: {
      type: "navigate",
      target: path,
      params: { label },
    },
    message: `Ir a ${label}.`,
  };
}

function resolveAction(
  entity: IntentEntity,
  context: CerebroContext
): ResolveIntentResult {
  const actionId = entity.actionId;
  const path = entity.path ?? "/home";
  const label = entity.label ?? "Acción";

  if (!actionId) {
    return {
      allowed: true,
      action: { type: "navigate", target: path, params: { label } },
      message: `Ir a ${label}.`,
    };
  }

  const { allowed, message } = checkAllowed(context, actionId);
  if (!allowed) {
    return {
      allowed: false,
      action: {
        type: "execute",
        target: actionId,
        params: { path, label },
      },
      message,
    };
  }

  if (actionId === "video:call") {
    return {
      allowed: true,
      action: {
        type: "navigate",
        target: "/video",
        params: { mode: "new" },
      },
      message: "Iniciando videollamada",
    };
  }

  return {
    allowed: true,
    action: {
      type: "execute",
      target: actionId,
      params: { path, label },
    },
    message: `Podés ${label} en la pantalla indicada.`,
  };
}

function resolveSearch(
  entity: IntentEntity,
  _context: CerebroContext
): ResolveIntentResult {
  const query = entity.query ?? "";
  return {
    allowed: true,
    action: {
      type: "explain",
      target: "search",
      params: { query },
    },
    message: "Buscando opciones relacionadas.",
  };
}

function resolveHelp(
  entity: IntentEntity,
  _context: CerebroContext
): ResolveIntentResult {
  const topic = entity.topic ?? "uso del asistente";
  return {
    allowed: true,
    action: {
      type: "explain",
      target: topic,
      params: {},
    },
    message: `Te explico sobre: ${topic}.`,
  };
}

/**
 * Resuelve la intención (análisis de texto) a una acción concreta.
 * Verifica permisos, rol y estado de verificación.
 */
export function resolveIntentToAction(
  analysis: TextAnalysisResult,
  context: CerebroContext
): ResolveIntentResult {
  const { intentType, entity } = analysis;

  switch (intentType) {
    case "navigation":
      return resolveNavigation(entity, context);
    case "action":
      return resolveAction(entity, context);
    case "search":
      return resolveSearch(entity, context);
    case "help":
      return resolveHelp(entity, context);
    default:
      return resolveSearch(entity, context);
  }
}
