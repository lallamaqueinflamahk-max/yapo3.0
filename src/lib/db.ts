/**
 * Cliente Prisma – YAPÓ 3.0
 * Identidad real + registro legal + persistencia (User, Profile, Consent).
 * Singleton en desarrollo para evitar múltiples instancias con hot reload.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
