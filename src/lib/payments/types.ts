/**
 * Tipos para integración de pagos (Stripe, Pagopar).
 * Flujo: crear intención → checkout → webhook → acreditar wallet.
 */

export type PaymentProvider = "stripe" | "pagopar";

export type PaymentIntentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface CreateIntentParams {
  amountCents: number;
  currency: string;
  userId: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  /** URL de retorno tras éxito/cancelación (Stripe Checkout). */
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateIntentResult {
  provider: PaymentProvider;
  /** Stripe: clientSecret para PaymentElement; Checkout: sessionId para redirect. */
  clientSecret?: string;
  /** URL para redirigir al usuario (Pagopar, o Stripe Checkout). */
  checkoutUrl?: string;
  /** Id externo (ej. Stripe session id) para seguir estado. */
  externalId?: string;
  error?: string;
}

export interface WebhookResult {
  processed: boolean;
  userId?: string;
  amountCents?: number;
  reason?: string;
  error?: string;
}
