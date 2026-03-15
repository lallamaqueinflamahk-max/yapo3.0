/**
 * POST /api/payments/create-intent
 * Crea una intención de pago (Stripe Checkout o Pagopar) y devuelve URL o clientSecret.
 * Requiere sesión; valida monto y moneda.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next/config";
import {
  validateAmountCents,
  validateCurrency,
  createCheckoutSession,
  createPagoparPaymentIntent,
  isStripeConfigured,
  isPagoparConfigured,
} from "@/lib/payments";
import type { PaymentProvider } from "@/lib/payments";

const bodySchema = {
  amountCents: (v: unknown) => (typeof v === "number" ? v : Number(v)),
  currency: (v: unknown) => (typeof v === "string" ? v : "PYG"),
  provider: (v: unknown) => (v === "stripe" || v === "pagopar" ? v : "pagopar") as PaymentProvider,
  idempotencyKey: (v: unknown) => (typeof v === "string" ? v : undefined),
  successUrl: (v: unknown) => (typeof v === "string" ? v : undefined),
  cancelUrl: (v: unknown) => (typeof v === "string" ? v : undefined),
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Debés iniciar sesión para cargar saldo." }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    const amountCents = bodySchema.amountCents(body.amountCents);
    const currency = bodySchema.currency(body.currency);
    const provider = bodySchema.provider(body.provider);

    const amountCheck = validateAmountCents(amountCents);
    if (!amountCheck.valid) {
      return NextResponse.json({ error: amountCheck.error }, { status: 400 });
    }
    const currencyCheck = validateCurrency(currency);
    if (!currencyCheck.valid) {
      return NextResponse.json({ error: currencyCheck.error }, { status: 400 });
    }

    if (provider === "stripe" && !isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe no está configurado." }, { status: 503 });
    }
    if (provider === "pagopar" && !isPagoparConfigured()) {
      return NextResponse.json({ error: "Pagopar no está configurado." }, { status: 503 });
    }

    const params = {
      amountCents: Math.round(amountCents),
      currency,
      userId,
      idempotencyKey: bodySchema.idempotencyKey(body.idempotencyKey),
      successUrl: bodySchema.successUrl(body.successUrl),
      cancelUrl: bodySchema.cancelUrl(body.cancelUrl),
    };

    const result =
      provider === "stripe"
        ? await createCheckoutSession(params)
        : await createPagoparPaymentIntent(params);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, code: "PAYMENT_CREATE_FAILED" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      provider: result.provider,
      checkoutUrl: result.checkoutUrl,
      clientSecret: result.clientSecret,
      externalId: result.externalId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear pago";
    return NextResponse.json(
      { error: message, code: "PAYMENT_ERROR" },
      { status: 500 }
    );
  }
}
