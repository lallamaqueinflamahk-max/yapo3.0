/**
 * PATCH /api/auth/profile – Actualizar perfil del usuario actual.
 * Campos mínimos: country, territory, workStatus, workType.
 * Al completar todos → profileStatus = OK.
 */

import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const REQUIRED_FIELDS = ["country", "territory", "workStatus", "workType"] as const;

function isComplete(body: Record<string, unknown>): boolean {
  return REQUIRED_FIELDS.every(
    (f) => body[f] != null && String(body[f]).trim() !== ""
  );
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  if (userId === "dev-master" || userId === "safe-user") {
    return NextResponse.json({ ok: true, profileStatus: "OK" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const data: {
    country?: string;
    territory?: string;
    workStatus?: string;
    workType?: string;
    education?: string;
    certifications?: string;
    profileStatus?: string;
  } = {};

  if (body.country !== undefined) data.country = String(body.country).trim() || null;
  if (body.territory !== undefined) data.territory = String(body.territory).trim() || null;
  if (body.workStatus !== undefined) data.workStatus = String(body.workStatus).trim() || null;
  if (body.workType !== undefined) data.workType = String(body.workType).trim() || null;
  if (body.education !== undefined) data.education = String(body.education).trim() || null;
  if (body.certifications !== undefined) data.certifications = String(body.certifications).trim() || null;

  const merged = {
    country: data.country ?? undefined,
    territory: data.territory ?? undefined,
    workStatus: data.workStatus ?? undefined,
    workType: data.workType ?? undefined,
    education: data.education ?? undefined,
    certifications: data.certifications ?? undefined,
  };
  if (isComplete(merged as Record<string, unknown>)) {
    data.profileStatus = "OK";
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      country: data.country ?? null,
      territory: data.territory ?? null,
      workStatus: data.workStatus ?? null,
      workType: data.workType ?? null,
      education: data.education ?? null,
      certifications: data.certifications ?? null,
      profileStatus: data.profileStatus ?? "INCOMPLETO",
    },
    update: data,
  });

  return NextResponse.json({
    ok: true,
    profileStatus: profile.profileStatus,
    profile: {
      country: profile.country,
      territory: profile.territory,
      workStatus: profile.workStatus,
      workType: profile.workType,
      education: profile.education,
      certifications: profile.certifications,
    },
  });
}
