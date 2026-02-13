/**
 * Firma e integridad de transacciones (HMAC sobre payload canónico).
 * Simula firma real: cualquier alteración invalida la verificación.
 */

import { sha256 } from "./hash";
import type { TransactionPayload } from "./types";

export function canonicalTransaction(tx: TransactionPayload): string {
  return [
    tx.id,
    tx.fromUserId,
    tx.toUserId,
    tx.amount,
    tx.currency,
    tx.createdAt,
  ].join("|");
}

/**
 * Genera firma (hash) del payload canónico para integridad.
 */
export async function signTransaction(
  tx: TransactionPayload,
  secret: string
): Promise<string> {
  const payload = canonicalTransaction(tx);
  return sha256(payload + ":" + secret);
}

/**
 * Verifica que la firma coincida con el payload (integridad).
 */
export async function verifyTransaction(
  tx: TransactionPayload,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await signTransaction(tx, secret);
  return constantTimeCompare(signature, expected);
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
