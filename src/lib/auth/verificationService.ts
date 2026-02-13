/**
 * Servicio de verificación por pasos: no se puede saltar niveles.
 * Simula: basic → document → biometric.
 * Registra eventos de verificación en memoria.
 */

import { getIdentity, updateIdentity } from "./identityService";
import type { IdentityProfile, VerificationLevel } from "./types";

/** Orden de niveles: no se puede saltar. */
const LEVEL_ORDER: VerificationLevel[] = [
  "unverified",
  "basic",
  "verified",
  "trusted",
];

function levelIndex(level: VerificationLevel): number {
  const i = LEVEL_ORDER.indexOf(level);
  return i === -1 ? 0 : i;
}

/** Paso de verificación. */
export type VerificationStep = "basic" | "document" | "biometric";

/** Evento registrado al subir de nivel. */
export interface VerificationEvent {
  userId: string;
  fromLevel: VerificationLevel;
  toLevel: VerificationLevel;
  step: VerificationStep;
  at: number;
}

const events: VerificationEvent[] = [];

/** Resultado de una operación de verificación. */
export interface VerifyResult {
  success: boolean;
  profile: IdentityProfile | null;
  error?: string;
}

function requireLevel(
  userId: string,
  requiredLevel: VerificationLevel,
  step: VerificationStep,
  nextLevel: VerificationLevel,
  extraUpdates?: { biometricEnabled?: boolean }
): VerifyResult {
  const profile = getIdentity(userId);
  if (!profile) {
    return { success: false, profile: null, error: "Usuario sin perfil" };
  }
  const current = profile.verificationLevel;
  if (levelIndex(current) !== levelIndex(requiredLevel)) {
    return {
      success: false,
      profile,
      error:
        current === nextLevel
          ? "Ya tenés este nivel de verificación"
          : "No se puede saltar niveles; completá el paso anterior",
    };
  }
  const updated = updateIdentity(userId, {
    verificationLevel: nextLevel,
    trustScore: Math.min(100, profile.trustScore + 25),
    ...extraUpdates,
  });
  if (!updated) {
    return { success: false, profile, error: "Error al actualizar perfil" };
  }
  events.push({
    userId,
    fromLevel: current,
    toLevel: nextLevel,
    step,
    at: Date.now(),
  });
  return { success: true, profile: updated };
}

/**
 * Verificación básica (email/teléfono). Solo si el usuario está en "unverified" → pasa a "basic".
 */
export function verifyBasic(userId: string): VerifyResult {
  return requireLevel(userId, "unverified", "basic", "basic");
}

/**
 * Verificación por documento. Solo si el usuario está en "basic" → pasa a "verified".
 */
export function verifyDocument(userId: string): VerifyResult {
  return requireLevel(userId, "basic", "document", "verified");
}

/**
 * Verificación biométrica. Solo si el usuario está en "verified" → pasa a "trusted" y habilita biometría.
 */
export function verifyBiometric(userId: string): VerifyResult {
  return requireLevel(userId, "verified", "biometric", "trusted", {
    biometricEnabled: true,
  });
}

/**
 * Devuelve los eventos de verificación del usuario (o todos si no se pasa userId).
 */
export function getVerificationEvents(userId?: string): VerificationEvent[] {
  if (!userId) return [...events];
  return events.filter((e) => e.userId === userId);
}
