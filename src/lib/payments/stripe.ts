/**
 * Integración Stripe: Checkout Session y webhooks.
 * Requiere STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en .env.
 */

import Stripe from "stripe";
import type { CreateIntentParams, CreateIntentResult, WebhookResult } from "./types";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) return null;
  return new Stripe(key);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));
}

/**
 * Crea una sesión de Stripe Checkout (redirección al hosted page de Stripe).
 * amountCents: monto en centavos (USD) o unidad mínima; Stripe usa amount en centavos para USD.
 */
export async function createCheckoutSession(
  params: CreateIntentParams
): Promise<CreateIntentResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { provider: "stripe", error: "Stripe no configurado (STRIPE_SECRET_KEY)" };
  }

  const currency = params.currency.toLowerCase();
  const amount = params.amountCents; // Stripe espera cantidad en centavos para USD

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: "Recarga YAPÓ",
              description: params.metadata?.description ?? "Recarga de billetera",
              metadata: { userId: params.userId },
            },
          },
        },
      ],
      success_url: params.successUrl ?? `${process.env.NEXTAUTH_URL ?? ""}/wallet?payment=success`,
      cancel_url: params.cancelUrl ?? `${process.env.NEXTAUTH_URL ?? ""}/wallet?payment=cancelled`,
      client_reference_id: params.userId,
      metadata: {
        userId: params.userId,
        idempotencyKey: params.idempotencyKey ?? "",
        ...params.metadata,
      },
    });

    return {
      provider: "stripe",
      checkoutUrl: session.url ?? undefined,
      externalId: session.id,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear sesión Stripe";
    return { provider: "stripe", error: message };
  }
}

/**
 * Verifica la firma del webhook Stripe (STRIPE_WEBHOOK_SECRET).
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  try {
    const stripe = getStripe();
    if (!stripe) return null;
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    ) as Stripe.Event;
  } catch {
    return null;
  }
}

/**
 * Parsea evento Stripe y devuelve userId + amountCents si es un pago completado.
 */
export function parseStripePaymentEvent(event: Stripe.Event): WebhookResult | null {
  if (event.type !== "checkout.session.completed") return null;
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.client_reference_id ?? session.metadata?.userId ?? undefined;
  const amountTotal = session.amount_total;
  if (amountTotal == null || !userId) {
    return { processed: false, error: "Faltan amount_total o userId" };
  }
  return {
    processed: true,
    userId,
    amountCents: amountTotal,
    reason: `Stripe payment ${session.payment_status ?? "paid"}`,
  };
}
