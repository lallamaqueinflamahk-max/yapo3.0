/**
 * POST /api/auth/forgot-password – Solicitar recuperación de contraseña.
 * Crea VerificationToken y (en producción) envía email. Por ahora devuelve el token para pruebas.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: "Si el email existe, recibirás un enlace para restablecer la contraseña." });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  // TODO: enviar email con link a /reset-password?token=...&email=...
  // Por ahora en desarrollo devolvemos el token para pruebas (no hacer en producción).
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json({
    message: "Si el email existe, recibirás un enlace para restablecer la contraseña.",
    ...(isDev ? { _devToken: token, _devLink: `/reset-password?token=${token}&email=${encodeURIComponent(email)}` } : {}),
  });
}
