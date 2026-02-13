/**
 * GET /api/mapa/zonas/profesionales?barrioId=xxx
 * Profesionales en la zona (para ver en el mapa y acceder a sus perfiles).
 */
import { NextResponse } from "next/server";
import { getProfesionalesPorBarrio } from "@/data/mapa-profesionales-empresas-mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId")?.trim() ?? "";
  if (!barrioId) {
    return NextResponse.json({ error: "Falta barrioId" }, { status: 400 });
  }
  const list = getProfesionalesPorBarrio(barrioId);
  return NextResponse.json({ barrioId, profesionales: list });
}
