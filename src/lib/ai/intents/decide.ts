/**
 * Motor de decisión del Cerebro: decide(context, intent).
 * Valida primero RoleBehavior (intents permitidos por rol), luego catálogo y permisos.
 * Para wallet_transfer: orquesta wallet.guard y wallet.service.applyTransaction (Wallet controlada por Cerebro).
 * Sin UI; deterministico; extensible. Preparado para NLP (intentId ya resuelto).
 */

import { getIntentDefinition, INTENT_CATALOG } from "./catalog";
import type {
  CerebroIntent,
  CerebroResult,
  DecideContext,
  IntentDefinition,
  SuggestedAction,
} from "./types";
import type { RoleId } from "@/lib/auth";
import { roleAllowsIntent, getRoleBehavior } from "@/lib/roles/behaviors";
import { getRoleName } from "@/lib/auth";
import { walletGuard, guardResultToCerebroResult } from "@/lib/wallet/wallet.guard";
import {
  getWalletByUser,
  createTransaction,
  applyTransaction,
} from "@/lib/wallet/wallet.service";
import { releaseTransaction, blockTransaction } from "@/lib/wallet";
import { WALLET_ACTIONS } from "@/lib/wallet/permissions";

/** Construye el resultado estándar cuando el intent no existe. */
function unknownIntentResult(intentId: string): CerebroResult {
  return {
    intentId,
    message: "No reconozco esa acción. Probá con otra.",
    suggestedActions: [],
    requiresValidation: false,
    allowed: false,
    reason: "Intent no encontrado en el catálogo.",
  };
}

/** Construye el resultado cuando el rol no permite ese intent (RoleBehavior). */
function roleBehaviorDeniedResult(
  intentId: string,
  userRoles: RoleId[]
): CerebroResult {
  const primaryRole = userRoles[0];
  const roleName = primaryRole ? getRoleName(primaryRole) : "tu rol";
  return {
    intentId,
    message: `Tu rol (${roleName}) no incluye esta acción. Podés ver otras opciones en Inicio o Perfil.`,
    suggestedActions: [
      { id: "go-home", label: "Ir a Inicio", target: "/home", type: "navigate" },
      { id: "go-profile", label: "Ir a Mi perfil", target: "/profile", type: "navigate" },
    ],
    requiresValidation: false,
    allowed: false,
    reason: "Intent no permitido por RoleBehavior para este rol.",
  };
}

/** Verifica si el rol del usuario está en allowedRoles (vacío = todos). */
function isRoleAllowed(userRoles: RoleId[], definition: IntentDefinition): boolean {
  if (definition.allowedRoles.length === 0) return true;
  return userRoles.some((r) => definition.allowedRoles.includes(r));
}

/** Sugerencias por defecto según categoría (navegación alternativa, etc.). */
function defaultSuggestedActions(
  definition: IntentDefinition,
  allowed: boolean
): SuggestedAction[] {
  if (allowed && definition.navigationTarget) {
    return [
      {
        id: `go-${definition.id}`,
        label: definition.category === "navigate" ? "Ir" : "Abrir",
        target: definition.navigationTarget,
        type: "navigate",
      },
    ];
  }
  if (!allowed) {
    return [
      { id: "go-profile", label: "Ir a Mi perfil", target: "/profile", type: "navigate" },
      { id: "go-home", label: "Ir a Inicio", target: "/home", type: "navigate" },
    ];
  }
  return [];
}

/** Acciones sugeridas cuando se bloquea o requiere biometría (wallet_transfer). */
function walletTransferSuggestedActions(blocked: boolean): SuggestedAction[] {
  return [
    { id: "go-wallet", label: "Ir a Billetera", target: "/wallet", type: "navigate" },
    { id: "go-profile", label: "Verificar identidad", target: "/profile", type: "navigate" },
    ...(blocked ? [] : [{ id: "go-home", label: "Ir a Inicio", target: "/home", type: "navigate" as const }]),
  ];
}

/**
 * Orquesta wallet_transfer: guard → applyTransaction.
 * Cerebro controla Wallet; no ejecuta nada si el guard no permite.
 */
