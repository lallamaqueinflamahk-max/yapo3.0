/**
 * POST /api/auth/reset-password – Restablecer contraseña con token de email.
 * Valida body con Zod; token de un solo uso y expiración.
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateBody, handleApiError } from "@/lib/api";
import { resetPasswordBodySchema } from "@/lib/api";

const BCRYPT_ROUNDS = 12;

export async function POST(request: Request) {
  try {
    const body = await validateBody(resetPasswordBodySchema, request);
    const { token, email, password } = body;

    const verification = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    });

    if (!verification || verification.expires < new Date()) {
      return NextResponse.json(
        { error: "El enlace expiró o no es válido. Solicitá uno nuevo." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada. Iniciá sesión.",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
