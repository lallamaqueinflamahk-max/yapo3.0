/**
 * Badges: asignar según reglas; se quitan si baja confianza (trustScore / nivel).
 * evaluateBadges(identityProfile) devuelve la lista actual de badges que aplican.
 */

import type { IdentityProfile, VerificationLevel } from "./types";

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

/** Regla: badge id + condición sobre el perfil. Si la condición no se cumple, el badge no se asigna (o se quita). */
const BADGE_RULES: Array<{
  id: string;
  condition: (p: IdentityProfile) => boolean;
}> = [
  { id: "kyc_basic", condition: (p) => levelAtLeast("basic")(p.verificationLevel) },
  { id: "kyc_verified", condition: (p) => levelAtLeast("verified")(p.verificationLevel) },
  { id: "kyc_trusted", condition: (p) => p.verificationLevel === "trusted" },
  { id: "biometric", condition: (p) => p.biometricEnabled },
  { id: "whatsapp", condition: (p) => p.whatsappUnlocked },
  { id: "trust_25", condition: (p) => p.trustScore >= 25 },
  { id: "trust_50", condition: (p) => p.trustScore >= 50 },
  { id: "trust_75", condition: (p) => p.trustScore >= 75 },
  { id: "trust_100", condition: (p) => p.trustScore >= 100 },
];

/**
 * Evalúa qué badges corresponden al perfil según las reglas.
 * Si baja la confianza (trustScore) o el nivel de verificación, los badges que ya no cumplan se excluyen.
 */
export function evaluateBadges(identityProfile: IdentityProfile): string[] {
  return BADGE_RULES.filter((r) => r.condition(identityProfile)).map((r) => r.id);
}

/** Lista de ids de badges conocidos (para validación o UI). */
export const BADGE_IDS = BADGE_RULES.map((r) => r.id);
