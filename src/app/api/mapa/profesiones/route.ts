/**
 * GET /api/mapa/profesiones?barrioId=xxx
 * Profesiones en la zona (barrio) con cantidad. Prisma si hay datos; fallback desde mock.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfesionalesPorBarrio } from "@/data/mapa-profesionales-empresas-mock";
import { OFICIOS_20 } from "@/data/mapa-funcionalidades-busqueda";

export interface ProfesionZona {
  label: string;
  count: number;
  icon: string;
}

const RUBRO_ICON: Record<string, string> = {
  "Empleada doméstica": "🧹",
  "Electricista": "⚡",
  "Plomería": "🔧",
  "Plomero": "🔧",
  "Carpintero": "🪚",
  "Pintor": "🎨",
  "Jardinería": "🌿",
  "Panadero": "🍞",
  "Cuidado personas": "❤️",
  "Delivery": "🛵",
  "Mecánico": "🚗",
  "Ventas": "📊",
  "Contador": "💼",
  "Limpieza": "🧹",
  "Albañil": "🧱",
  "Costurera": "🧵",
  "Albañilería": "🧱",
  "Refrigeración": "❄️",
  "Gasista": "🔥",
  "Niñera": "👶",
  "Lavado y planchado": "👕",
  "IT / Soporte": "💻",
};

/** Fallback: cuenta profesionales por oficio en el mock para el barrio. */
function getProfesionesDesdeMock(barrioId: string): ProfesionZona[] {
  const profesionales = getProfesionalesPorBarrio(barrioId);
  const countByLabel: Record<string, number> = {};
  for (const p of profesionales) {
    countByLabel[p.profession] = (countByLabel[p.profession] ?? 0) + 1;
  }
  return OFICIOS_20.map((label) => ({
    label,
    count: countByLabel[label] ?? 0,
    icon: RUBRO_ICON[label] ?? "👤",
  })).filter((p) => p.count > 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId")?.trim() ?? "";

  try {
    if (barrioId) {
      const barrio = await prisma.geografiaPy.findUnique({
        where: { slug: barrioId },
        include: { metricasSemaforo: true },
      });
      if (barrio && barrio.metricasSemaforo.length > 0) {
        const profesiones: ProfesionZona[] = barrio.metricasSemaforo.map((m) => ({
          label: m.rubro,
          count: m.densidadProf,
          icon: RUBRO_ICON[m.rubro] ?? "👤",
        }));
        return NextResponse.json({ barrioId, profesiones });
      }
    }

    const profesiones = barrioId ? getProfesionesDesdeMock(barrioId) : [];
    return NextResponse.json({
      barrioId: barrioId || null,
      profesiones: profesiones.length > 0 ? profesiones : getProfesionesDesdeMock("asuncion-botanic"),
    });
  } catch {
    const profesiones = barrioId ? getProfesionesDesdeMock(barrioId) : getProfesionesDesdeMock("asuncion-botanic");
    return NextResponse.json(
      { barrioId: barrioId || null, profesiones },
      { status: 200 }
    );
  }
}
