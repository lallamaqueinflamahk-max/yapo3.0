/**
 * Auth real YAPÓ 3.0 – NextAuth v5 + Prisma + consentimiento obligatorio.
 * No reemplaza el módulo @/lib/auth (roles, permisos, SAFE MODE, Master Key).
 */

export { auth, signIn, signOut, handlers } from "./config";
export { hasRequiredConsent, recordConsent, CONSENT_VERSION_REQUIRED } from "./consent";
export { AuthSessionBridge } from "./SessionBridge";
export { ConsentGuard } from "./ConsentGuard";
export { ProfileGuard } from "./ProfileGuard";
export {
  SESSION_MAX_AGE_SECONDS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_REQUEST_MESSAGE,
} from "./constants";
export {
  getVerificationLevel,
  canAccessKycGated,
  KYC_LEVELS,
} from "./verification";
