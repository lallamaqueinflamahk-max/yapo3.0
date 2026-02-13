/**
 * Hash criptográfico para integridad (SHA-256).
 * Usado para firma de transacciones y verificación.
 */

const encoder = new TextEncoder();

export async function sha256(data: string | Uint8Array): Promise<string> {
  const crypto = getCrypto();
  const bytes = typeof data === "string" ? encoder.encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bufferToHex(digest);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API no disponible");
}
