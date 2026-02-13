/**
 * Identidad: perfiles y estado de verificación.
 * Separado de autorización (permisos) y biometría (factor).
 */

export {
  createIdentity,
  getIdentity,
  updateIdentity,
} from "../identityService";
export type { IdentityProfileUpdate } from "../identityService";
export type { IdentityProfile, VerificationLevel } from "../types";
