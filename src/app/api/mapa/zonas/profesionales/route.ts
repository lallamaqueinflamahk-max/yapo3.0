/**
 * GET /api/mapa/zonas/profesionales?barrioId=xxx
 * Profesionales en la zona: Prisma (ProfesionalGeo + User) cuando hay datos; fallback a mock.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfesionalesPorBarrio } from "@/data/mapa-profesionales-empresas-mock";
import type { ProfesionalEnZona } from "@/data/mapa-profesionales-empresas-mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId")?.trim() ?? "";
  if (!barrioId) {
    return NextResponse.json({ error: "Falta barrioId" }, { status: 400 });
  }

  try {
    const barrio = await prisma.geografiaPy.findUnique({
      where: { slug: barrioId },
    });
    if (barrio) {
      const profs = await prisma.profesionalGeo.findMany({
        where: { idBarrio: barrio.idBarrio },
        include: { barrio: true },
      });
      if (profs.length > 0) {
        const userIds = profs.map((p) => p.userId).filter(Boolean) as string[];
        const users =
          userIds.length > 0
            ? await prisma.user.findMany({ where: { id: { in: userIds } } })
            : [];
        const userMap = new Map(users.map((u) => [u.id, u]));
        const list: ProfesionalEnZona[] = profs.map((p) => {
          const u = p.userId ? userMap.get(p.userId) : null;
          const calidad = p.calidad >= 1 && p.calidad <= 5 ? p.calidad : 0;
          return {
            userId: p.userId ?? p.idProfesional,
            name: u?.name ?? p.nombre,
            profession: p.rubro,
            rating: calidad,
            image: u?.image ?? null,
            role: (u?.role as string) ?? "Valé",
            verified: p.selloMbarette,
            barrioId: barrio.slug ?? barrioId,
            documentVerified: p.selloMbarette,
            badges: p.selloMbarette ? ["Certificado"] : [],
            workHistory: undefined,
            matriculado: undefined,
            whatsapp: u?.whatsapp ?? undefined,
          };
        });
        return NextResponse.json({ barrioId, profesionales: list });
      }
    }
  } catch {
    // fallback a mock
  }

  const list = getProfesionalesPorBarrio(barrioId);
  return NextResponse.json({ barrioId, profesionales: list });
}
