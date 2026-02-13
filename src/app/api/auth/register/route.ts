/**
 * POST /api/auth/register – Registro nuevo (email + password).
 * Crea User, Profile y Consent (privacy). No inicia sesión; el usuario debe hacer login.
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { recordConsent } from "@/lib/auth-next/consent";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim() || undefined;

  if (!email) {
    return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      provider: "credentials",
      role: "vale",
    },
  });

  await prisma.profile.create({
    data: { userId: user.id, profileStatus: "INCOMPLETO" },
  });

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;
  await recordConsent(user.id, { ip, userAgent });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    message: "Cuenta creada. Iniciá sesión con tu email y contraseña.",
  });
}
