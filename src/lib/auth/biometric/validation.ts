/**
 * Validación por nivel biométrico.
 * low (1): confirmación simple (UI). medium (2): biometría local (stub). high (3): fuerte (WebAuthn/FaceID).
 * No usa proveedores reales aún; arquitectura lista para WebAuthn / FaceID / huella.
 */

import type { IBiometricProvider } from "./provider";
import type { BiometricType, BiometricLevelName } from "./types";
import { BIOMETRIC_LEVEL_MAP } from "./types";
import { createBiometricProvider } from "./provider";

/** Niveles de validación: 1 = low, 2 = medium, 3 = high. */
export type BiometricLevel = 1 | 2 | 3;

const LEVEL_NAMES: Record<BiometricLevel, BiometricLevelName> = {
  1: "low",
  2: "medium",
  3: "high",
};

/** Convierte nombre (low | medium | high) a nivel numérico. */
export function levelNameToLevel(name: BiometricLevelName): BiometricLevel {
  return BIOMETRIC_LEVEL_MAP[name];
}

/** Convierte nivel numérico a nombre. */
export function levelToLevelName(level: BiometricLevel): BiometricLevelName {
  return LEVEL_NAMES[level];
}

export interface BiometricValidationResult {
  success: boolean;
  reason?: string;
}

const VALIDATION_TTL_MS = 60_000;

/** Tiempo máximo (ms) que una validación biométrica se considera válida para no re-pedir. */
export function getValidationTtlMs(): number {
  return VALIDATION_TTL_MS;
}

/**
 * Nivel 1: confirmación simple. No llama al provider; la UI muestra "Confirmar" y resuelve.
 * La lógica nunca ejecuta transacción sin que la UI haya indicado confirmación.
 */
export function isLevel1ConfirmationOnly(level: BiometricLevel): boolean {
  return level === 1;
}

/**
 * Ejecuta validación biométrica para nivel 2 o 3.
 * Nivel 2: capture("device") + verify (stub).
 * Nivel 3: intenta face → fingerprint → device (preparado para WebAuthn / FaceID / huella).
 * Si falla → abortar; nunca ejecutar transacción sin validación.
 */
export async function runBiometricValidation(
  level: BiometricLevel,
  provider?: IBiometricProvider | null
): Promise<BiometricValidationResult> {
  if (level === 1) {
    return { success: true };
  }
  const p = provider ?? createBiometricProvider();
  const types: BiometricType[] =
    level === 3 ? ["face", "fingerprint", "device"] : ["device"];

  for (const type of types) {
    const available = await p.isAvailable(type);
    if (!available) continue;
    const payload = await p.capture(type, {
      userPrompt: level === 3 ? "Verificación fuerte requerida" : "Verificá tu identidad",
    });
    if (!payload) continue;
    const result = await p.verify(payload);
    if (result.success) return { success: true };
    return {
      success: false,
      reason: result.reason ?? "Verificación fallida",
    };
  }
  return {
    success: false,
    reason: "Ningún método biométrico disponible. Conectar WebAuthn o dispositivo.",
  };
}

/**
 * Indica si una validación previa (biometricValidated) sigue siendo válida para el nivel requerido.
 * Usado por wallet.guard para no re-pedir si el usuario acaba de validar.
 */
export function isBiometricValidationFresh(
  validated: { level: number; at: number },
  requiredLevel: number,
  ttlMs: number = VALIDATION_TTL_MS
): boolean {
  return (
    validated.level >= requiredLevel &&
    Number.isFinite(validated.at) &&
    Date.now() - validated.at < ttlMs
  );
}

/**
 * Ejecuta validación biométrica por nombre de nivel (low | medium | high).
 * Delega a runBiometricValidation(levelNameToLevel(name)).
 */
export async function runBiometricValidationForLevelName(
  levelName: BiometricLevelName,
  provider?: IBiometricProvider | null
): Promise<BiometricValidationResult> {
  return runBiometricValidation(levelNameToLevel(levelName), provider);
}
