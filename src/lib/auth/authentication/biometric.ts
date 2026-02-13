/**
 * Interfaz IBiometricProvider (stub).
 * No implementa biometría real. Preparado para WebAuthn / Face ID.
 * Flujo: isAvailable(type) → capture(type) → verify(payload) → AuthResult.
 */

import type { AuthResult, BiometricPayload } from "./types";

export interface IBiometricProvider {
  /** ¿El dispositivo soporta este tipo de biometría? (WebAuthn / Face ID / Touch ID) */
  isAvailable(type: BiometricPayload["type"]): Promise<boolean>;

  /** Captura biométrica del tipo indicado. Devuelve payload para verify(). */
  capture(type: BiometricPayload["type"]): Promise<BiometricPayload | null>;

  /** Verifica el payload biométrico y devuelve identity + session o razón de fallo. */
  verify(payload: BiometricPayload): Promise<AuthResult>;
}

/**
 * Stub: no implementa biometría real.
 * isAvailable → false, capture → null, verify → success: false.
 * Para producción: implementar con WebAuthn (navigator.credentials.get)
 * o APIs nativas (Face ID / Touch ID).
 */
export class BiometricAuthProviderStub implements IBiometricProvider {
  async isAvailable(_type: BiometricPayload["type"]): Promise<boolean> {
    return false;
  }

  async capture(_type: BiometricPayload["type"]): Promise<BiometricPayload | null> {
    return null;
  }

  async verify(_payload: BiometricPayload): Promise<AuthResult> {
    return {
      success: false,
      reason:
        "Biometría no implementada. Conectar proveedor real (WebAuthn / Face ID).",
    };
  }
}

const biometricStub = new BiometricAuthProviderStub();

export function createBiometricProvider(): IBiometricProvider {
  return biometricStub;
}
