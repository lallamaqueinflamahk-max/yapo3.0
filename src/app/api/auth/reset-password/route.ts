/**
 * POST /api/auth/reset-password – Restablecer contraseña con token de email.
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  let body: { token?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!token || !email) {
    return NextResponse.json({ error: "Token y email son obligatorios" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 }
    );
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!verification || verification.expires < new Date()) {
    return NextResponse.json({ error: "El enlace expiró o no es válido. Solicitá uno nuevo." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return NextResponse.json({ ok: true, message: "Contraseña actualizada. Iniciá sesión." });
}
