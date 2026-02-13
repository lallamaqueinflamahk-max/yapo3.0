/**
 * Seguridad progresiva YAPÓ.
 * SAFE MODE (starter nunca se bloquea), biometría (stub → WebAuthn), escalación.
 * No login real. Todo preparado para WebAuthn futuro.
 */

export {
  SAFE_MODE,
  shouldSkipLogin,
  getSafeIdentity,
  getSafeModeRole,
  getSafeModeUser,
  getSafeModeSession,
} from "./safeMode";
export type {
  SafeModeRole,
  SafeIdentity,
  SafeModeUser,
  SafeModeSession,
} from "./safeMode";

export {
  BiometricProviderStub,
  createBiometricProvider,
} from "./biometric";
export type {
  IBiometricProvider,
  BiometricCaptureResult,
  BiometricVerifyResult,
} from "./biometric";

export {
  getBiometricState,
  getBiometricValidatedForContext,
  isBiometricValidationFresh,
  requestBiometricValidation,
  clearBiometricState,
  setBiometricValidated,
  getValidationTtlMs,
} from "./biometrics";
export type {
  BiometricMockType,
  BiometricValidationState,
  BiometricLevel,
  BiometricState,
  BiometricValidationOutcome,
} from "./biometrics";

export { shouldEscalate, shouldEscalateSecurity } from "./escalation";
export type {
  EscalationContext,
  EscalationResult,
  EscalationRole,
  EscalationImpact,
} from "./escalation";
