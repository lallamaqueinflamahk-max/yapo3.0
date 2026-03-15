/**
 * POST /api/kyc/session – Crea sesión KYC (Incode). Requiere auth y consentimiento biometría.
 */

import { auth } from "@/lib/auth-next/config";
import { hasBiometriaConsent, recordBiometriaConsent } from "@/lib/auth-next/consent";
import { createIncodeSession, isIncodeConfigured } from "@/lib/kyc";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  if (userId === "safe-user" || userId === "dev-master") {
    return NextResponse.json(
      { error: "Modo demo: KYC no disponible" },
      { status: 400 }
    );
  }

  if (!isIncodeConfigured()) {
    return NextResponse.json(
      { error: "Verificación temporalmente no disponible" },
      { status: 503 }
    );
  }

  let body: { consentAccepted?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // empty body ok
  }

  const hasConsent = await hasBiometriaConsent(userId);
  if (!hasConsent && body.consentAccepted !== true) {
    return NextResponse.json(
      { error: "Consentimiento requerido", code: "CONSENT_REQUIRED" },
      { status: 400 }
    );
  }

  if (!hasConsent && body.consentAccepted === true) {
    const ip = request.headers.get("x-forwarded-for") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;
    await recordBiometriaConsent(userId, { ip, userAgent });
  }

  const result = await createIncodeSession(userId);
  if (!result) {
    return NextResponse.json(
      { error: "No se pudo crear la sesión" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sessionId: result.sessionId,
    customerToken: result.customerToken,
    flowUrl: result.flowUrl ?? undefined,
  });
}
