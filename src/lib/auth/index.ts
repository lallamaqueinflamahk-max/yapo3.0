/**
 * Sistema de auth YAPÓ.
 * Separación: autenticación (identidad) | autorización (permisos por acción).
 */

// types
export type {
  RoleId,
  ActionId,
  VerificationLevel,
  IdentityProfile,
  Identity,
  Session,
  PermissionCheck,
} from "./types";

// roles
export {
  ROLES,
  ROLE_IDS,
  getRoleName,
  getRoleDescription,
  isValidRoleId,
} from "./roles";

// actions
export { ACTIONS } from "./actions";

// permissions
export {
  getRolesForAction,
  hasPermissionForAction,
  ACTION_ROLES,
} from "./permissions";

// identity service (in-memory profiles)
export {
  createIdentity,
  getIdentity,
  updateIdentity,
} from "./identityService";
export type { IdentityProfileUpdate } from "./identityService";

// verification service (step-by-step, no skip)
export {
  verifyBasic,
  verifyDocument,
  verifyBiometric,
  getVerificationEvents,
} from "./verificationService";
export type {
  VerificationStep,
  VerificationEvent,
  VerifyResult,
} from "./verificationService";

// badges (assign by rules; remove when trust drops)
export { evaluateBadges, BADGE_IDS } from "./badges";

// feature gates (allowed + reason)
export { canAccessFeature, FEATURE_IDS } from "./featureGates";
export type { FeatureId, FeatureAccessResult } from "./featureGates";

// CEREBRO CENTRAL (nunca bloquear en SAFE_MODE; sugerir paso previo)
export {
  shouldNeverBlock,
  getSuggestedStep,
  authorizeWithCerebro,
  autorizar,
  SIMULATED_USER_ID,
} from "./cerebroCentral";
export type {
  CerebroCentralContext,
  CerebroCentralDecision,
  AutorizacionRequest,
  AutorizacionResponse,
} from "./cerebroCentral";

// authentication
export { createAuthProvider } from "./authentication";
export type { IBiometricProvider as IAuthBiometricProvider } from "./authentication";

// biometric (IBiometricProvider: isAvailable, capture, verify — arquitectura lista para WebAuthn/Face ID)
export {
  createBiometricProvider,
  useRequireBiometric,
  actionRequiresBiometric,
  BIOMETRIC_REQUIRED_ACTIONS,
  isWebAuthnSupported,
  isConditionalUISupported,
  isBiometricTypeLikelyAvailable,
  setBiometricSimulateSuccess,
  getBiometricSimulateSuccess,
} from "./biometric";
export type {
  IBiometricProvider,
  BiometricType,
  BiometricPayload,
  BiometricVerifyResult,
  BiometricCaptureOptions,
  UseRequireBiometricResult,
} from "./biometric";

// dev (SAFE MODE: autologin mock, rol configurable)
export {
  SAFE_MODE_CLIENT,
  SAFE_MODE_ENABLED,
  createSafeSessionForClient,
  getDefaultSafeRoleClient,
  isSafeMode,
} from "./dev/safeMode";

// authorization
export {
  createAuthorizationService,
  can,
  canWithRoles,
} from "./authorization";

// dev (master key)
export {
  isMasterKeyProvided,
  createMasterIdentity,
  createMasterSession,
} from "./dev/masterKey";

// dev (DEV_MODE: saltar auth, usuario mock Mbareté)
export {
  isDevMode,
  createDevIdentity,
  createDevSession,
  logDevModeWarning,
} from "./dev/devMode";

// context (hook global de sesión)
export { SessionProvider, useSession } from "./context";
