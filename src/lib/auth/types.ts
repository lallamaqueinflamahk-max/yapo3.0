/**
 * Tipos y roles del sistema de autenticación YAPÓ v2.
 */

export type RoleId =
  | "vale"
  | "capeto"
  | "kavaju"
  | "mbarete"
  | "cliente"
  | "pyme"
  | "enterprise";

export type ActionId = string;

/** Nivel de verificación de identidad (KYC / confianza). */
export type VerificationLevel =
  | "unverified"
  | "basic"
  | "verified"
  | "trusted";

/** Perfil extendido de identidad: verificación, confianza, badges, capacidades. */
export interface IdentityProfile {
  userId: string;
  role: RoleId;
  verificationLevel: VerificationLevel;
  trustScore: number; // 0–100
  badges: string[];
  biometricEnabled: boolean;
  whatsappUnlocked: boolean;
}

export interface Identity {
  userId: string;
  roles: RoleId[];
  verified: boolean;
}

export interface Session {
  sessionId: string;
  identity: Identity;
  expiresAt: number;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredRoles?: RoleId[];
}
