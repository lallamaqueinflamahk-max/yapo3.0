/**
 * GET /api/wallet/transactions – Historial de transacciones del usuario.
 * Valida: sesión, consentimiento, perfil OK.
 * SAFE MODE: transacciones del ledger en memoria, devOnly: true.
 */

import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import { getTransactions as getTransactionsDb } from "@/lib/wallet-db/service";
import { getTransactions as getTransactionsMemory } from "@/lib/wallet/ledger";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";

export async function GET(request: Request) {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100);

  if (SAFE_MODE_ENABLED && access.safeMode) {
    const userId = access.userId;
    const all = getTransactionsMemory();
    const forUser = all.filter((t) => t.from === userId || t.to === userId);
    const sorted = [...forUser].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const slice = sorted.slice(0, limit);
    const transactions = slice.map((t) => ({
      id: t.id,
      type: t.from === userId ? "DEBIT" : "CREDIT",
      amount: t.amount,
      reason: t.to === userId ? `Transferencia de ${t.from}` : `Transferencia a ${t.to}`,
      createdAt: new Date(t.createdAt ?? 0).toISOString(),
      devOnly: true,
    }));
    return NextResponse.json({ transactions, devOnly: true });
  }

  const transactions = await getTransactionsDb(access.userId, limit);
  return NextResponse.json({
    transactions: transactions.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
    devOnly: false,
  });
}
