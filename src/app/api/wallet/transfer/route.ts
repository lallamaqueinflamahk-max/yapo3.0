/**
 * POST /api/wallet/transfer – Transferencia entre usuarios.
 * Valida: sesión, consentimiento, perfil OK, rol, monto (Zod).
 * SAFE MODE: ledger en memoria, transacciones DEV_ONLY.
 */

import { NextResponse } from "next/server";
import { validateWalletAccess, canTransfer } from "@/lib/wallet-db/guard";
import { transfer as transferDb } from "@/lib/wallet-db/service";
import { createWallet as createWalletMemory } from "@/lib/wallet/ledger";
import { requestTransfer, holdTransaction, releaseTransaction } from "@/lib/wallet/service";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";
import type { RoleId } from "@/lib/auth";
import { validateBody, handleApiError, transferBodySchema } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const access = await validateWalletAccess();
    if (!access.allowed || !access.userId) {
      return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
    }
    if (!canTransfer(access.role ?? "vale")) {
      return NextResponse.json({ error: "Tu rol no permite transferencias" }, { status: 403 });
    }

    const body = await validateBody(transferBodySchema, request);
    const fromUserId = access.userId;

    if (SAFE_MODE_ENABLED && access.safeMode) {
      createWalletMemory(fromUserId);
      createWalletMemory(body.toUserId);
      const req = requestTransfer(fromUserId, body.toUserId, body.amount);
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
        success: true,
        transactionId: req.transaction.id,
        transaction: {
          id: req.transaction.id,
          fromUserId,
          toUserId: body.toUserId,
          amount: String(body.amount),
          currency: "PYG",
          createdAt: new Date().toISOString(),
          status: "completed",
        },
        devOnly: true,
        message: "Transferencia realizada (modo desarrollo)",
      });
    }

    const result = await transferDb(fromUserId, body.toUserId, body.amount, body.reason);
    return NextResponse.json({
      ok: true,
      success: true,
      debitId: result.debitId,
      creditId: result.creditId,
      transaction: {
        id: result.debitId ?? result.creditId ?? "tx",
        fromUserId,
        toUserId: body.toUserId,
        amount: String(body.amount),
        currency: "PYG",
        createdAt: new Date().toISOString(),
        status: "completed",
      },
      devOnly: false,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
