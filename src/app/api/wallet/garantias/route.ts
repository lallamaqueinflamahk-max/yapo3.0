/**
 * GET /api/wallet/garantias — Garantías de pago (órdenes en custodia / escrow) del usuario.
 * Mock: lista para mostrar en Billetera; luego conectar a Escudo de Pago real.
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import type { EscrowOrder } from "@/features/escudo-pago";

const MOCK_GARANTIAS: EscrowOrder[] = [
  {
    id: "esc-001",
    clienteId: "safe-user",
    profesionalId: "prof-1",
    montoTotal: 350000,
    moneda: "PYG",
    estado: "en_custodia",
    hitos: [
      { porcentaje: 50, destinatario: "profesional" },
      { porcentaje: 50, destinatario: "profesional" },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "esc-002",
    clienteId: "user-2",
    profesionalId: "safe-user",
    montoTotal: 120000,
    moneda: "PYG",
    estado: "iniciado",
    hitos: [
      { porcentaje: 50, liberadoAt: new Date(Date.now() - 3600000).toISOString(), destinatario: "profesional" },
      { porcentaje: 50, destinatario: "profesional" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }
  const userId = access.userId;
  const list = MOCK_GARANTIAS.filter(
    (g) => g.clienteId === userId || g.profesionalId === userId
  );
  return NextResponse.json({ garantias: list });
}
