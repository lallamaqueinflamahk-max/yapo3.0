/**
 * FASE 2 – Wallet Service (Prisma).
 * getWallet, credit, debit, transfer.
 * Validación de permisos por rol en API; aquí solo lógica de saldo.
 */

import { prisma } from "@/lib/db";
import type { WalletStatus } from "./types";

const ZERO = 0;

function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (value != null && typeof value === "object" && "toNumber" in typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  const n = Number(value);
  return Number.isNaN(n) ? ZERO : n;
}

/**
 * Obtiene o crea la wallet del usuario.
 */
export async function getOrCreateWallet(userId: string): Promise<{ id: string; userId: string; balance: number; status: WalletStatus; createdAt: Date }> {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: ZERO, status: "ACTIVE" },
    });
  }
  return {
    id: wallet.id,
    userId: wallet.userId,
    balance: toNumber(wallet.balance),
    status: wallet.status as WalletStatus,
    createdAt: wallet.createdAt,
  };
}

/**
 * Obtiene la wallet del usuario (sin crear).
 */
export async function getWallet(userId: string): Promise<{ id: string; userId: string; balance: number; status: WalletStatus; createdAt: Date } | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) return null;
  return {
    id: wallet.id,
    userId: wallet.userId,
    balance: toNumber(wallet.balance),
    status: wallet.status as WalletStatus,
    createdAt: wallet.createdAt,
  };
}

/**
 * Acredita monto a la wallet del usuario.
 */
export async function credit(
  userId: string,
  amount: number,
  reason: string
): Promise<{ walletId: string; transactionId: string }> {
  if (amount <= 0) throw new Error("Monto debe ser positivo");
  const wallet = await getOrCreateWallet(userId);
  if (wallet.status === "FROZEN") throw new Error("Wallet congelada");

  const newBalance = wallet.balance + amount;
  const [tx] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        amount,
        reason,
        devOnly: false,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
  ]);
  return { walletId: wallet.id, transactionId: tx.id };
}

/**
 * Debita monto de la wallet del usuario.
 */
export async function debit(
  userId: string,
  amount: number,
  reason: string
): Promise<{ walletId: string; transactionId: string }> {
  if (amount <= 0) throw new Error("Monto debe ser positivo");
  const wallet = await getOrCreateWallet(userId);
  if (wallet.status === "FROZEN") throw new Error("Wallet congelada");
  if (wallet.balance < amount) throw new Error("Saldo insuficiente");

  const newBalance = wallet.balance - amount;
  const [tx] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEBIT",
        amount,
        reason,
        devOnly: false,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    }),
  ]);
  return { walletId: wallet.id, transactionId: tx.id };
}

/**
 * Transfiere monto de un usuario a otro. Crea DEBIT en origen y CREDIT en destino.
 */
export async function transfer(
  fromUserId: string,
  toUserId: string,
  amount: number,
  reason?: string
): Promise<{ debitId: string; creditId: string }> {
  if (amount <= 0) throw new Error("Monto debe ser positivo");
  if (fromUserId === toUserId) throw new Error("No se puede transferir a la misma cuenta");

  const fromWallet = await getOrCreateWallet(fromUserId);
  const toWallet = await getOrCreateWallet(toUserId);
  if (fromWallet.status === "FROZEN") throw new Error("Wallet de origen congelada");
  if (toWallet.status === "FROZEN") throw new Error("Wallet de destino congelada");
  if (fromWallet.balance < amount) throw new Error("Saldo insuficiente");

  const reasonText = reason ?? `Transferencia a ${toUserId}`;
  const debitReason = `Transferencia a usuario: ${reasonText}`;
  const creditReason = `Transferencia de usuario: ${reasonText}`;

  const result = await prisma.$transaction(async (prismaTx) => {
    const debitRow = await prismaTx.walletTransaction.create({
      data: {
        walletId: fromWallet.id,
        type: "DEBIT",
        amount,
        reason: debitReason,
        devOnly: false,
      },
    });
    const creditRow = await prismaTx.walletTransaction.create({
      data: {
        walletId: toWallet.id,
        type: "CREDIT",
        amount,
        reason: creditReason,
        devOnly: false,
      },
    });
    await prismaTx.wallet.update({
      where: { id: fromWallet.id },
      data: { balance: fromWallet.balance - amount },
    });
    await prismaTx.wallet.update({
      where: { id: toWallet.id },
      data: { balance: toWallet.balance + amount },
    });
    return { debitId: debitRow.id, creditId: creditRow.id };
  });
  return result;
}

/**
 * Lista transacciones de la wallet del usuario.
 */
export async function getTransactions(
  userId: string,
  limit = 50
): Promise<Array<{ id: string; type: string; amount: number; reason: string | null; createdAt: Date; devOnly: boolean }>> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: limit } },
  });
  if (!wallet) return [];
  return wallet.transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: toNumber(t.amount),
    reason: t.reason,
    createdAt: t.createdAt,
    devOnly: t.devOnly,
  }));
}
