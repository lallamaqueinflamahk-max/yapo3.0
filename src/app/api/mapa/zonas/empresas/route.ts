/**
 * GET /api/mapa/zonas/empresas?barrioId=xxx
 * PyMEs y Enterprises en la zona (para ver en el mapa: datos y lo que buscan).
 */
import { NextResponse } from "next/server";
import { getEmpresasPorBarrio } from "@/data/mapa-profesionales-empresas-mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId")?.trim() ?? "";
  if (!barrioId) {
    return NextResponse.json({ error: "Falta barrioId" }, { status: 400 });
  }
  const list = getEmpresasPorBarrio(barrioId);
  return NextResponse.json({ barrioId, empresas: list });
}
