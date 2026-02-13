/**
 * CerebroEngine: orquestador de lógica de negocio.
 * decide(intent, userContext) — switch por intentId, validación rol/permisos/wallet/biometría.
 * Retorna CerebroResult consistente. Sin OpenAI; solo lógica local.
 */

import type { CerebroIntent, CerebroContext, CerebroResult, CerebroRole, CerebroSeverity } from "./types";
import { getIntentDefinition } from "@/lib/ai/intents/catalog";
import type { IntentDefinition } from "@/lib/ai/intents/types";
import type { RoleId } from "@/lib/auth";
import { canWithRoles } from "@/lib/auth/authorization";
import { ACTIONS } from "@/lib/auth/actions";
import { getWallet } from "@/lib/wallet/ledger";
import { releaseTransaction, blockTransaction } from "@/lib/wallet";
import { walletGuard, guardResultToCerebroResult } from "@/lib/wallet/wallet.guard";
import { WALLET_ACTIONS } from "@/lib/wallet/permissions";
import { getRoleBehavior, roleAllowsIntent } from "@/lib/roles/behaviors";

// -----------------------------------------------------------------------------
// Helpers: validación rol, permisos, wallet
// -----------------------------------------------------------------------------

function isRoleAllowedForIntent(role: CerebroRole, definition: IntentDefinition): boolean {
  const roles = definition.allowedRoles as RoleId[];
  if (!roles?.length) return true;
  return roles.includes(role as RoleId);
}

function buildMinimalIdentity(userId: string, role: CerebroRole): { userId: string; roles: RoleId[] } {
  return { userId, roles: [role as RoleId] };
}

/** Construye CerebroResult estándar a partir de definición y estado de autorización. */
function resultFromDefinition(
  intentId: string,
  definition: IntentDefinition,
  allowed: boolean,
  options?: {
    message?: string;
    navigationScreen?: string;
    requiresValidation?: boolean;
    validationType?: "biometric" | "confirmation";
    requiresBiometricLevel?: 0 | 1 | 2 | 3;
    state?: Record<string, unknown>;
  }
): CerebroResult {
  const severity: CerebroSeverity = allowed ? "green" : "red";
  const message = options?.message ?? (allowed ? definition.defaultMessage : definition.deniedMessage) ?? (allowed ? "Listo." : "No tenés permiso para esta acción.");
  const nav = options?.navigationScreen ?? definition.navigationTarget;
  const result: CerebroResult = {
    message,
    allowed,
    severity,
    requiresValidation: options?.requiresValidation ?? definition.requiresValidation ?? false,
    validationType: options?.validationType,
    requiresBiometricLevel: options?.requiresBiometricLevel,
    state: options?.state,
    navigationTarget: nav ? { screen: nav, params: undefined } : undefined,
    navigation: nav ? { screen: nav, params: undefined } : undefined,
  };
  if (nav && allowed) {
    result.actions = [{ type: "NAVIGATE", payload: { screen: nav } }];
  }
  if (!allowed) {
    result.suggestedActions = [
      { intentId: "navigate.home", payload: {}, source: "system" },
      { intentId: "navigate.profile", payload: {}, source: "system" },
    ];
  }
  return result;
}

/** Resultado cuando el intent no está en el catálogo. */
function unknownIntentResult(intentId: string): CerebroResult {
  return {
    message: "No reconozco esa acción. Probá con otra.",
    allowed: false,
    severity: "red",
    suggestedActions: [
      { intentId: "navigate.home", payload: {}, source: "system" },
    ],
  };
}

/** Resultado cuando el rol (RoleBehavior) no permite ese intent. */
function roleDeniedResult(intentId: string, role: CerebroRole): CerebroResult {
  return {
    message: `Tu rol no incluye esta acción. Podés ver otras opciones en Inicio o Perfil.`,
    allowed: false,
    severity: "red",
    suggestedActions: [
      { intentId: "navigate.home", payload: {}, source: "system" },
      { intentId: "navigate.profile", payload: {}, source: "system" },
    ],
  };
}

