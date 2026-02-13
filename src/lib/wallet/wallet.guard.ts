/**
 * Guard central de seguridad financiera.
 * Nada se ejecuta sin pasar el guard. Lógica separada de UI.
 * Valida: permisos por rol (AuthorizationService), balance suficiente, escudos requeridos.
 * Devuelve CerebroResult.requiresValidation cuando corresponde (biometría, tiempo, territorio amarillo).
 */

import type { Identity } from "@/lib/auth";
import { canWithRoles } from "@/lib/auth/authorization";
import { ACTIONS } from "@/lib/auth/actions";
import { WALLET_ACTIONS, type WalletActionId } from "./permissions";
import type { UserIdentity } from "@/lib/identity";
import { hasVerifiedLevel } from "@/lib/identity";
import type { Escudo, EscudoBiometrico, EscudoTiempo, EscudoMonto, EscudoTerritorial } from "./types";
import { getWallet, getTransactions } from "./ledger";
import type { Wallet } from "./types";
import type { WalletEstado } from "./wallet.types";
import { isBiometricValidationFresh } from "@/lib/auth/biometric";
import { getTerritorySemaphore } from "@/lib/territory";

export type WalletGuardContext = {
  userId: string;
  identity: Identity | null;
  userIdentity: UserIdentity | null;
  action: WalletActionId;
  amount?: number;
  toUserId?: string;
  location?: { lat: number; lng: number };
  /** Estado de la wallet (active | locked | suspended). Si se pasa, se valida; si no, no se bloquea por estado. */
  walletEstado?: WalletEstado;
  /** Si la UI acaba de validar biométricamente; evita re-pedir en la misma ventana de tiempo. */
  biometricValidated?: { level: number; at: number };
};

/** Nivel biométrico requerido (0–3). Compatible con CerebroResult y flujos de validación. */
export type RequiredBiometricLevel = 0 | 1 | 2 | 3;

/** Tipo de validación requerida: biometric = flujo biométrico; confirmation = solo confirmación UI. */
export type WalletValidationType = "biometric" | "confirmation";

export type WalletGuardResult = {
  allowed: boolean;
  reason?: string;
  /** Si true, el Cerebro debe pedir validación adicional antes de ejecutar. */
  requiresValidation?: boolean;
  /** Tipo: "biometric" cuando se requiere biometría; "confirmation" para confirmación simple. */
  validationType?: WalletValidationType;
  /** Nivel biométrico mínimo requerido (1=low, 2=medium, 3=high). */
  requiresBiometricLevel?: RequiredBiometricLevel;
  /** Si true, la ejecución final (ej. release) debe pasar por CerebroEngine. */
  requiresCerebroDecision?: true;
};

/**
 * Orden de validación:
 * 1. Usuario identificado
 * 2. Wallet existe
 * 3. Estado de wallet (locked/suspended → denegar)
 * 4. Rol del usuario
 * 5. Permiso wallet:transfer (vía canUseWallet para action transfer)
 * 6. Escudos activos (biometría, tiempo, monto, territorial)
 * 7. Nivel biométrico requerido (desde escudos)
 * 8. Fondos suficientes (transfer)
 *
 * Si falla: NO ejecutar nada; devolver info clara para CerebroResult.
 */
