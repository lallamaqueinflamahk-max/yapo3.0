/**
 * Servicio de identidad: perfiles por usuario en memoria.
 * Crear, obtener y actualizar estado (verificación, biometría, WhatsApp).
 * Starter: sin persistencia, sin UI.
 */

import type { IdentityProfile, RoleId, VerificationLevel } from "./types";

const DEFAULT_VERIFICATION: VerificationLevel = "unverified";
const DEFAULT_TRUST_SCORE = 0;

const profiles = new Map<string, IdentityProfile>();

/** Actualización parcial del perfil (todo excepto userId). */
export type IdentityProfileUpdate = Partial<Omit<IdentityProfile, "userId">>;

/**
 * Crea un perfil de identidad para el usuario.
 * Si ya existe, lo reemplaza con el nuevo role y valores por defecto.
 */
export function createIdentity(userId: string, role: RoleId): IdentityProfile {
  const profile: IdentityProfile = {
    userId,
    role,
    verificationLevel: DEFAULT_VERIFICATION,
    trustScore: DEFAULT_TRUST_SCORE,
    badges: [],
    biometricEnabled: false,
    whatsappUnlocked: false,
  };
  profiles.set(userId, profile);
  return profile;
}

/**
 * Obtiene el perfil de identidad del usuario, o null si no existe.
 */
export function getIdentity(userId: string): IdentityProfile | null {
  return profiles.get(userId) ?? null;
}

/**
 * Actualiza el perfil del usuario con los campos indicados.
 * Permite actualizar: verificationLevel, trustScore, badges, biometricEnabled, whatsappUnlocked, role.
 * Devuelve el perfil actualizado o null si el usuario no existe.
 */
export function updateIdentity(
  userId: string,
  updates: IdentityProfileUpdate
): IdentityProfile | null {
  const current = profiles.get(userId);
  if (!current) return null;

  const updated: IdentityProfile = {
    ...current,
    ...updates,
    userId: current.userId, // nunca sobrescribir
  };
  // Asegurar trustScore en rango 0–100
  if (typeof updated.trustScore === "number") {
    updated.trustScore = Math.max(0, Math.min(100, updated.trustScore));
  }
  profiles.set(userId, updated);
  return updated;
}