// -----------------------------------------------------------------------------
// Switch por intentId: wallet, navegación, chat, biometría, subsidio, rol
// -----------------------------------------------------------------------------

function decideWalletView(ctx: CerebroContext, definition: IntentDefinition): CerebroResult {
  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  if (!allowed) {
    return resultFromDefinition("wallet_view", definition, false);
  }
  const wallet = getWallet(ctx.userId);
  if (!wallet && ctx.userId) {
    return resultFromDefinition("wallet_view", definition, true, {
      message: "Podés crear o ver tu billetera en la sección Billetera.",
      navigationScreen: "/wallet",
    });
  }
  return resultFromDefinition("wallet_view", definition, true, {
    navigationScreen: "/wallet",
  });
}

function decideWalletTransfer(intent: CerebroIntent, ctx: CerebroContext): CerebroResult {
  const definition = getIntentDefinition("wallet_transfer");
  if (!definition) return unknownIntentResult("wallet_transfer");

  const allowedByRole = isRoleAllowedForIntent(ctx.role, definition);
  if (!allowedByRole) {
    return resultFromDefinition("wallet_transfer", definition, false);
  }

  const payload = intent.payload ?? {};
  const toUserId = typeof payload.toUserId === "string" ? payload.toUserId.trim() : "";
  const amount = typeof payload.amount === "number" ? payload.amount : Number(payload.amount) || 0;

  const identity = buildMinimalIdentity(ctx.userId, ctx.role);
  const guardResult = walletGuard({
    userId: ctx.userId,
    identity: { ...identity, verified: undefined },
    userIdentity: null,
    action: WALLET_ACTIONS.transfer,
    amount,
    toUserId,
    location: ctx.location,
    biometricValidated: ctx.biometricValidated,
  });

  const cerebroFromGuard = guardResultToCerebroResult(guardResult, "wallet_transfer");
  const severity: CerebroSeverity = guardResult.allowed ? (guardResult.requiresValidation ? "yellow" : "green") : "red";
  const result: CerebroResult = {
    message: cerebroFromGuard.message ?? (guardResult.allowed ? definition.defaultMessage : "No se puede completar la transferencia."),
    allowed: guardResult.allowed,
    severity,
    requiresValidation: guardResult.requiresValidation,
    validationType: guardResult.validationType,
    requiresBiometricLevel: guardResult.requiresBiometricLevel,
    navigationTarget: { screen: "/wallet", params: undefined },
    navigation: { screen: "/wallet", params: undefined },
  };
  if (guardResult.allowed) {
    result.actions = [
      ...(guardResult.requiresValidation
        ? [{ type: "REQUEST_BIOMETRY" as const, payload: { level: guardResult.requiresBiometricLevel } }]
        : []),
      { type: "NAVIGATE" as const, payload: { screen: "/wallet" } },
    ];
  } else {
    result.actions = [{ type: "SHOW_WARNING" as const, payload: { message: guardResult.reason } }];
  }
  return result;
}

function decideWalletSubsidy(ctx: CerebroContext, definition: IntentDefinition): CerebroResult {
  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  return resultFromDefinition("wallet_subsidy", definition, allowed, {
    navigationScreen: "/wallet",
  });
}

const ESCUDO_PAGES: Record<string, string> = {
  insurtech: "/escudos/insurtech",
  fintech: "/escudos/fintech",
  regalos: "/escudos/regalos",
  comunidad: "/escudos/comunidad",
};

function decideEscudoActivate(intent: CerebroIntent, ctx: CerebroContext, definition: IntentDefinition): CerebroResult {
  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  const escudoId = (intent.payload?.escudo as string) || "";
  const escudoPage = ESCUDO_PAGES[escudoId] || "/wallet";
  const result = resultFromDefinition("escudo_activate", definition, allowed, {
    navigationScreen: escudoPage,
  });
  if (allowed) {
    result.navigationTarget = { screen: escudoPage, params: undefined };
    result.navigation = { screen: escudoPage, params: undefined };
    result.actions = [
      { type: "ACTIVATE_ESCUDO", payload: { screen: escudoPage } },
      { type: "NAVIGATE", payload: { screen: escudoPage } },
    ];
  }
  return result;
}

