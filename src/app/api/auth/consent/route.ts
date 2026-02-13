/**
 * POST /api/auth/consent – Registra aceptación del consentimiento obligatorio.
 * Sin consentimiento → no accede a la app.
 */

import { auth } from "@/lib/auth-next/config";
import { recordConsent } from "@/lib/auth-next/consent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { accepted?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (body.accepted !== true) {
    return NextResponse.json({ error: "Debe aceptar el consentimiento" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await recordConsent(session.user.id, { ip, userAgent });

  return NextResponse.json({ ok: true });
}
