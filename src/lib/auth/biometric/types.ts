/**
 * Tipos para la capa de biometría.
 * Separado de identidad y autorización: solo verificación de factor biométrico.
 * Arquitectura lista para WebAuthn / Face ID / huella real.
 */

/** Niveles de seguridad: low = confirmación, medium = local (stub), high = fuerte (WebAuthn/FaceID). */
export type BiometricLevelName = "low" | "medium" | "high";

/** Mapeo nombre → nivel numérico (1 = low, 2 = medium, 3 = high). */
export const BIOMETRIC_LEVEL_MAP: Record<BiometricLevelName, 1 | 2 | 3> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** Tipos soportados: face (Face ID / WebAuthn), fingerprint (Touch ID / huella), device (stub). */
export type BiometricType = "face" | "fingerprint" | "device";

/** Payload devuelto por capture() y consumido por verify(). */
export interface BiometricPayload {
  type: BiometricType;
  /** Datos opacos (credencial WebAuthn, token dispositivo, etc.). */
  data: unknown;
  /** Timestamp de captura (opcional). */
  capturedAt?: number;
}

/** Resultado de verificación: éxito con identidad/sesión o fallo con razón. */
export interface BiometricVerifyResult {
  success: boolean;
  /** Si success: userId o session para continuar flujo. */
  userId?: string;
  session?: unknown;
  /** Si !success: razón legible. */
  reason?: string;
}

/** Opciones para captura (futuro: timeout, rpId, etc.). */
export interface BiometricCaptureOptions {
  /** Timeout en ms (stub ignora). */
  timeout?: number;
  /** Mensaje mostrado al usuario (ej. "Verificá tu identidad"). */
  userPrompt?: string;
}
