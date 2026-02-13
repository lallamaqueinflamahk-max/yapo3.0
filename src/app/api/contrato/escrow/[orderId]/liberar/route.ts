/**
 * POST /api/contrato/escrow/[orderId]/liberar
 * El cliente libera el pago tras verificar la prueba de trabajo.
 * Los fondos en custodia se transfieren al profesional (según hitos).
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
  }

  // En producción: cargar EscrowOrder; verificar que clienteId === access.userId;
  // verificar que hay prueba de trabajo; aplicar retención 24h si aplica; liberar fondos al profesional.
  return NextResponse.json({
    ok: true,
    orderId,
    estado: "liberado",
    mensaje: "Pago liberado. El profesional recibirá el saldo en su billetera.",
  });
}
