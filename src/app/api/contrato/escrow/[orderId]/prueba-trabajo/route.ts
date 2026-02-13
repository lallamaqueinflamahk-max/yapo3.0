/**
 * POST /api/contrato/escrow/[orderId]/prueba-trabajo
 * El profesional sube prueba de trabajo (foto o video) al finalizar el servicio.
 * Body: { tipo: "foto" | "video", url: string }
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";

type Body = { tipo: "foto" | "video"; url: string };

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

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!body.tipo || !body.url) {
    return NextResponse.json(
      { error: "Faltan tipo (foto|video) o url" },
      { status: 400 }
    );
  }
  if (body.tipo !== "foto" && body.tipo !== "video") {
    return NextResponse.json({ error: "tipo debe ser foto o video" }, { status: 400 });
  }

  // En producción: verificar que access.userId es el profesional de la orden;
  // persistir la prueba (URL desde storage); actualizar estado de la orden a "prueba_subida".
  const subidoAt = new Date().toISOString();

  return NextResponse.json({
    ok: true,
    orderId,
    prueba: {
      tipo: body.tipo,
      url: body.url,
      subidoAt,
      subidoPor: access.userId,
    },
    mensaje: "Prueba de trabajo registrada. El cliente puede revisar y liberar el pago.",
  });
}
