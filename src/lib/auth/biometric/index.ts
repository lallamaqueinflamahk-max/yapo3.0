/**
 * Capa de biometría YAPÓ v2.
 * Separada de identidad y autorización; lista para WebAuthn / Face ID real.
 * Niveles: 1 = confirmación, 2 = local (stub), 3 = fuerte (preparado).
 */

export type {
  BiometricType,
  BiometricPayload,
  BiometricVerifyResult,
  BiometricCaptureOptions,
  BiometricLevelName,
} from "./types";
export { BIOMETRIC_LEVEL_MAP } from "./types";
export type { IBiometricProvider } from "./provider";
export {
  createBiometricProvider,
  BiometricProviderStub,
  setBiometricSimulateSuccess,
  getBiometricSimulateSuccess,
} from "./provider";
export {
  isWebAuthnSupported,
  isConditionalUISupported,
  isBiometricTypeLikelyAvailable,
} from "./webauthn";
export {
  actionRequiresBiometric,
  BIOMETRIC_REQUIRED_ACTIONS,
} from "./actions";
export { useRequireBiometric } from "./useRequireBiometric";
export type { UseRequireBiometricResult } from "./useRequireBiometric";

// --- Validación por nivel (wallet / Cerebro) ---
export type { BiometricLevel, BiometricValidationResult } from "./validation";
export {
  runBiometricValidation,
  runBiometricValidationForLevelName,
  isBiometricValidationFresh,
  isLevel1ConfirmationOnly,
  getValidationTtlMs,
  levelNameToLevel,
  levelToLevelName,
} from "./validation";
