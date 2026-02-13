/**
 * Cifrado simétrico (AES-GCM) para datos sensibles.
 * Balance y payloads sensibles cifrados en reposo.
 */

import type { EncryptedPayload } from "./types";
import { generateSalt } from "./kdf";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

export async function encrypt(
  plaintext: string,
  key: CryptoKey,
  iv?: Uint8Array
): Promise<EncryptedPayload> {
  const crypto = getCrypto();
  const nonce = iv ?? crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
      tagLength: TAG_LENGTH,
    },
    key,
    encoder.encode(plaintext)
  );
  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(nonce),
  };
}

export async function decrypt(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const crypto = getCrypto();
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBuffer(payload.iv),
      tagLength: TAG_LENGTH,
    },
    key,
    base64ToBuffer(payload.ciphertext)
  );
  return decoder.decode(decrypted);
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API no disponible");
}

export { generateSalt };
