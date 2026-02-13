/**
 * Tipos de identidad y biometría YAPÓ.
 * UserIdentity: userId + nivel de verificación + métodos habilitados.
 */

/** Nivel de verificación: 0 = sin verificar, 1 = básico, 2 = documento, 3 = biométrico completo. */
export type VerifiedLevel = 0 | 1 | 2 | 3;

/** Métodos de verificación habilitados para el usuario. */
export interface VerificationMethods {
  face?: boolean;
  voice?: boolean;
  document?: boolean;
}

/** Identidad del usuario: id, nivel y métodos de verificación. */
export interface UserIdentity {
  userId: string;
  verifiedLevel: VerifiedLevel;
  methods: VerificationMethods;
}

/** Requisito mínimo de verificación para una acción. */
export type VerificationRequirement =
  | { level: VerifiedLevel }
  | { method: keyof VerificationMethods };
