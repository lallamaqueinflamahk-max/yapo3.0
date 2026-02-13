/**
 * POST /api/wallet/transfer – Transferencia entre usuarios.
 * Valida: sesión, consentimiento, perfil OK, rol, monto.
 * SAFE MODE: ledger en memoria, transacciones DEV_ONLY.
 */

import { NextResponse } from "next/server";
import { validateWalletAccess, canTransfer } from "@/lib/wallet-db/guard";
import { transfer as transferDb } from "@/lib/wallet-db/service";
import { createWallet as createWalletMemory } from "@/lib/wallet/ledger";
import { requestTransfer, holdTransaction, releaseTransaction } from "@/lib/wallet/service";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";
import type { RoleId } from "@/lib/auth";

export async function POST(request: Request) {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }
  if (!canTransfer(access.role ?? "vale")) {
    return NextResponse.json({ error: "Tu rol no permite transferencias" }, { status: 403 });
  }

  let body: { toUserId?: string; amount?: number; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const toUserId = typeof body.toUserId === "string" ? body.toUserId.trim() : "";
  const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : 0;
  const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

  if (!toUserId) return NextResponse.json({ error: "toUserId es obligatorio" }, { status: 400 });
  if (amount <= 0) return NextResponse.json({ error: "amount debe ser positivo" }, { status: 400 });

  const fromUserId = access.userId;

  if (SAFE_MODE_ENABLED && access.safeMode) {
    createWalletMemory(fromUserId);
    createWalletMemory(toUserId);
    const req = requestTransfer(fromUserId, toUserId, amount);
    if (!req.success || !req.transaction) {
      return NextResponse.json({ error: req.error ?? "Error al crear transferencia" }, { status: 400 });
    }
    const hold = holdTransaction(req.transaction.id);
    if (!hold.success) {
      return NextResponse.json({ error: hold.error ?? "Error al retener" }, { status: 400 });
    }
    const role = (access.role ?? "vale") as RoleId;
    const release = releaseTransaction(req.transaction.id, fromUserId, [role]);
    if (!release.success) {
      return NextResponse.json({ error: release.error ?? "Error al liberar" }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      transactionId: req.transaction.id,
      devOnly: true,
      message: "Transferencia realizada (modo desarrollo)",
    });
  }

  try {
    const result = await transferDb(fromUserId, toUserId, amount, reason);
    return NextResponse.json({
      ok: true,
      debitId: result.debitId,
      creditId: result.creditId,
      devOnly: false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al transferir";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
