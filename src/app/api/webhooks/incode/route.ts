/**
 * POST /api/webhooks/incode
 * Webhook de Incode cuando termina una sesión de verificación (onboarding complete).
 * Verifica firma si está configurada; actualiza User.verificationLevel y registra VerificationEvent.
 * No se almacenan imágenes ni datos biométricos crudos.
 */

import { NextResponse } from "next/server";
import { verifyIncodeWebhookSignature } from "@/lib/kyc/incode";
import { recordVerificationSuccess } from "@/lib/kyc/service";
import type { IncodeWebhookPayload } from "@/lib/kyc/types";

const INCODE_WEBHOOK_SIGNATURE_HEADER = "x-incode-signature";

export async function POST(request: Request) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const signature = request.headers.get(INCODE_WEBHOOK_SIGNATURE_HEADER);
  if (signature && !verifyIncodeWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload: IncodeWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as IncodeWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const status = payload.status ?? payload.result;
  const meta = payload.metadata as { userId?: string } | undefined;
  const customerId = payload.customerId ?? payload.customer_id ?? meta?.userId;
  const sessionId = payload.sessionId ?? payload.session_id ?? payload.id;

  if (!customerId) {
    return NextResponse.json({ received: true });
  }

  if (status === "OK" || status === "ok" || status === "APPROVED") {
    await recordVerificationSuccess(customerId, {
      step: "biometric",
      provider: "incode",
      providerId: sessionId ?? undefined,
      newLevel: "trusted",
    });
  }

  return NextResponse.json({ received: true });
}
