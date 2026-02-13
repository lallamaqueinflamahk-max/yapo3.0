/**
 * Gates de seguridad por feature: allowed + reason (texto humano).
 * CEREBRO CENTRAL: nunca bloquear en SAFE_MODE; si no permitido, devolver paso sugerido.
 */

import { isSafeMode } from "./dev/safeMode";
import { getSuggestedStep } from "./cerebroCentral";
import type { IdentityProfile, VerificationLevel } from "./types";

export type FeatureId =
  | "wallet_transfer"
  | "video_call"
  | "whatsapp"
  | "territory_control";

export interface FeatureAccessResult {
  allowed: boolean;
  reason: string;
  /** Paso previo sugerido (no romper flujo). */
  suggestedStep?: { label: string; href: string };
}

const LEVEL_ORDER: VerificationLevel[] = [
  "unverified",
  "basic",
  "verified",
  "trusted",
];

function levelAtLeast(level: VerificationLevel): (v: VerificationLevel) => boolean {
  const idx = LEVEL_ORDER.indexOf(level);
  return (v) => LEVEL_ORDER.indexOf(v) >= idx;
}

type GateCheck = (profile: IdentityProfile) => FeatureAccessResult;

const GATES: Record<FeatureId, GateCheck> = {
  wallet_transfer(profile) {
    if (!levelAtLeast("basic")(profile.verificationLevel)) {
      return {
        allowed: false,
        reason: "Para transferir necesitás verificación básica (email o teléfono).",
      };
    }
    if (profile.trustScore < 25) {
      return {
        allowed: false,
        reason: "Tu nivel de confianza es bajo. Completá más pasos de verificación para habilitar transferencias.",
      };
    }
    return { allowed: true, reason: "Transferencias habilitadas." };
  },

  video_call(profile) {
    if (!levelAtLeast("verified")(profile.verificationLevel)) {
      return {
        allowed: false,
        reason: "Para videollamadas necesitás verificación por documento.",
      };
    }
    return { allowed: true, reason: "Videollamadas habilitadas." };
  },

  whatsapp(profile) {
    if (!profile.whatsappUnlocked) {
      return {
        allowed: false,
        reason: "El contacto por WhatsApp se habilita al completar los pasos de verificación requeridos.",
      };
    }
    return { allowed: true, reason: "WhatsApp habilitado." };
  },

  territory_control(profile) {
    if (profile.role !== "mbarete") {
      return {
        allowed: false,
        reason: "Solo el rol Mbareté puede acceder al control de territorio.",
      };
    }
    if (!levelAtLeast("verified")(profile.verificationLevel)) {
      return {
        allowed: false,
        reason: "Para control de territorio necesitás verificación por documento.",
      };
    }
    return { allowed: true, reason: "Control de territorio habilitado." };
  },
};

/**
 * Evalúa si la identidad puede acceder al feature.
 * CEREBRO CENTRAL: en SAFE_MODE o userId safe-user nunca bloquea; si no permitido, incluye suggestedStep.
 */
export function canAccessFeature(
  identity: IdentityProfile,
  featureId: FeatureId
): FeatureAccessResult {
  if (isSafeMode() || identity.userId === "safe-user") {
    return { allowed: true, reason: "Acceso permitido." };
  }
  const check = GATES[featureId];
  if (!check) {
    return {
      allowed: false,
      reason: "Feature desconocido.",
      suggestedStep: getSuggestedStep("wallet"),
    };
  }
  const result = check(identity);
  if (result.allowed) return result;
  return {
    ...result,
    suggestedStep: getSuggestedStep(featureId, result.reason),
  };
}

/** Lista de feature ids conocidos. */
export const FEATURE_IDS: FeatureId[] = [
  "wallet_transfer",
  "video_call",
  "whatsapp",
  "territory_control",
];
