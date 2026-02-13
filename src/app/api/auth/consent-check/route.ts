/**
 * GET /api/auth/consent-check – Indica si el usuario tiene el consentimiento vigente.
 * 200 + { required: false } = puede acceder.
 * 200 + { required: true } = debe ir a /consent.
 */

import { auth } from "@/lib/auth-next/config";
import { hasRequiredConsent } from "@/lib/auth-next/consent";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ required: false }); // no logueado → no bloqueamos (irá a login)
  }

  const hasConsent = await hasRequiredConsent(session.user.id);
  return NextResponse.json({ required: !hasConsent });
}
