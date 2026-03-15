/**
 * Consentimiento obligatorio – YAPÓ 3.0
 * Versión vigente y verificación en DB (Prisma).
 */

import { prisma } from "@/lib/db";

/** Versión vigente del consentimiento de privacidad + términos. Sin aceptación → no accede. */
export const CONSENT_VERSION_REQUIRED = "privacy-and-terms-v1";

/** Consentimiento de biometría para KYC (documento + facial). Requerido antes de iniciar verificación. */
export const CONSENT_VERSION_BIOMETRIA = "biometria-v1";

/**
 * Indica si el usuario tiene aceptada la versión vigente del consentimiento.
 */
export async function hasRequiredConsent(userId: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: { userId, version: CONSENT_VERSION_REQUIRED },
    orderBy: { acceptedAt: "desc" },
  });
  return consent != null;
}

/**
 * Indica si el usuario tiene aceptado el consentimiento de biometría (para KYC).
 */
export async function hasBiometriaConsent(userId: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: { userId, version: CONSENT_VERSION_BIOMETRIA },
    orderBy: { acceptedAt: "desc" },
  });
  return consent != null;
}

/**
 * Registra la aceptación del consentimiento (IP y userAgent opcionales).
 */
export async function recordConsent(
  userId: string,
  options?: { ip?: string; userAgent?: string }
): Promise<void> {
  await prisma.consent.create({
    data: {
      userId,
      version: CONSENT_VERSION_REQUIRED,
      acceptedAt: new Date(),
      ip: options?.ip ?? null,
      userAgent: options?.userAgent ?? null,
    },
  });
}

/**
 * Registra la aceptación del consentimiento de biometría (KYC).
 */
export async function recordBiometriaConsent(
  userId: string,
  options?: { ip?: string; userAgent?: string }
): Promise<void> {
  await prisma.consent.create({
    data: {
      userId,
      version: CONSENT_VERSION_BIOMETRIA,
      acceptedAt: new Date(),
      ip: options?.ip ?? null,
      userAgent: options?.userAgent ?? null,
    },
  });
}
