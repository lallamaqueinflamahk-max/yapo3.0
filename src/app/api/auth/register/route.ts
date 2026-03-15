/**
 * POST /api/auth/register – Registro nuevo (email + password).
 * Crea User, Profile y Consent (privacy). No inicia sesión; el usuario debe hacer login.
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { recordConsent } from "@/lib/auth-next/consent";
import { validateBody, handleApiError, ApiError, registerBodySchema } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await validateBody(registerBodySchema, request);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new ApiError(409, "Ya existe una cuenta con ese email");
    }

    const passwordHash = await hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
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
  } catch (e) {
    return handleApiError(e);
  }
}
