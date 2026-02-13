/**
 * Derivación de clave (PBKDF2) a partir de secreto + salt.
 * Usado para derivar clave de cifrado del balance y operaciones sensibles.
 */

import type { KeyDerivationParams } from "./types";

const encoder = new TextEncoder();

const DEFAULT_ITERATIONS = 100_000;
const KEY_LENGTH = 256;

export async function deriveKey(
  password: string,
  salt: Uint8Array,
  params?: Partial<KeyDerivationParams>
): Promise<CryptoKey> {
  const crypto = getCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: params?.iterations ?? DEFAULT_ITERATIONS,
      hash: params?.hash ?? "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export function generateSalt(length = 16): Uint8Array {
  const crypto = getCrypto();
  return crypto.getRandomValues(new Uint8Array(length));
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API no disponible");
}
