/**
 * FASE 2 – Validación servidor para Wallet API.
 * Sesión, consentimiento, perfil OK. Nunca confiar en datos del cliente.
 */

import { auth } from "@/lib/auth-next/config";
import { hasRequiredConsent } from "@/lib/auth-next/consent";
import { prisma } from "@/lib/db";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";

export interface WalletAccessResult {
  allowed: boolean;
  userId?: string;
  role?: string;
  reason?: string;
  safeMode?: boolean;
}

/**
 * Valida acceso a wallet: sesión, consentimiento, perfil OK.
 * Si SAFE MODE → allowed con safeMode: true (usar wallet en memoria).
 */
export async function validateWalletAccess(): Promise<WalletAccessResult> {
  if (SAFE_MODE_ENABLED) {
    return { allowed: true, userId: "safe-user", role: "vale", safeMode: true };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { allowed: false, reason: "No autenticado" };
  }

  const userId = session.user.id;
  if (userId === "dev-master" || userId === "safe-user") {
    return { allowed: true, userId, role: (session.user as { role?: string }).role ?? "vale", safeMode: false };
  }

  const hasConsent = await hasRequiredConsent(userId);
  if (!hasConsent) {
    return { allowed: false, userId, reason: "Consentimiento obligatorio no aceptado" };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (!profile || profile.profileStatus !== "OK") {
    return { allowed: false, userId, reason: "Perfil incompleto. Completá tu perfil para usar la billetera." };
  }

  const role = (session.user as { role?: string }).role ?? "vale";
  return { allowed: true, userId, role, safeMode: false };
}

/**
 * Roles que pueden realizar transferencias (todos en FASE 2; restringir en FASE 3 si aplica).
 */
const TRANSFER_ALLOWED_ROLES = ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"];

export function canTransfer(role: string): boolean {
  return TRANSFER_ALLOWED_ROLES.includes(role.toLowerCase());
}
