/**
 * Integración de pagos YAPÓ: Stripe y Pagopar.
 * Flujo: create-intent → checkout → webhook → credit en wallet.
 */

export type {
  PaymentProvider,
  PaymentIntentStatus,
  CreateIntentParams,
  CreateIntentResult,
  WebhookResult,
} from "./types";

export {
  validateAmountCents,
  validateCurrency,
  validateUserId,
} from "./validate";

export {
  getWebhookEvent,
  recordWebhookEvent,
  type WebhookEventStatus,
} from "./idempotency";

export {
  isStripeConfigured,
  createCheckoutSession,
  verifyStripeWebhook,
  parseStripePaymentEvent,
} from "./stripe";

export {
  isPagoparConfigured,
  createPaymentIntent as createPagoparPaymentIntent,
  verifyPagoparWebhook,
  parsePagoparWebhook,
} from "./pagopar";
