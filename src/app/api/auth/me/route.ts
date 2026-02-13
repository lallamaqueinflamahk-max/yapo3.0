/**
 * GET /api/auth/me – Usuario actual con perfil completo para mostrar en pantalla de perfil.
 * Devuelve: user (name, image, email, role), profile (YAPÓ), verified, badges, rating, profession (mock donde no exista en DB).
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
  const isSafe = userId === "dev-master" || userId === "safe-user";

  if (isSafe) {
    const role = (session.user as { role?: string })?.role ?? "vale";
    return NextResponse.json({
      user: {
        id: userId,
        name: userId === "dev-master" ? "Dev Master" : "Usuario demo",
        email: "demo@yapo.local",
        image: null,
        role,
        whatsapp: process.env.YAPO_WHATSAPP_NUMBER || "595981555555",
        subscriptionPlanSlug: "vale",
        subscriptionPlanName: "Valé",
        subscriptionPlanPricePyG: 0,
      },
      profile: null,
      verified: true,
      badges: ["Demo"],
      rating: 4.5,
      profession: "Usuario de prueba",
      performance: "Destacado",
      historial: [],
      antecedentesRequeridos: false,
      antecedentesCompletados: true,
      ruc: null,
      contactoRRHH: null,
      telefono: null,
      planillaMinisterioSubida: false,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const profile = user.profile;
  const role = (session.user as { role?: string })?.role ?? user.role ?? "vale";

  let subscriptionPlanName = "Valé";
  let subscriptionPlanPricePyG = 0;
  const planSlug = user.subscriptionPlanId ?? "vale";
  try {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (plan) {
      subscriptionPlanName = plan.name;
      subscriptionPlanPricePyG = plan.pricePyG;
    }
  } catch {
    // ignore
  }

  const verified = profile?.profileStatus === "OK";
  const badges: string[] = [];
  if (role === "capeto") badges.push("Capeto");
  if (role === "kavaju") badges.push("Kavaju");
  if (role === "mbarete") badges.push("Mbareté");
  if (verified) badges.push("Verificado");
  if (profile?.certifications) badges.push("Certificado");

  const rating = 4.2;
  const profession = profile?.workType ?? "Por definir";
  const performance = profile?.workStatus ?? "Activo";

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email,
      image: user.image ?? undefined,
      role,
      whatsapp: user.whatsapp ?? undefined,
      subscriptionPlanSlug: planSlug,
      subscriptionPlanName,
      subscriptionPlanPricePyG,
    },
    profile: profile
      ? {
          country: profile.country,
          territory: profile.territory,
          workStatus: profile.workStatus,
          workType: profile.workType,
          education: profile.education,
          certifications: profile.certifications,
          profileStatus: profile.profileStatus,
        }
      : null,
    verified,
    badges,
    rating,
    profession,
    performance,
    historial: [], // TODO: últimas transacciones o trabajos
    antecedentesRequeridos: false,
    antecedentesCompletados: true,
    // PYME / Enterprise (mock; luego desde tabla Company o similar)
    ruc: null,
    contactoRRHH: null,
    telefono: null,
    planillaMinisterioSubida: false,
  });
}
