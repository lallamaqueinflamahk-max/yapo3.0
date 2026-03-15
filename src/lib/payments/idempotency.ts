/**
 * Idempotencia de webhooks: no procesar dos veces el mismo evento.
 */

import { prisma } from "@/lib/db";

export type WebhookEventStatus = "processed" | "failed" | "skipped";

export async function getWebhookEvent(
  provider: string,
  externalId: string
): Promise<{ userId: string | null; amountCents: number; status: string } | null> {
  const row = await prisma.paymentWebhookEvent.findUnique({
    where: {
      provider_externalId: { provider, externalId },
    },
  });
  if (!row) return null;
  return {
    userId: row.userId,
    amountCents: row.amountCents,
    status: row.status,
  };
}

export async function recordWebhookEvent(
  provider: string,
  externalId: string,
  data: { userId?: string | null; amountCents?: number; status: WebhookEventStatus; currency?: string }
): Promise<void> {
  await prisma.paymentWebhookEvent.upsert({
    where: {
      provider_externalId: { provider, externalId },
    },
    create: {
      provider,
      externalId,
      userId: data.userId ?? null,
      amountCents: data.amountCents ?? 0,
      currency: data.currency ?? "PYG",
      status: data.status,
    },
    update: {
      status: data.status,
      ...(data.userId != null && { userId: data.userId }),
      ...(data.amountCents != null && { amountCents: data.amountCents }),
    },
  });
}
