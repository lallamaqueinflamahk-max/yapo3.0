/**
 * Biometría — interfaz y stub. Preparado para WebAuthn futuro.
 * Sin biometría real. No login real.
 */

/** Resultado de captura (stub: null hasta WebAuthn). */
export interface BiometricCaptureResult {
  payload: unknown;
}

/** Resultado de verificación (stub: success false hasta WebAuthn). */
export interface BiometricVerifyResult {
  success: boolean;
  userId?: string;
  reason?: string;
}

/**
 * Proveedor de biometría. Implementación actual: stub.
 * Futuro: WebAuthn (navigator.credentials.get / create).
 */
export interface IBiometricProvider {
  /** ¿Está disponible la biometría? (stub: false) */
  isAvailable(): Promise<boolean>;

  /** Captura biométrica. (stub: null) Futuro: navigator.credentials.get(). */
  capture(): Promise<BiometricCaptureResult | null>;

  /** Verifica el payload. (stub: success false) Futuro: verificación server-side. */
  verify(payload: unknown): Promise<BiometricVerifyResult>;
}

/**
 * Stub: no implementa biometría real.
 * isAvailable → false, capture → null, verify → success: false.
 */
export class BiometricProviderStub implements IBiometricProvider {
  async isAvailable(): Promise<boolean> {
    return false;
  }

  async capture(): Promise<BiometricCaptureResult | null> {
    return null;
  }

  async verify(_payload: unknown): Promise<BiometricVerifyResult> {
    return {
      success: false,
      reason: "Biometría no implementada. Preparado para WebAuthn.",
    };
  }
}

const defaultStub = new BiometricProviderStub();

export function createBiometricProvider(): IBiometricProvider {
  return defaultStub;
}
