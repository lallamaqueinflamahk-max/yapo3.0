/**
 * Servicio KYC: estado de verificación desde DB y registro de eventos.
 * No almacena imágenes ni datos biométricos crudos; solo resultado y nivel.
 */

import { prisma } from "@/lib/db";
import type { KycVerificationLevel, VerificationStep } from "./types";

const LEVEL_ORDER: KycVerificationLevel[] = ["unverified", "basic", "verified", "trusted"];
const STEP_BY_LEVEL: Record<KycVerificationLevel, VerificationStep[]> = {
  unverified: [],
  basic: ["basic"],
  verified: ["basic", "document"],
  trusted: ["basic", "document", "biometric"],
};

export async function getKycStatus(userId: string): Promise<{
  verificationLevel: KycVerificationLevel;
  canAccessWallet: boolean;
  canAccessVideo: boolean;
  stepsCompleted: VerificationStep[];
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { verificationLevel: true },
  });
  if (!user) return null;

  const level = (user.verificationLevel ?? "unverified") as KycVerificationLevel;
  const stepsCompleted = STEP_BY_LEVEL[level] ?? [];

  const verifiedOrTrusted = level === "verified" || level === "trusted";
  return {
    verificationLevel: level,
    canAccessWallet: verifiedOrTrusted,
    canAccessVideo: verifiedOrTrusted,
    stepsCompleted,
  };
}

/**
 * Registra un evento de verificación exitosa y actualiza User.verificationLevel.
 * Llamar desde el webhook de Incode o desde una ruta protegida tras validar el resultado.
 */
export async function recordVerificationSuccess(
  userId: string,
  params: {
    step: VerificationStep;
    provider?: string;
    providerId?: string;
    newLevel: KycVerificationLevel;
  }
): Promise<boolean> {
  const { step, provider = "incode", providerId, newLevel } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const currentLevel = (user.verificationLevel ?? "unverified") as KycVerificationLevel;
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  const newIdx = LEVEL_ORDER.indexOf(newLevel);
  if (newIdx <= currentIdx) return true; // ya tenía ese nivel o mayor

  await prisma.$transaction([
    prisma.verificationEvent.create({
      data: {
        userId,
        step,
        result: "ok",
        provider,
        providerId: providerId ?? null,
        verificationLevel: newLevel,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { verificationLevel: newLevel },
    }),
  ]);

  return true;
}
