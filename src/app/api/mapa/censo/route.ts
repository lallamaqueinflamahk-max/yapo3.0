/**
 * GET /api/mapa/censo?funcionalidad=id&rubro=opcional
 * Devuelve zonas con estado rojo/amarillo/verde según la funcionalidad de búsqueda (censo).
 * Respeta rol y plan del usuario: si no tiene acceso, 403.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import {
  FUNCIONALIDADES_BUSQUEDA,
  puedeUsarFuncionalidad,
  type RolId,
  type PlanSlug,
} from "@/data/mapa-funcionalidades-busqueda";
import { getZonasCensoMock } from "@/data/mapa-censo-mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const funcionalidadId = searchParams.get("funcionalidad")?.trim() ?? "";
  const rubro = searchParams.get("rubro")?.trim() || null;

  const func = FUNCIONALIDADES_BUSQUEDA.find((f) => f.id === funcionalidadId);
  if (!func) {
    return NextResponse.json(
      { error: "Funcionalidad no encontrada", funcionalidadId },
      { status: 400 }
    );
  }

  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "vale";
  let planSlug: PlanSlug | null = (session?.user as { subscriptionPlanSlug?: string })?.subscriptionPlanSlug ?? null;
  if (session?.user?.id && !planSlug) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionPlanId: true },
      });
      planSlug = (user?.subscriptionPlanId as PlanSlug) ?? "vale";
    } catch {
      planSlug = "vale";
    }
  }
  if (!planSlug) planSlug = "vale";

  if (!puedeUsarFuncionalidad(func, role, planSlug)) {
    return NextResponse.json(
      {
        error: "Sin acceso",
        message: `Esta búsqueda requiere plan ${func.planMinimo} o superior.`,
        funcionalidadId: func.id,
        planMinimo: func.planMinimo,
      },
      { status: 403 }
    );
  }

  if (func.filtraPorRubro && rubro) {
    // Validar rubro si aplica
  }

  try {
    const zonas = getZonasCensoMock(func.metricType, rubro);
    return NextResponse.json({
      funcionalidadId: func.id,
      metricType: func.metricType,
      label: func.label,
      rubro: rubro ?? null,
      verdeSignificado: func.verdeSignificado,
      amarilloSignificado: func.amarilloSignificado,
      rojoSignificado: func.rojoSignificado,
      zonas,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al cargar datos de censo", funcionalidadId },
      { status: 500 }
    );
  }
}
