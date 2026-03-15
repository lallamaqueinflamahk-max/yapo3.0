/**
 * Punto de integración para KYC y verificación facial.
 * Resuelve el nivel de verificación del usuario (en memoria o, en el futuro, desde DB).
 * Uso: rutas que requieran KYC, UI de estado de verificación, flujo post–verificación facial.
 */

import type { VerificationLevel } from "@/lib/auth";
import { getIdentity } from "@/lib/auth";

/** Niveles en orden ascendente (no se puede saltar). */
export const KYC_LEVELS: VerificationLevel[] = [
  "unverified",
  "basic",
  "verified",
  "trusted",
];

/**
 * Devuelve el nivel de verificación del usuario.
 * Hoy: perfil en memoria (identityService). Futuro: leer de Profile.verificationLevel o User.kycStatus.
 */
export function getVerificationLevel(userId: string): VerificationLevel {
  const profile = getIdentity(userId);
  return profile?.verificationLevel ?? "unverified";
}

/**
 * Indica si el usuario puede acceder a funcionalidades que requieren KYC (ej. pagos, alta confianza).
 * Ajustar umbral según negocio (ej. "verified" o "trusted").
 */
export function canAccessKycGated(userId: string, minLevel: VerificationLevel = "verified"): boolean {
  const level = getVerificationLevel(userId);
  const minIdx = KYC_LEVELS.indexOf(minLevel);
  const userIdx = KYC_LEVELS.indexOf(level);
  return userIdx >= minIdx && minIdx >= 0;
}

/**
 * Hook para integración con verificación facial:
 * Tras éxito del proveedor (liveness + match), actualizar identidad con updateIdentity(userId, { verificationLevel: "trusted", biometricEnabled: true }).
 * El proveedor debe ser llamado desde una ruta protegida (auth) y validar el resultado antes de actualizar.
 */
