/**
 * Integración Pagopar (Paraguay): creación de pago y webhook.
 * Documentación: https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos
 * Requiere PAGOPAR_API_KEY (y opcionalmente PAGOPAR_WEBHOOK_SECRET) en .env.
 */

import type { CreateIntentParams, CreateIntentResult, WebhookResult } from "./types";

function getApiKey(): string | null {
  const key = process.env.PAGOPAR_API_KEY;
  return key?.trim() || null;
}

export function isPagoparConfigured(): boolean {
  return Boolean(getApiKey());
}

/**
 * Crea un link o intención de pago en Pagopar.
 * Por ahora devuelve URL de documentación; implementar según API real de Pagopar cuando se tengan credenciales.
 */
export async function createPaymentIntent(
  params: CreateIntentParams
): Promise<CreateIntentResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { provider: "pagopar", error: "Pagopar no configurado (PAGOPAR_API_KEY)" };
  }

  // TODO: Llamar a la API de Pagopar para crear transacción.
  // Ejemplo típico: POST a endpoint de Pagopar con token, monto, moneda, concepto, url_retorno.
  // La respuesta suele incluir URL de pago o ID de transacción para redirigir al usuario.
  try {
    const baseUrl = process.env.PAGOPAR_API_URL ?? "https://api.pagopar.com";
    const response = await fetch(`${baseUrl}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: params.amountCents / 100, // Pagopar puede usar unidades (PYG o USD)
        currency: params.currency,
        reference: params.userId,
        idempotency_key: params.idempotencyKey,
        metadata: params.metadata,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { provider: "pagopar", error: text || `HTTP ${response.status}` };
    }

    const data = (await response.json()) as { checkout_url?: string; payment_id?: string; id?: string };
    return {
      provider: "pagopar",
      checkoutUrl: data.checkout_url ?? data.payment_id,
      externalId: data.payment_id ?? data.id ?? undefined,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear pago Pagopar";
    return { provider: "pagopar", error: message };
  }
}

/**
 * Verifica la firma del webhook Pagopar (si el proveedor la envía).
 */
export function verifyPagoparWebhook(
  payload: string | Buffer,
  signature: string
): boolean {
  const secret = process.env.PAGOPAR_WEBHOOK_SECRET;
  if (!secret) return true; // Sin secret no podemos verificar; en producción configurar.
  // TODO: Implementar según documentación Pagopar (ej. HMAC en header).
  return true;
}

/**
 * Parsea el body del webhook Pagopar y devuelve userId + amountCents.
 * Ajustar según el formato real que envíe Pagopar.
 */
export function parsePagoparWebhook(body: unknown): WebhookResult | null {
  if (body == null || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const status = o.status ?? o.estado;
  if (status !== "completed" && status !== "approved" && status !== "paid" && status !== "completado") {
    return null;
  }
  const userId = (o.reference ?? o.user_id ?? o.metadata?.userId) as string | undefined;
  const amount = Number(o.amount ?? o.monto ?? o.amountCents);
  if (!userId || Number.isNaN(amount) || amount <= 0) {
    return { processed: false, error: "Faltan reference/userId o monto válido" };
  }
  const amountCents = Math.round(amount * 100); // Si Pagopar envía en unidades, convertir a centavos
  return {
    processed: true,
    userId,
    amountCents,
    reason: "Pago Pagopar confirmado",
  };
}
