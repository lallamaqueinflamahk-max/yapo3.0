/**
 * CEREBRO CENTRAL de YAPÓ.
 * Decide, valida y autoriza acciones del sistema.
 *
 * Reglas:
 * - Nunca bloquear el flujo en modo SAFE_MODE.
 * - Si falta autenticación real, usar IDs simulados.
 * - Priorizar continuidad operativa sobre seguridad dura.
 * - Decisiones basadas en: rol_usuario, nivel_escudo, reputación, permisos, estado_wallet.
 * - Si una acción no está permitida: sugerir el paso previo; no romper el flujo.
 */

import { isSafeMode } from "./dev/safeMode";
import { canAccessFeature, FEATURE_IDS } from "./featureGates";
import type { FeatureId } from "./featureGates";
import type { IdentityProfile, VerificationLevel } from "./types";

export interface CerebroCentralContext {
  /** userId (puede ser simulado, ej. safe-user). */
  userId?: string;
  /** Perfil extendido (verificación, trust, badges). */
  profile?: IdentityProfile | null;
  /** Roles del usuario. */
  roles?: string[];
  /** Si la sesión es real o simulada. */
  simulated?: boolean;
}

/** Entrada de autorización: user_id, rol, accion, contexto, estado_wallet, reputacion, escudos, safe_mode. */
export interface AutorizacionRequest {
  user_id: string;
  rol: string;
  accion: string;
  contexto: string;
  estado_wallet: { balance: number } | number;
  reputacion: number;
  escudos: VerificationLevel | string;
  safe_mode: boolean;
}

/** Salida de autorización: autorizado, motivo, accion_sugerida, evento_emitido. */
export interface AutorizacionResponse {
  autorizado: boolean;
  motivo?: string;
  accion_sugerida?: { label: string; href?: string };
  evento_emitido: string;
}

export interface CerebroCentralDecision {
  allowed: boolean;
  reason?: string;
  /** Paso previo sugerido (no romper flujo). */
  suggestedStep?: { label: string; href?: string };
}

/** IDs simulados cuando no hay autenticación real. */
export const SIMULATED_USER_ID = "safe-user";

/**
 * Indica si el flujo nunca debe bloquearse (SAFE_MODE o sesión simulada).
 */
export function shouldNeverBlock(context: CerebroCentralContext): boolean {
  if (isSafeMode()) return true;
  if (context.userId === SIMULATED_USER_ID || context.simulated) return true;
  return false;
}

/** Sugerencias de paso previo por feature/acción (texto humano, no técnico). */
const SUGGESTED_STEPS: Record<
  string,
  { label: string; href: string }
> = {
  wallet_transfer: {
    label: "Verificate para desbloquear transferencias",
    href: "/profile",
  },
  wallet: {
    label: "Ir a mi perfil para verificar",
    href: "/profile",
  },
  video_call: {
    label: "Verificate por documento para videollamadas",
    href: "/profile",
  },
  whatsapp: {
    label: "Completá la verificación para habilitar WhatsApp",
    href: "/profile",
  },
  territory_control: {
    label: "Verificación y rol Mbareté requeridos para control de territorio",
    href: "/profile",
  },
  login: {
    label: "Iniciá sesión para continuar",
    href: "/login",
  },
};

/**
 * Devuelve el paso previo sugerido cuando una acción no está permitida.
 * No rompe el flujo: la UI puede mostrar esto en lugar de bloquear.
 */
export function getSuggestedStep(
  featureOrAction: string,
  _reason?: string
): { label: string; href: string } | undefined {
  return (
    SUGGESTED_STEPS[featureOrAction] ??
    SUGGESTED_STEPS.wallet ?? { label: "Ir a mi perfil", href: "/profile" }
  );
}

/**
 * Decisión central: autoriza según reglas del CEREBRO.
 * En SAFE_MODE o con ID simulado: allowed = true (nunca bloquear).
 * Si no permitido: devuelve reason + suggestedStep (no romper flujo).
 */
export function authorizeWithCerebro(
  context: CerebroCentralContext,
  featureOrActionId: string,
  check: () => CerebroCentralDecision
): CerebroCentralDecision {
  if (shouldNeverBlock(context)) {
    return { allowed: true };
  }
  const result = check();
  if (result.allowed) return result;
  const step = getSuggestedStep(featureOrActionId, result.reason);
  return {
    allowed: false,
    reason: result.reason,
    suggestedStep: step,
  };
}

const EVENT_AUTORIZADO = "cerebro:autorizado";
const EVENT_RECHAZADO = "cerebro:rechazado";
const EVENT_AUTORIZADO_SAFE = "cerebro:autorizado_safe";

const ESCUDOS_LEVELS: VerificationLevel[] = [
  "unverified",
  "basic",
  "verified",
  "trusted",
];

function toVerificationLevel(escudos: VerificationLevel | string): VerificationLevel {
  if (ESCUDOS_LEVELS.includes(escudos as VerificationLevel)) {
    return escudos as VerificationLevel;
  }
  const n = typeof escudos === "string" ? parseInt(escudos, 10) : escudos;
  if (!Number.isNaN(n) && n >= 0 && n < ESCUDOS_LEVELS.length) {
    return ESCUDOS_LEVELS[n];
  }
  return "unverified";
}

function buildProfileFromRequest(req: AutorizacionRequest): IdentityProfile {
  return {
    userId: req.user_id,
    role: req.rol as IdentityProfile["role"],
    verificationLevel: toVerificationLevel(req.escudos),
    trustScore: Math.max(0, Math.min(100, req.reputacion)),
    badges: [],
    biometricEnabled: false,
    whatsappUnlocked: req.escudos === "trusted" || req.escudos === "verified",
  };
}

/**
 * Autoriza una acción a partir del request (user_id, rol, accion, contexto, estado_wallet, reputacion, escudos, safe_mode).
 * Devuelve autorizado, motivo, accion_sugerida y evento_emitido.
 */
export function autorizar(request: AutorizacionRequest): AutorizacionResponse {
  if (request.safe_mode) {
    return {
      autorizado: true,
      evento_emitido: EVENT_AUTORIZADO_SAFE,
    };
  }

  const profile = buildProfileFromRequest(request);
  const accion = request.accion.trim();

  const isFeature = (FEATURE_IDS as string[]).includes(accion);
  if (isFeature) {
    const result = canAccessFeature(profile, accion as FeatureId);
    if (result.allowed) {
      return {
        autorizado: true,
        motivo: result.reason,
        evento_emitido: EVENT_AUTORIZADO,
      };
    }
    return {
      autorizado: false,
      motivo: result.reason,
      accion_sugerida: result.suggestedStep,
      evento_emitido: EVENT_RECHAZADO,
    };
  }

  const step = getSuggestedStep(accion);
  return {
    autorizado: false,
    motivo: "Acción no reconocida o no permitida.",
    accion_sugerida: step,
    evento_emitido: EVENT_RECHAZADO,
  };
}
