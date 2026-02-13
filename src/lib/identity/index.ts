/**
 * Identidad y biometría YAPÓ.
 * UserIdentity, verificación y guard; sin lógica de UI ni de navegación.
 * Registro en 3 capas y documentos por rol: docs/arquitectura/REGISTRO-IDENTIDAD-DATOS.md.
 */

export type {
  UserIdentity,
  VerifiedLevel,
  VerificationMethods,
  VerificationRequirement,
} from "./biometric.types";
export {
  hasVerifiedLevel,
  hasVerificationMethod,
  verifyIdentity,
  toUserIdentity,
} from "./biometric.verify";
export {
  biometricGuard,
  BIOMETRIC_REQUIREMENTS,
} from "./biometric.guard";
export type { BiometricGuardResult } from "./biometric.guard";

export type {
  RegistrationLayer,
  VerificationLevel,
  SocialProvider,
  DocumentType,
  DocumentRequirement,
  VerificationEventResult,
  SocialIdentityRecord,
} from "./registration.types";
export {
  DOCUMENTS_BY_ROLE,
  getDocumentsForRole,
  LAYER_FOR_SENSITIVE_ACTIONS,
} from "./registration.types";
