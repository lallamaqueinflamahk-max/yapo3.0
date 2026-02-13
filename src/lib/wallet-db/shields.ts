/**
 * FASE 2 – Escudos (Shields). assignShield, revokeShield, hasShield.
 */

import { prisma } from "@/lib/db";
import type { ShieldType } from "./types";
import { SHIELD_TYPES } from "./types";

function isValidShieldType(t: string): t is ShieldType {
  return SHIELD_TYPES.includes(t as ShieldType);
}

/**
 * Obtiene o crea un Shield por tipo (un registro activo por tipo).
 */
async function getOrCreateShieldByType(type: ShieldType): Promise<string> {
  let shield = await prisma.shield.findFirst({
    where: { type, active: true },
  });
  if (!shield) {
    shield = await prisma.shield.create({
      data: { type, level: 1, active: true },
    });
  }
  return shield.id;
}

/**
 * Asigna un escudo al usuario (status ACTIVE).
 */
export async function assignShield(userId: string, shieldType: string): Promise<{ userShieldId: string }> {
  if (!isValidShieldType(shieldType)) throw new Error(`Tipo de escudo inválido: ${shieldType}`);
  const shieldId = await getOrCreateShieldByType(shieldType);
  const userShield = await prisma.userShield.upsert({
    where: { userId_shieldId: { userId, shieldId } },
    create: { userId, shieldId, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });
  return { userShieldId: userShield.id };
}

/**
 * Revoca (suspende) un escudo del usuario.
 */
export async function revokeShield(userId: string, shieldType: string): Promise<void> {
  if (!isValidShieldType(shieldType)) throw new Error(`Tipo de escudo inválido: ${shieldType}`);
  const shield = await prisma.shield.findFirst({
    where: { type: shieldType, active: true },
  });
  if (!shield) return;
  await prisma.userShield.updateMany({
    where: { userId, shieldId: shield.id },
    data: { status: "SUSPENDED" },
  });
}

/**
 * Indica si el usuario tiene el escudo activo.
 */
export async function hasShield(userId: string, shieldType: string): Promise<boolean> {
  if (!isValidShieldType(shieldType)) return false;
  const shield = await prisma.shield.findFirst({
    where: { type: shieldType, active: true },
  });
  if (!shield) return false;
  const userShield = await prisma.userShield.findUnique({
    where: { userId_shieldId: { userId, shieldId: shield.id } },
  });
  return userShield?.status === "ACTIVE";
}

/**
 * Lista escudos activos del usuario.
 */
export async function getUserShields(userId: string): Promise<Array<{ id: string; type: ShieldType; level: number; status: string }>> {
  const userShields = await prisma.userShield.findMany({
    where: { userId, status: "ACTIVE" },
    include: { shield: true },
  });
  return userShields
    .filter((us) => us.shield.active)
    .map((us) => ({
      id: us.id,
      type: us.shield.type as ShieldType,
      level: us.shield.level,
      status: us.status,
    }));
}
