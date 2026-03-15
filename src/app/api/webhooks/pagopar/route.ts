/**
 * POST /api/webhooks/pagopar
 * Webhook de Pagopar: verifica (si hay secret), idempotencia y acredita wallet.
 * Configurar en Pagopar la URL de notificación y el secret si aplica.
 */

import { NextResponse } from "next/server";
import { credit } from "@/lib/wallet-db/service";
import {
  parsePagoparWebhook,
  getWebhookEvent,
  recordWebhookEvent,
  verifyPagoparWebhook,
} from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("x-pagopar-signature") ?? request.headers.get("x-signature") ?? "";
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const payloadStr = typeof body === "string" ? body : JSON.stringify(body);
  if (!verifyPagoparWebhook(payloadStr, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const parsed = parsePagoparWebhook(body);
  if (!parsed || !parsed.processed || !parsed.userId || parsed.amountCents == null) {
    return NextResponse.json({ received: true });
  }

  const externalId = (body as Record<string, unknown>)?.id ?? (body as Record<string, unknown>)?.payment_id ?? `pagopar-${Date.now()}`;
  const idStr = String(externalId);
  const existing = await getWebhookEvent("pagopar", idStr);
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const amountUnits = parsed.amountCents / 100;
    await credit(
      parsed.userId,
      amountUnits,
      parsed.reason ?? `Pagopar payment ${idStr}`
    );
    await recordWebhookEvent("pagopar", idStr, {
      userId: parsed.userId,
      amountCents: parsed.amountCents,
      status: "processed",
      currency: "PYG",
    });
  } catch (e) {
    await recordWebhookEvent("pagopar", idStr, {
      userId: parsed.userId,
      amountCents: parsed.amountCents,
      status: "failed",
    });
    const message = e instanceof Error ? e.message : "Error al acreditar";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
