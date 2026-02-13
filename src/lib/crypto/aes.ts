/**
 * AES-256 simulado (NO producción).
 * Cifrado simulado con base64 + salt. Sin librerías externas.
 * Separado del wallet: solo operaciones criptográficas.
 */

import { getMasterKey } from "./keyManager";

const SALT_LENGTH = 8;
const DELIMITER = "|";

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function base64Encode(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "utf8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(s)));
}

function base64Decode(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(s)));
}

/**
 * Cifra un balance (simulado: base64 + salt).
 * No usa la key en el algoritmo; solo para API consistente con AES-256.
 */
export function encryptBalance(balance: number): string {
  const key = getMasterKey();
  const salt = randomAlphanumeric(SALT_LENGTH);
  const payload = salt + DELIMITER + String(balance);
  const encoded = base64Encode(payload);
  return encoded;
}

/**
 * Descifra un balance cifrado con encryptBalance.
 */
export function decryptBalance(encrypted: string): number {
  getMasterKey();
  const decoded = base64Decode(encrypted);
  const idx = decoded.indexOf(DELIMITER);
  if (idx === -1) {
    throw new Error("decryptBalance: payload inválido");
  }
  const value = decoded.slice(idx + 1);
  const n = parseFloat(value);
  if (Number.isNaN(n)) {
    throw new Error("decryptBalance: valor no numérico");
  }
  return n;
}
