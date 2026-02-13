/**
 * GET /api/auth/profile-status – Estado del perfil del usuario actual.
 * Devuelve profileStatus (INCOMPLETO | OK) y perfil para UI.
 */

import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ profileStatus: null }, { status: 401 });
  }

  const userId = session.user.id;
  if (userId === "dev-master" || userId === "safe-user") {
    return NextResponse.json({ profileStatus: "OK" });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const profileStatus = profile?.profileStatus ?? "INCOMPLETO";
  return NextResponse.json({
    profileStatus,
    profile: profile
      ? {
          country: profile.country,
          territory: profile.territory,
          workStatus: profile.workStatus,
          workType: profile.workType,
          education: profile.education,
          certifications: profile.certifications,
        }
      : null,
  });
}
