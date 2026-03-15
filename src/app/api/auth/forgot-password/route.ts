/**
 * POST /api/auth/forgot-password – Solicitar recuperación de contraseña.
 * Crea VerificationToken; en producción enviar email con enlace.
 * Respuesta genérica para no revelar si el email existe.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { validateBody, handleApiError, forgotPasswordBodySchema } from "@/lib/api";
import {
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_REQUEST_MESSAGE,
} from "@/lib/auth-next/constants";

export async function POST(request: Request) {
  try {
    const { email } = await validateBody(forgotPasswordBodySchema, request);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: PASSWORD_RESET_REQUEST_MESSAGE });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // TODO: enviar email con link a /reset-password?token=...&email=...
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json({
      message: PASSWORD_RESET_REQUEST_MESSAGE,
      ...(isDev
        ? {
            _devLink: `/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
          }
        : {}),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