function decideWalletTransfer(context: DecideContext, intent: CerebroIntent): CerebroResult {
  const userId = context.user?.userId;
  if (!userId) {
    return {
      intentId: "wallet_transfer",
      message: "Iniciá sesión para transferir.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: "Usuario no autenticado.",
    };
  }

  const payload = intent.payload ?? {};
  const toUserId = typeof payload.toUserId === "string" ? payload.toUserId.trim() : "";
  const amount = typeof payload.amount === "number" ? payload.amount : Number(payload.amount);

  if (!toUserId) {
    return {
      intentId: "wallet_transfer",
      message: "Indicá a quién querés transferir (toUserId).",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: "Falta toUserId en el payload.",
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      intentId: "wallet_transfer",
      message: "El monto debe ser un número positivo.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: "Monto inválido en el payload.",
    };
  }

  const identity = context.user
    ? {
        userId: context.user.userId,
        roles: context.user.roles,
        verified: context.user.verified ?? false,
      }
    : null;
  const wallet = getWalletByUser(userId);
  const guardCtx = {
    userId,
    identity,
    userIdentity: null,
    action: WALLET_ACTIONS.transfer,
    amount,
    toUserId,
    location: undefined,
    walletEstado: wallet?.estado,
    biometricValidated: context.biometricValidated,
  };

  const guardResult = walletGuard(guardCtx);

  if (!guardResult.allowed) {
    return {
      ...guardResultToCerebroResult(guardResult, "wallet_transfer"),
      message: guardResult.reason ?? "La transferencia no está permitida.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: guardResult.requiresValidation ?? false,
    };
  }

  if (guardResult.requiresBiometricLevel != null || guardResult.requiresValidation) {
    const base = guardResultToCerebroResult(guardResult, "wallet_transfer");
    return {
      ...base,
      message:
        guardResult.reason ??
        `Se requiere validación biométrica (nivel ${guardResult.requiresBiometricLevel ?? "mínimo"}) para completar la transferencia.`,
      suggestedActions: walletTransferSuggestedActions(false),
      requiresValidation: true,
      allowed: false,
      reason: "Requiere validación biométrica antes de ejecutar.",
      requiresBiometricLevel: guardResult.requiresBiometricLevel ?? 2,
    };
  }

  const create = createTransaction({
    fromWalletId: userId,
    toWalletId,
    amount,
    type: "transfer",
  });
  if (!create.success || !create.transaction) {
    return {
      intentId: "wallet_transfer",
      message: create.error ?? "No se pudo crear la transacción.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: create.error,
    };
  }

  let tx = create.transaction;
  const applyHold = applyTransaction(tx, guardCtx);
  if (!applyHold.success) {
    return {
      intentId: "wallet_transfer",
      message: applyHold.error ?? "No se pudo reservar el monto.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: applyHold.error,
    };
  }
  if (applyHold.transaction) tx = applyHold.transaction;

  const applyRelease = applyTransaction(tx, guardCtx);
  if (!applyRelease.success) {
    return {
      intentId: "wallet_transfer",
      message: applyRelease.error ?? "No se pudo completar la transferencia.",
      suggestedActions: walletTransferSuggestedActions(true),
      requiresValidation: false,
      allowed: false,
      reason: applyRelease.error,
    };
  }

  const finalTx = applyRelease.transaction ?? tx;
  return {
    intentId: "wallet_transfer",
    message: "Transferencia realizada.",
    suggestedActions: [
      { id: "go-wallet", label: "Ver Billetera", target: "/wallet", type: "navigate" },
      { id: "go-home", label: "Ir a Inicio", target: "/home", type: "navigate" },
    ],
    requiresValidation: false,
    allowed: true,
    navigationTarget: "/wallet",
    state: {
      transactionId: finalTx.id,
      status: finalTx.status,
    },
  };
}

/**
 * Decide el resultado para un intent en un contexto dado.
 * 1) Valida RoleBehavior: si ningún rol del usuario permite ese intent, devuelve CerebroResult con explicación.
 * 2) Valida catálogo y allowedRoles (permisos); evalúa pantalla e historial; devuelve CerebroResult.
 */
