/**
 * GET /api/mapa/funcionalidades
 * Lista de funcionalidades de búsqueda para el mapa: permitidas y bloqueadas según rol y plan.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { getFuncionalidadesParaRolPlan, type RolId, type PlanSlug } from "@/data/mapa-funcionalidades-busqueda";

export async function GET() {
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

  const { permitidas, bloqueadas } = getFuncionalidadesParaRolPlan(role as RolId, planSlug);
  return NextResponse.json({
    role,
    planSlug,
    permitidas,
    bloqueadas,
  });
}
