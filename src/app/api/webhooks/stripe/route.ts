/**
 * POST /api/webhooks/stripe
 * Webhook de Stripe: verifica firma, idempotencia y acredita wallet.
 * Configurar en Stripe Dashboard la URL y el signing secret (STRIPE_WEBHOOK_SECRET).
 */

import { NextResponse } from "next/server";
import { credit } from "@/lib/wallet-db/service";
import {
  verifyStripeWebhook,
  parseStripePaymentEvent,
  getWebhookEvent,
  recordWebhookEvent,
} from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? "";
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const event = verifyStripeWebhook(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const parsed = parseStripePaymentEvent(event);
  if (!parsed || !parsed.processed || !parsed.userId || parsed.amountCents == null) {
    return NextResponse.json({ received: true });
  }

  const externalId = event.id;
  const existing = await getWebhookEvent("stripe", externalId);
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const amountUnits = parsed.amountCents / 100;
    await credit(
      parsed.userId,
      amountUnits,
      parsed.reason ?? `Stripe payment ${externalId}`
    );
    await recordWebhookEvent("stripe", externalId, {
      userId: parsed.userId,
      amountCents: parsed.amountCents,
      status: "processed",
      currency: "USD",
    });
  } catch (e) {
    await recordWebhookEvent("stripe", externalId, {
      userId: parsed.userId,
      amountCents: parsed.amountCents,
      status: "failed",
    });
    const message = e instanceof Error ? e.message : "Error al acreditar";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