export function walletGuard(ctx: WalletGuardContext): WalletGuardResult {
  const { userId, identity, userIdentity, action, amount = 0, location, walletEstado } = ctx;

  // 1. Usuario identificado
  if (!userId?.trim()) {
    return { allowed: false, reason: "Usuario no identificado." };
  }

  const wallet = getWallet(userId);
  if (!wallet) {
    return { allowed: false, reason: "Wallet no encontrada." };
  }

  // 2. Estado de wallet (si se conoce)
  if (walletEstado && walletEstado !== "active") {
    if (walletEstado === "locked") {
      return { allowed: false, reason: "La wallet está bloqueada. No se pueden realizar operaciones." };
    }
    if (walletEstado === "suspended") {
      return { allowed: false, reason: "La wallet está suspendida. Contacte soporte." };
    }
  }

  // 3. Permisos por rol (AuthorizationService central)
  const actionId = action === WALLET_ACTIONS.transfer ? ACTIONS.wallet_transfer : ACTIONS.wallet_view;
  if (identity) {
    const authCheck = canWithRoles(identity.roles, actionId);
    if (!authCheck.allowed) {
      return {
        allowed: false,
        reason: authCheck.reason ?? "Tu rol no permite esta acción.",
      };
    }
  } else if (action !== WALLET_ACTIONS.view) {
    return { allowed: false, reason: "Se requiere autenticación para esta acción." };
  }

  if (action === WALLET_ACTIONS.transfer && !identity) {
    return { allowed: false, reason: "Se requiere autenticación para transferir." };
  }

  // 4. Escudos activos y nivel biométrico requerido
  const escudos = wallet.escudosActivos ?? [];
  for (const escudo of escudos) {
    if (!escudo.enabled) continue;
    const r = checkEscudo(escudo, {
      wallet,
      userIdentity: userIdentity ?? null,
      amount,
      location: location ?? null,
      biometricValidated: ctx.biometricValidated,
    });
    if (!r.allowed) {
      return {
        allowed: false,
        reason: r.reason,
        requiresValidation: r.requiresValidation,
        validationType: r.requiresBiometricLevel != null ? "biometric" : undefined,
        requiresBiometricLevel: r.requiresBiometricLevel,
      };
    }
    if (r.requiresValidation || r.requiresBiometricLevel != null) {
      return {
        allowed: true,
        requiresValidation: r.requiresValidation ?? true,
        validationType: "biometric",
        reason: r.reason,
        requiresBiometricLevel: r.requiresBiometricLevel,
      };
    }
  }

  // 5. Balance suficiente (transfer)
  if (action === WALLET_ACTIONS.transfer && amount > 0) {
    const disponible = wallet.balance - (wallet.balanceProtegido ?? 0);
    if (disponible < amount) {
      return {
        allowed: false,
        reason: `Fondos insuficientes. Disponible: ${disponible}, solicitado: ${amount}.`,
      };
    }
  }

  // Éxito: para transfer, indicar que el release debe pasar por Cerebro
  const result: WalletGuardResult = { allowed: true };
  if (action === WALLET_ACTIONS.transfer) {
    result.requiresCerebroDecision = true;
  }
  return result;
}

/**
 * Convierte WalletGuardResult en un objeto compatible con CerebroResult.
 * Usado por el Cerebro (decide) cuando el guard deniega o requiere validación.
 * Lógica separada de UI; solo datos.
 */
export function guardResultToCerebroResult(
  guardResult: WalletGuardResult,
  intentId: string
): {
  intentId: string;
  message?: string;
  allowed: boolean;
  reason?: string;
  requiresValidation?: boolean;
  validationType?: WalletValidationType;
  requiresBiometricLevel?: RequiredBiometricLevel;
} {
  const validationType =
    guardResult.requiresBiometricLevel != null ? "biometric" : guardResult.validationType;
  return {
    intentId,
    message: guardResult.reason,
    allowed: guardResult.allowed,
    reason: guardResult.reason,
    requiresValidation: guardResult.requiresValidation,
    validationType,
    requiresBiometricLevel: guardResult.requiresBiometricLevel,
  };
}

type EscudoCheckContext = {
  wallet: Wallet;
  userIdentity: UserIdentity | null;
  amount: number;
  location: { lat: number; lng: number } | null;
  biometricValidated?: { level: number; at: number };
};

function checkEscudo(escudo: Escudo, ctx: EscudoCheckContext): EscudoCheckResult {
  switch (escudo.kind) {
    case "biometrico":
      return checkEscudoBiometrico(escudo, ctx);
    case "tiempo":
      return checkEscudoTiempo(escudo, ctx);
    case "monto":
      return checkEscudoMonto(escudo, ctx);
    case "territorial":
      return checkEscudoTerritorial(escudo, ctx);
    default:
      return { allowed: true };
  }
}

