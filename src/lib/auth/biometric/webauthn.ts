/**
 * Detección de WebAuthn (solo disponibilidad).
 * No implementa flujos completos; arquitectura lista para Face ID / huella real.
 */

import type { BiometricType } from "./types";

/** ¿El navegador soporta WebAuthn? */
export function isWebAuthnSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.PublicKeyCredential === "function" &&
    typeof navigator?.credentials?.get === "function"
  );
}

/** ¿Soporta autenticación condicional (autocompletado)? Devuelve Promise en navegadores actuales. */
export async function isConditionalUISupported(): Promise<boolean> {
  if (typeof window === "undefined" || !isWebAuthnSupported()) return false;
  try {
    const fn = (window as unknown as { PublicKeyCredential?: { isConditionalMediationAvailable?: () => Promise<boolean> } })
      .PublicKeyCredential?.isConditionalMediationAvailable;
    if (typeof fn !== "function") return false;
    return await fn();
  } catch {
    return false;
  }
}

/**
 * Indica si el dispositivo podría soportar un tipo biométrico vía WebAuthn.
 * Solo detección; no garantiza que el usuario tenga el factor configurado.
 */
export function isBiometricTypeLikelyAvailable(type: BiometricType): boolean {
  if (typeof window === "undefined") return false;
  if (!isWebAuthnSupported()) return false;
  switch (type) {
    case "face":
      // Face ID / Windows Hello face típicamente vía platform authenticator
      return true;
    case "fingerprint":
      // Touch ID / Windows Hello PIN o huella
      return true;
    case "device":
      // Stub: siempre "disponible" para simulación
      return true;
    default:
      return false;
  }
}
