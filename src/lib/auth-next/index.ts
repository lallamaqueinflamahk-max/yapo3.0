/**
 * Auth real YAPÓ 3.0 – NextAuth v5 + Prisma + consentimiento obligatorio.
 * No reemplaza el módulo @/lib/auth (roles, permisos, SAFE MODE, Master Key).
 */

export { auth, signIn, signOut, handlers } from "./config";
export { hasRequiredConsent, recordConsent, CONSENT_VERSION_REQUIRED } from "./consent";
export { AuthSessionBridge } from "./SessionBridge";
export { ConsentGuard } from "./ConsentGuard";
export { ProfileGuard } from "./ProfileGuard";