function checkEscudoBiometrico(
  escudo: EscudoBiometrico,
  ctx: EscudoCheckContext
): EscudoCheckResult {
  const { userIdentity, biometricValidated } = ctx;
  if (biometricValidated && isBiometricValidationFresh(biometricValidated, escudo.minLevel)) {
    return { allowed: true };
  }
  if (!userIdentity) {
    return {
      allowed: false,
      reason: "Escudo biométrico: se requiere verificación de identidad.",
      requiresValidation: true,
      requiresBiometricLevel: escudo.minLevel as RequiredBiometricLevel,
    };
  }
  const ok = hasVerifiedLevel(userIdentity, escudo.minLevel);
  if (!ok) {
    return {
      allowed: false,
      reason: `Escudo biométrico: se requiere nivel de verificación ${escudo.minLevel} o superior.`,
      requiresValidation: true,
      requiresBiometricLevel: escudo.minLevel as RequiredBiometricLevel,
    };
  }
  return { allowed: true };
}

function checkEscudoTiempo(
  escudo: EscudoTiempo,
  _ctx: EscudoCheckContext
): EscudoCheckResult {
  if (escudo.delayMs <= 0) return { allowed: true };
  return {
    allowed: true,
    requiresValidation: true,
    reason: `Escudo tiempo: la transferencia requiere esperar ${escudo.delayMs} ms antes de ejecutarse.`,
  };
}

function checkEscudoMonto(escudo: EscudoMonto, ctx: EscudoCheckContext): EscudoCheckResult {
  const { wallet, amount } = ctx;
  const dayStart = escudo.dayStartAt ?? getStartOfDayUtc();
  const txs = getTransactions();
  const fromId = wallet.userId;
  const releasedToday = txs.filter(
    (tx) =>
      tx.from === fromId &&
      tx.status === "released" &&
      tx.createdAt >= dayStart
  );
  const spentToday = releasedToday.reduce((s, tx) => s + tx.amount, 0);
  const remaining = Math.max(0, escudo.limitDaily - spentToday);
  if (amount > remaining) {
    return {
      allowed: false,
      reason: `Escudo monto: límite diario ${escudo.limitDaily}. Ya gastado hoy: ${spentToday}. Máximo permitido: ${remaining}.`,
    };
  }
  if (amount > 0 && amount < escudo.limitDaily) {
    return { allowed: true, requiresValidation: true };
  }
  return { allowed: true };
}

/**
 * Escudo Territorial: consulta semáforo por ubicación.
 * Rojo → bloqueo (allowed: false).
 * Amarillo → biometría (requiresValidation + requiresBiometricLevel: 2).
 * Verde → permitido; además se comprueban redZones del escudo.
 */
function checkEscudoTerritorial(
  escudo: EscudoTerritorial,
  ctx: EscudoCheckContext
): EscudoCheckResult {
  const { location } = ctx;
  if (!location) return { allowed: true };
  const semaphore = getTerritorySemaphore(location);
  if (semaphore.state === "red") {
    return {
      allowed: false,
      reason:
        semaphore.reason ??
        "Escudo territorial: operaciones bloqueadas en esta zona (semáforo rojo).",
    };
  }
  if (semaphore.state === "yellow") {
    return {
      allowed: true,
      requiresValidation: true,
      reason:
        semaphore.reason ??
        "Zona en validación: se requiere confirmación biométrica para operar.",
      requiresBiometricLevel: 2,
    };
  }
  const inRedZone = escudo.redZones?.some((z) => inRadius(location, z, z.radiusMeters));
  if (inRedZone) {
    return {
      allowed: false,
      reason: "Escudo territorial: las transferencias están bloqueadas en esta zona.",
    };
  }
  return { allowed: true };
}

function getStartOfDayUtc(): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function inRadius(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const R = 6371e3;
  const φ1 = (point.lat * Math.PI) / 180;
  const φ2 = (center.lat * Math.PI) / 180;
  const Δφ = ((center.lat - point.lat) * Math.PI) / 180;
  const Δλ = ((center.lng - point.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radiusMeters;
}
