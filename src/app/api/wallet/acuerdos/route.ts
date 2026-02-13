/**
 * GET /api/wallet/acuerdos — Acuerdos de trabajo del usuario (cliente o profesional).
 * Mock: lista de acuerdos para mostrar en Billetera; luego conectar a DB.
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import type { Acuerdo } from "@/features/contrato";

const MOCK_ACUERDOS: Acuerdo[] = [
  {
    id: "YAPO-ORD-2025-001",
    clienteId: "safe-user",
    profesionalId: "prof-1",
    descripcion: "Instalación eléctrica residencial",
    montoTotal: 350000,
    moneda: "PYG",
    fechaHoraAcordada: new Date(Date.now() + 86400000 * 2).toISOString(),
    direccion: "Asunción, Barrio Botánico",
    conEscudoPago: true,
    estado: "aceptado",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    escrowOrderId: "esc-001",
  },
  {
    id: "YAPO-ORD-2025-002",
    clienteId: "user-2",
    profesionalId: "safe-user",
    descripcion: "Limpieza profunda semanal",
    montoTotal: 180000,
    moneda: "PYG",
    fechaHoraAcordada: new Date(Date.now() + 86400000 * 5).toISOString(),
    conEscudoPago: false,
    estado: "en_curso",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }
  const userId = access.userId;
  const list = MOCK_ACUERDOS.filter(
    (a) => a.clienteId === userId || a.profesionalId === userId
  );
  return NextResponse.json({ acuerdos: list });
}
