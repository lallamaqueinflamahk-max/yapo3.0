/**
 * IBiometricProvider: arquitectura real para biometría.
 * Stub realista: no usa proveedores reales aún; listo para WebAuthn / Face ID / huella.
 * - isAvailable(type): detección WebAuthn + fallback device
 * - capture(type): stub simula device; face/fingerprint null hasta WebAuthn.get()
 * - verify(payload): stub simula éxito; futuro verificación server-side
 * - getSupportedLevels(): low / medium / high (stub devuelve los tres)
 */

import { isWebAuthnSupported } from "./webauthn";
import type {
  BiometricType,
  BiometricPayload,
  BiometricVerifyResult,
  BiometricCaptureOptions,
  BiometricLevelName,
} from "./types";

export type { BiometricType, BiometricPayload, BiometricVerifyResult, BiometricCaptureOptions } from "./types";
export type { BiometricLevelName } from "./types";

export interface IBiometricProvider {
  /** ¿El dispositivo soporta este tipo? (WebAuthn o stub device). */
  isAvailable(type: BiometricType): Promise<boolean>;

  /** Captura biométrica. Stub: simula para device; resto devuelve null hasta implementación real (WebAuthn/FaceID). */
  capture(type: BiometricType, options?: BiometricCaptureOptions): Promise<BiometricPayload | null>;

  /** Verifica el payload. Stub: en modo simulación devuelve success para completar flujos. */
  verify(payload: BiometricPayload): Promise<BiometricVerifyResult>;

  /**
   * Niveles soportados por este proveedor (low/medium/high).
   * Stub: ["low","medium","high"]. WebAuthn/FaceID futuro: según authenticator.
   */
  getSupportedLevels?(): Promise<BiometricLevelName[]>;
}

/** Modo simulación: verify() devuelve success sin proveedor real (para flujos y SAFE MODE). */
let simulateSuccess = true;

export function setBiometricSimulateSuccess(value: boolean): void {
  simulateSuccess = value;
}

export function getBiometricSimulateSuccess(): boolean {
  return simulateSuccess;
}

/**
 * Stub: no implementa biometría real.
 * - isAvailable: WebAuthn supported o type === "device"
 * - capture: type "device" devuelve payload simulado; face/fingerprint null
 * - verify: si simulateSuccess, success; si no, failure
 */
export class BiometricProviderStub implements IBiometricProvider {
  async isAvailable(type: BiometricType): Promise<boolean> {
    if (type === "device") return true;
    if (typeof window === "undefined") return false;
    if (!isWebAuthnSupported()) return false;
    return true;
  }

  async capture(
    type: BiometricType,
    _options?: BiometricCaptureOptions
  ): Promise<BiometricPayload | null> {
    if (type === "device") {
      return {
        type: "device",
        data: { simulated: true, ts: Date.now() },
        capturedAt: Date.now(),
      };
    }
    // face / fingerprint: null hasta WebAuthn real
    return null;
  }

  async verify(payload: BiometricPayload): Promise<BiometricVerifyResult> {
    if (simulateSuccess && payload.type === "device") {
      return { success: true, userId: "safe-user" };
    }
    if (simulateSuccess) {
      return { success: true, userId: "safe-user" };
    }
    return {
      success: false,
      reason: "Biometría no implementada. Conectar proveedor real (WebAuthn / Face ID).",
    };
  }

  async getSupportedLevels(): Promise<BiometricLevelName[]> {
    return ["low", "medium", "high"];
  }
}

const defaultProvider = new BiometricProviderStub();

export function createBiometricProvider(): IBiometricProvider {
  return defaultProvider;
}