export function decide(context: DecideContext, intent: CerebroIntent): CerebroResult {
  const userRoles: RoleId[] = context.user?.roles ?? [];

  const definition = getIntentDefinition(intent.intentId);
  if (!definition) {
    return unknownIntentResult(intent.intentId);
  }

  const behaviorAllows = userRoles.some((r) => roleAllowsIntent(r, intent.intentId));
  if (!behaviorAllows) {
    return roleBehaviorDeniedResult(intent.intentId, userRoles);
  }

  const allowed = isRoleAllowed(userRoles, definition);

  // Cerebro orquesta Wallet: wallet_transfer → guard → applyTransaction
  if (intent.intentId === "wallet_transfer" && allowed && context.user) {
    return decideWalletTransfer(context, intent);
  }

  // Liberar transacción retenida: solo vía CerebroIntent
  if (intent.intentId === "wallet_release_transaction" && allowed && context.user) {
    const txId = (intent.payload as { transactionId?: string })?.transactionId;
    if (!txId?.trim()) {
      return {
        intentId: "wallet_release_transaction",
        message: "Falta el ID de la transacción.",
        suggestedActions: [],
        requiresValidation: false,
        allowed: false,
        reason: "transactionId requerido.",
      };
    }
    const result = releaseTransaction(txId, context.user.userId, context.user.roles);
    return {
      intentId: "wallet_release_transaction",
      message: result.success ? "Transacción liberada." : (result.error ?? "No se pudo liberar."),
      suggestedActions: [],
      requiresValidation: false,
      allowed: result.success,
      reason: result.error,
      state: result.transaction ? { transactionId: result.transaction.id, status: result.transaction.status } : undefined,
    };
  }

  // Bloquear transacción: solo vía CerebroIntent
  if (intent.intentId === "wallet_block_transaction" && allowed) {
    const txId = (intent.payload as { transactionId?: string })?.transactionId;
    if (!txId?.trim()) {
      return {
        intentId: "wallet_block_transaction",
        message: "Falta el ID de la transacción.",
        suggestedActions: [],
        requiresValidation: false,
        allowed: false,
        reason: "transactionId requerido.",
      };
    }
    const result = blockTransaction(txId);
    return {
      intentId: "wallet_block_transaction",
      message: result.success ? "Transacción bloqueada." : (result.error ?? "No se pudo bloquear."),
      suggestedActions: [],
      requiresValidation: false,
      allowed: result.success,
      reason: result.error,
      state: result.transaction ? { transactionId: result.transaction.id, status: result.transaction.status } : undefined,
    };
  }

  const message = allowed
    ? (definition.defaultMessage ?? "Listo.")
    : (definition.deniedMessage ?? "No tenés permiso para esta acción.");

  const suggestedActions = defaultSuggestedActions(definition, allowed);

  const result: CerebroResult = {
    intentId: intent.intentId,
    message,
    suggestedActions,
    requiresValidation: definition.requiresValidation ?? false,
    allowed,
    reason: allowed ? undefined : "Rol no permitido para este intent.",
  };

  if (allowed && definition.navigationTarget) {
    result.navigationTarget = definition.navigationTarget;
  }

  // Búsquedas: llevar a mapa con query (no solo a cerebro)
  if (allowed && intent.intentId.startsWith("search.")) {
    const query =
      typeof intent.payload?.query === "string"
        ? intent.payload.query
        : intent.label ?? intent.intentId;
    result.navigationTarget = `/mapa?q=${encodeURIComponent(String(query))}`;
  }

  return result;
}

/** Devuelve todos los intents permitidos para los roles (catálogo + RoleBehavior). Para chips/sugerencias. */
export function getIntentsForRoles(roles: RoleId[]): IntentDefinition[] {
  return Object.values(INTENT_CATALOG).filter(
    (def) =>
      isRoleAllowed(roles, def) && roles.some((r) => roleAllowsIntent(r, def.id))
  );
}
