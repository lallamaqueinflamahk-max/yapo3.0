/**
 * GET /api/contrato/escrow/[orderId]/qr-sena
 * Genera el payload para QR de pago de seña (50% del monto).
 * El cliente escanea y paga; los fondos quedan en Escrow.
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";

export async function GET(
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

  // En producción: cargar EscrowOrder por orderId, verificar que clienteId === access.userId,
  // calcular montoSeña = 50% de montoTotal, generar QR (link de pago o payload para wallet).
  const montoSeña = 175000; // Ejemplo: 50% de 350.000
  const qrPayload = `YAPO-SENA-${orderId}-${montoSeña}-PYG`;

  return NextResponse.json({
    orderId,
    montoSeña,
    moneda: "PYG",
    qrPayload,
    mensaje: "Escaneá el QR para pagar la seña (50%). Los fondos quedan en custodia YAPÓ.",
  });
}
