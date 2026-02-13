/**
 * Guard de biometría: bloquea acciones según nivel/método de verificación.
 * No decide navegación ni ejecuta; solo autoriza o deniega.
 */

import type { UserIdentity, VerificationRequirement } from "./biometric.types";
import { verifyIdentity } from "./biometric.verify";

export interface BiometricGuardResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Evalúa si la identidad cumple el requisito de verificación.
 * Si no cumple, devuelve allowed: false y reason; no navega ni ejecuta.
 */
export function biometricGuard(
  identity: UserIdentity | null,
  requirement: VerificationRequirement
): BiometricGuardResult {
  if (!identity) {
    return { allowed: false, reason: "Usuario no identificado." };
  }

  const req =
    "level" in requirement
      ? { level: requirement.level }
      : { method: requirement.method };

  const ok = verifyIdentity(identity, req);
  if (!ok) {
    const reason =
      "level" in requirement
        ? `Se requiere nivel de verificación ${requirement.level}.`
        : `Se requiere verificación por ${requirement.method}.`;
    return { allowed: false, reason };
  }

  return { allowed: true };
}

/**
 * Requisitos predefinidos por tipo de acción (ej. transferencia = level 2 o document).
 */
export const BIOMETRIC_REQUIREMENTS = {
  /** Solo usuario identificado (level >= 0). */
  any: { level: 0 } as VerificationRequirement,
  /** Verificación básica (level >= 1). */
  basic: { level: 1 } as VerificationRequirement,
  /** Documento o superior (level >= 2). */
  document: { level: 2 } as VerificationRequirement,
  /** Biométrico completo (level >= 3). */
  full: { level: 3 } as VerificationRequirement,
  /** Requiere método face. */
  face: { method: "face" as const } as VerificationRequirement,
  /** Requiere método voice. */
  voice: { method: "voice" as const } as VerificationRequirement,
  /** Requiere método document. */
  documentMethod: { method: "document" as const } as VerificationRequirement,
};
