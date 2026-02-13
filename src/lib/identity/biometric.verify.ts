/**
 * Verificación biométrica y de identidad.
 * Comprueba nivel y métodos contra requisitos; no ejecuta flujos de captura.
 */

import type { UserIdentity, VerifiedLevel, VerificationMethods } from "./biometric.types";

/**
 * Indica si el usuario cumple el nivel mínimo de verificación.
 */
export function hasVerifiedLevel(identity: UserIdentity, required: VerifiedLevel): boolean {
  return identity.verifiedLevel >= required;
}

/**
 * Indica si el usuario tiene habilitado un método de verificación.
 */
export function hasVerificationMethod(
  identity: UserIdentity,
  method: keyof VerificationMethods
): boolean {
  return Boolean(identity.methods[method]);
}

/**
 * Verifica que la identidad cumpla el requisito (nivel o método).
 * Devuelve true si puede proceder; false si debe verificar antes.
 */
export function verifyIdentity(
  identity: UserIdentity,
  requirement: { level?: VerifiedLevel; method?: keyof VerificationMethods }
): boolean {
  if (requirement.level != null) {
    return hasVerifiedLevel(identity, requirement.level);
  }
  if (requirement.method != null) {
    return hasVerificationMethod(identity, requirement.method);
  }
  return true;
}

/**
 * Crea una UserIdentity a partir de datos mínimos (útil para mapear desde auth/session).
 */
export function toUserIdentity(
  userId: string,
  verifiedLevel: VerifiedLevel = 0,
  methods: Partial<VerificationMethods> = {}
): UserIdentity {
  return {
    userId,
    verifiedLevel,
    methods: {
      face: methods.face ?? false,
      voice: methods.voice ?? false,
      document: methods.document ?? false,
    },
  };
}
