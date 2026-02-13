/**
 * Validación biométrica antes de transacciones.
 * Mock: face / fingerprint. Estado: pending | validated.
 * Integrado con CerebroEngine: contexto biometricValidated para wallet.guard y decide().
 */

/** Tipos biométricos mock (face = Face ID / cámara, fingerprint = Touch ID / huella). */
export type BiometricMockType = "face" | "fingerprint";

/** Estado de validación biométrica para transacciones. */
export type BiometricValidationState = "pending" | "validated";

/** Nivel de validación (1 = confirmación, 2 = device/stub, 3 = fuerte). */
export type BiometricLevel = 1 | 2 | 3;

export interface BiometricState {
  state: BiometricValidationState;
  level?: BiometricLevel;
  validatedAt?: number;
  type?: BiometricMockType;
}

export interface BiometricValidationOutcome {
  success: boolean;
  level: BiometricLevel;
  at: number;
  type?: BiometricMockType;
  reason?: string;
}

const VALIDATION_TTL_MS = 60_000;

let currentState: BiometricState = { state: "pending" };

/**
 * Devuelve el estado actual de validación biométrica.
 * CerebroEngine / wallet.guard pueden leer biometricValidated desde aquí.
 */
export function getBiometricState(): BiometricState {
  return { ...currentState };
}

/**
 * Indica si hay una validación reciente válida para el nivel requerido.
 * Usado por CerebroEngine y wallet.guard para no re-pedir biometría.
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
 * Formato esperado por CerebroContext.biometricValidated y wallet.guard.
 * Si el estado es validated y está fresco, usar este valor en el contexto.
 */
export function getBiometricValidatedForContext(): { level: number; at: number } | null {
  if (currentState.state !== "validated" || currentState.validatedAt == null || currentState.level == null) {
    return null;
  }
  if (!isBiometricValidationFresh(
    { level: currentState.level, at: currentState.validatedAt },
    currentState.level,
    VALIDATION_TTL_MS
  )) {
    return null;
  }
  return { level: currentState.level, at: currentState.validatedAt };
}

/**
 * Mock: solicita validación biométrica (face o fingerprint).
 * Simula éxito tras una breve verificación; en producción sería WebAuthn / Face ID / huella.
 */
export async function requestBiometricValidation(
  type: BiometricMockType,
  level: BiometricLevel = 2
): Promise<BiometricValidationOutcome> {
  currentState = { state: "pending", level, type };

  // Mock: simula captura y verificación (face / fingerprint)
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const at = Date.now();
  const success = true; // Mock siempre éxito; en producción dependería del proveedor real

  if (success) {
    currentState = {
      state: "validated",
      level,
      validatedAt: at,
      type,
    };
    return { success: true, level, at, type };
  }

  currentState = { state: "pending" };
  return {
    success: false,
    level,
    at,
    type,
    reason: "Verificación biométrica fallida.",
  };
}

/**
 * Limpia el estado de validación (p. ej. al cerrar sesión o cancelar flujo).
 */
export function clearBiometricState(): void {
  currentState = { state: "pending" };
}

/**
 * Marca como validado sin pasar por captura (p. ej. nivel 1 = solo confirmación UI).
 * Integrado con CerebroEngine: la UI puede llamar esto tras "Confirmar" y luego re-ejecutar intent.
 */
export function setBiometricValidated(level: BiometricLevel): void {
  currentState = {
    state: "validated",
    level,
    validatedAt: Date.now(),
  };
}

export function getValidationTtlMs(): number {
  return VALIDATION_TTL_MS;
}