/** Navegación genérica: valida rol y devuelve NAVIGATE. */
function decideNavigate(intentId: string, intent: CerebroIntent, ctx: CerebroContext): CerebroResult {
  const definition = getIntentDefinition(intentId);
  if (!definition) return unknownIntentResult(intentId);

  const behaviorAllows = roleAllowsIntent(ctx.role as RoleId, intentId);
  if (!behaviorAllows) {
    return roleDeniedResult(intentId, ctx.role);
  }

  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  return resultFromDefinition(intentId, definition, allowed, {
    navigationScreen: definition.navigationTarget,
  });
}

/** Chat open: validar rol y devolver navegación a /chat. */
function decideChatOpen(ctx: CerebroContext): CerebroResult {
  return decideNavigate("navigate.chat", { intentId: "navigate.chat", source: "system" }, ctx);
}

/** Biometric required: devolver REQUEST_BIOMETRY y severity yellow. */
function decideBiometricRequired(ctx: CerebroContext): CerebroResult {
  return {
    message: "Se requiere verificación biométrica para continuar.",
    allowed: true,
    severity: "yellow",
    requiresValidation: true,
    validationType: "biometric",
    requiresBiometricLevel: 2,
    actions: [{ type: "REQUEST_BIOMETRY", payload: { level: 2 } }],
  };
}

/** Subsidy check: valé y otros; navegar a wallet o mensaje. */
function decideSubsidyCheck(ctx: CerebroContext): CerebroResult {
  const definition = getIntentDefinition("wallet_subsidy");
  if (!definition) return unknownIntentResult("subsidy_check");
  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  return resultFromDefinition("wallet_subsidy", definition, allowed, {
    navigationScreen: "/wallet",
  });
}

/** Role switch: abrir modal o ir a perfil. */
function decideRoleSwitch(ctx: CerebroContext): CerebroResult {
  return {
    message: "Podés cambiar o ver tu rol en Mi perfil.",
    allowed: true,
    severity: "green",
    actions: [{ type: "OPEN_MODAL", payload: { modalId: "role_switch" }, label: "Cambiar rol" }],
    navigationTarget: { screen: "/profile", params: undefined },
    navigation: { screen: "/profile", params: undefined },
  };
}

/** Video call request: precaución o modal. */
function decideVideoCallRequest(ctx: CerebroContext): CerebroResult {
  return {
    message: "Las videollamadas se gestionan desde Chat.",
    allowed: true,
    severity: "green",
    actions: [{ type: "NAVIGATE", payload: { screen: "/chat" } }],
    navigationTarget: { screen: "/chat", params: undefined },
    navigation: { screen: "/chat", params: undefined },
  };
}

/** UI chip click: delegar al catálogo por intentId (payload puede tener chipId, categoría, etc.). */
function decideUiChipClick(intent: CerebroIntent, ctx: CerebroContext): CerebroResult {
  const resolvedId = (intent.payload?.intentId as string) || intent.intentId;
  const definition = getIntentDefinition(resolvedId);
  if (definition) {
    const behaviorAllows = roleAllowsIntent(ctx.role as RoleId, resolvedId);
    if (!behaviorAllows) return roleDeniedResult(resolvedId, ctx.role);
    const allowed = isRoleAllowedForIntent(ctx.role, definition);
    return resultFromDefinition(resolvedId, definition, allowed, {
      navigationScreen: definition.navigationTarget,
    });
  }
  return unknownIntentResult(resolvedId);
}

// -----------------------------------------------------------------------------
// decide(intent, userContext) — entrada única
// -----------------------------------------------------------------------------

/**
 * Decide el resultado para un intent dado el contexto de usuario.
 * Switch por intentId; valida rol, permisos, estado wallet y biometría.
 * Retorna CerebroResult consistente (message, actions, navigation, severity).
 * Solo lógica local; no usa OpenAI.
 */
