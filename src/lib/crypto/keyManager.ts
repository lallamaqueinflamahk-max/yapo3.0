/**
 * KeyManager: masterKey temporal en memoria.
 * Solo para simulación. NO producción.
 * No usa librerías externas.
 */

let masterKey: string | null = null;

const KEY_PREFIX = "sim-master-";
const KEY_LENGTH = 16;

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Devuelve la masterKey temporal. Si no existe, genera una nueva.
 */
export function getMasterKey(): string {
  if (masterKey === null) {
    masterKey = KEY_PREFIX + randomAlphanumeric(KEY_LENGTH);
  }
  return masterKey;
}

/**
 * Fija la masterKey (p. ej. para tests). En producción no usar.
 */
export function setMasterKey(key: string | null): void {
  masterKey = key;
}
