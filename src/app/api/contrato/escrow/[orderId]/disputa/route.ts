/**
 * POST /api/contrato/escrow/[orderId]/disputa
 * Si no hay acuerdo entre cliente y profesional, se abre disputa y se activa
 * un ticket para el Mbareté líder de la zona para mediación.
 * Body: { motivo: string }
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

  let body: { motivo?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const motivo = (body.motivo ?? "Disputa por incumplimiento o desacuerdo").trim();

  // En producción: cargar orden; asignar Mbareté líder por zona (barrio/ciudad);
  // crear TicketMediacion; poner orden en estado "disputa".
  const ticketId = `TKT-${orderId}-${Date.now().toString(36).toUpperCase()}`;
  const mbareteLiderId = "mbarete-lider-zona-central"; // desde BD por zona

  return NextResponse.json({
    ok: true,
    orderId,
    ticketId,
    estado: "disputa",
    mbareteLiderId,
    motivo,
    mensaje: "Se abrió un ticket de mediación. El líder Mbareté de la zona se pondrá en contacto.",
  });
}