export function decide(intent: CerebroIntent, userContext: CerebroContext): CerebroResult {
  const role = (intent.role ?? userContext.role) as CerebroRole;
  const ctx: CerebroContext = { ...userContext, role };

  if (intent.requiresAuth && !ctx.userId?.trim()) {
    return {
      message: "Iniciá sesión para realizar esta acción.",
      allowed: false,
      severity: "red",
      suggestedActions: [
        { intentId: "navigate.profile", payload: {}, source: "system" },
      ],
    };
  }

  const intentId = intent.intentId;

  switch (intentId) {
    case "ui_chip_click":
      return decideUiChipClick(intent, ctx);

    case "wallet_action":
      return decideWalletView(ctx, getIntentDefinition("wallet_view")!);

    case "wallet_view":
      return decideWalletView(ctx, getIntentDefinition("wallet_view")!);

    case "wallet_transfer":
      return decideWalletTransfer(intent, ctx);

    case "wallet_subsidy":
      return decideWalletSubsidy(ctx, getIntentDefinition("wallet_subsidy")!);

    case "escudo_activate":
      return decideEscudoActivate(intent, ctx, getIntentDefinition("escudo_activate")!);

    case "chat_open":
      return decideChatOpen(ctx);

    case "video_call_request":
      return decideVideoCallRequest(ctx);

    case "biometric_required":
      return decideBiometricRequired(ctx);

    case "subsidy_check":
      return decideSubsidyCheck(ctx);

    case "role_switch":
      return decideRoleSwitch(ctx);

    case "wallet_release_transaction": {
      const def = getIntentDefinition("wallet_release_transaction");
      if (!def) return unknownIntentResult("wallet_release_transaction");
      if (!isRoleAllowedForIntent(ctx.role, def)) return resultFromDefinition("wallet_release_transaction", def, false);
      const txId = (intent.payload as { transactionId?: string })?.transactionId;
      if (!txId?.trim()) {
        return { message: "Falta el ID de la transacción.", allowed: false, severity: "red" };
      }
      const releaseResult = releaseTransaction(txId, ctx.userId, [ctx.role as RoleId]);
      return {
        message: releaseResult.success ? "Transacción liberada." : (releaseResult.error ?? "No se pudo liberar."),
        allowed: releaseResult.success,
        severity: releaseResult.success ? "green" : "red",
        state: releaseResult.transaction ? { transactionId: releaseResult.transaction.id, status: releaseResult.transaction.status } : undefined,
        navigationTarget: { screen: "/wallet", params: undefined },
        navigation: { screen: "/wallet", params: undefined },
      };
    }

    case "wallet_block_transaction": {
      const def = getIntentDefinition("wallet_block_transaction");
      if (!def) return unknownIntentResult("wallet_block_transaction");
      if (!isRoleAllowedForIntent(ctx.role, def)) return resultFromDefinition("wallet_block_transaction", def, false);
      const txId = (intent.payload as { transactionId?: string })?.transactionId;
      if (!txId?.trim()) {
        return { message: "Falta el ID de la transacción.", allowed: false, severity: "red" };
      }
      const blockResult = blockTransaction(txId);
      return {
        message: blockResult.success ? "Transacción bloqueada." : (blockResult.error ?? "No se pudo bloquear."),
        allowed: blockResult.success,
        severity: blockResult.success ? "green" : "red",
        state: blockResult.transaction ? { transactionId: blockResult.transaction.id, status: blockResult.transaction.status } : undefined,
        navigationTarget: { screen: "/wallet", params: undefined },
        navigation: { screen: "/wallet", params: undefined },
      };
    }

    default:
      break;
  }

  if (intentId.startsWith("navigate.")) {
    return decideNavigate(intentId, intent, ctx);
  }

  const definition = getIntentDefinition(intentId);
  if (!definition) {
    return unknownIntentResult(intentId);
  }

  const behaviorAllows = roleAllowsIntent(ctx.role as RoleId, intentId);
  if (!behaviorAllows) {
    return roleDeniedResult(intentId, ctx.role);
  }

  const allowed = isRoleAllowedForIntent(ctx.role, definition);
  return resultFromDefinition(intentId, definition, allowed, {
    navigationScreen: definition.navigationTarget,
  });
}
