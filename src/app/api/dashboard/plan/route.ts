/**
 * GET /api/dashboard/plan – Plan de suscripción del usuario actual (slug, nombre, precio, límites).
 */
import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  if (userId === "dev-master" || userId === "safe-user") {
    return NextResponse.json({
      slug: "vale",
      name: "Valé",
      pricePyG: 35000,
      period: "month",
      maxOffers: 10,
      maxTransfers: 20,
      benefits: ["Feed", "Postulaciones", "Comunidad", "Mapa: trabajadores por rubro, densidad, mejor desempeño"],
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlanId: true },
    });
    const slug = user?.subscriptionPlanId ?? "vale";
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });
    if (!plan) {
    return NextResponse.json({
      slug: "vale",
      name: "Valé",
      pricePyG: 35000,
      period: "month",
      maxOffers: 10,
      maxTransfers: 20,
      benefits: ["Feed", "Postulaciones", "Comunidad", "Mapa: datos por rubro y desempeño"],
    });
  }
  const benefits: string[] = [];
    try {
      if (plan.benefits) Object.assign(benefits, JSON.parse(plan.benefits));
    } catch {
      benefits.push("Ver perfil para beneficios");
    }
    return NextResponse.json({
      slug: plan.slug,
      name: plan.name,
      pricePyG: plan.pricePyG,
      period: plan.period,
      maxOffers: plan.maxOffers ?? undefined,
      maxTransfers: plan.maxTransfers ?? undefined,
      benefits: Array.isArray(benefits) ? benefits : [String(plan.benefits)],
    });
  } catch {
    return NextResponse.json({
      slug: "vale",
      name: "Valé",
      pricePyG: 0,
      period: "month",
      maxOffers: 10,
      maxTransfers: 20,
      benefits: ["Feed", "Postulaciones", "Comunidad"],
    });
  }
}
