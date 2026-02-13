/**
 * Resolución de contexto: intent + pantalla + rol → contexto enriquecido.
 * CEREBRO CENTRAL: nunca bloquear en SAFE_MODE; si no permitido, incluir paso sugerido.
 */

import { canUseWallet, WALLET_ACTIONS, getBalance } from "@/lib/wallet";
import type { WalletActionId } from "@/lib/wallet";
import { getRoleName, shouldNeverBlock, getSuggestedStep } from "@/lib/auth";

/** Contexto del usuario al resolver (pantalla, rol, sesión). */
export interface UserContext {
  /** Pantalla actual / ruta (ej. /wallet, /cerebro). */
  screen: string;
  /** Roles del usuario (ids: vale, capeto, kavaju, mbarete, cliente, pyme, enterprise). */
  roles: string[];
  /** userId si hay sesión. */
  userId?: string;
  /** Usuario verificado. */
  verified?: boolean;
}

/** Estado de la sesión. */
export type SessionState = "authenticated" | "anonymous";

/** Contexto resuelto: acción permitida, balance, permisos, estado sesión. */
export interface ResolvedContext {
  /** Si la acción asociada al intent está permitida para el usuario. */
  actionAllowed: boolean;
  /** Motivo cuando actionAllowed es false (ej. rol insuficiente). */
  reason?: string;
  /** Balance de la wallet del usuario (si userId y acción wallet). */
  balance?: number;
  /** IDs de acciones permitidas (ej. wallet:view, wallet:transfer). */
  permissions: string[];
  /** Estado de sesión. */
  sessionState: SessionState;
  /** Pantalla actual. */
  screen: string;
  /** Roles del usuario. */
  roles: string[];
  /** Intent original. */
  intent: string;
  /** Acción canónica asociada (ej. wallet:view) si aplica. */
  action?: string;
}

const INTENT_TO_ACTION: Record<string, string> = {
  wallet_balance: WALLET_ACTIONS.view,
  wallet_transfer: WALLET_ACTIONS.transfer,
  [WALLET_ACTIONS.view]: WALLET_ACTIONS.view,
  [WALLET_ACTIONS.transfer]: WALLET_ACTIONS.transfer,
  [WALLET_ACTIONS.admin]: WALLET_ACTIONS.admin,
};

const WALLET_ACTION_IDS: WalletActionId[] = [
  WALLET_ACTIONS.view,
  WALLET_ACTIONS.transfer,
  WALLET_ACTIONS.admin,
];

function resolveAction(intent: string): string | undefined {
  return INTENT_TO_ACTION[intent] ?? (intent.startsWith("wallet:") ? intent : undefined);
}

/**
 * Resuelve el contexto a partir del intent y el contexto del usuario.
 * Valida si la acción está permitida y enriquece con balance, permisos y estado de sesión.
 */
export function resolveContext(
  intent: string,
  userContext: UserContext
): ResolvedContext {
  const { screen, roles, userId, verified = false } = userContext;
  const sessionState: SessionState = userId ? "authenticated" : "anonymous";

  const identity = userId
    ? { userId, roles: roles as import("@/lib/auth").RoleId[], verified }
    : null;

  const permissions: string[] = [];
  if (identity) {
    for (const actionId of WALLET_ACTION_IDS) {
      const check = canUseWallet(identity, actionId);
      if (check.allowed) permissions.push(actionId);
    }
  }

  const action = resolveAction(intent);
  const cerebroContext = {
    userId,
    roles,
    simulated: userId === "safe-user",
  };
  const neverBlock = shouldNeverBlock(cerebroContext);

  let actionAllowed = true;
  let reason: string | undefined;
  let suggestedStep: ResolvedContext["suggestedStep"];

  if (action && (WALLET_ACTION_IDS as string[]).includes(action)) {
    if (neverBlock) {
      actionAllowed = true;
    } else if (!identity) {
      actionAllowed = false;
      reason = "Iniciá sesión para usar esta acción.";
      suggestedStep = getSuggestedStep("login", reason);
    } else {
      const check = canUseWallet(identity, action as WalletActionId);
      actionAllowed = check.allowed;
      if (!check.allowed) {
        if (check.requiredRoles?.length) {
          const names = check.requiredRoles.map((r) => getRoleName(r));
          reason = `Necesitás rol ${names.join(" o ")} para esta acción.`;
        } else {
          reason = check.reason;
        }
        suggestedStep = getSuggestedStep(action ?? "wallet", reason);
      }
    }
  }

  let balance: number | undefined;
  if (userId && (action === WALLET_ACTIONS.view || action === WALLET_ACTIONS.transfer || intent === "wallet_balance" || intent === "wallet_transfer")) {
    balance = getBalance(userId);
  }

  return {
    actionAllowed,
    reason,
    suggestedStep,
    balance,
    permissions,
    sessionState,
    screen,
    roles,
    intent,
    action,
  };
}
