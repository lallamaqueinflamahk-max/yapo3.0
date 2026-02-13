/**
 * Capa de criptografía para el backend Node.
 * Equivalente a /lib/crypto: hash, KDF, cipher, firma.
 * Simulación de seguridad real — NO dinero real.
 */

import crypto from "node:crypto";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100_000;
const SECRET_PEPPER = process.env.WALLET_SECRET_PEPPER || "yapo-wallet-sim-secret";

function bufferToHex(buffer) {
  return Buffer.from(buffer).toString("hex");
}

function bufferToBase64(buffer) {
  return Buffer.from(buffer).toString("base64");
}

function base64ToBuffer(str) {
  return Buffer.from(str, "base64");
}

export function sha256(data) {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return bufferToHex(crypto.createHash("sha256").update(buf).digest());
}

export function generateSalt(length = SALT_LENGTH) {
  return crypto.randomBytes(length);
}

export function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");
}

export function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_LENGTH });
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: bufferToBase64(Buffer.concat([enc, tag])),
    iv: bufferToBase64(iv),
  };
}

export function decrypt(ciphertextB64, ivB64, key) {
  const raw = base64ToBuffer(ciphertextB64);
  const tag = raw.subarray(-TAG_LENGTH);
  const enc = raw.subarray(0, -TAG_LENGTH);
  const iv = base64ToBuffer(ivB64);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final("utf8");
}

export function canonicalTransaction(tx) {
  return [tx.id, tx.fromUserId, tx.toUserId, tx.amount, tx.currency, tx.createdAt].join("|");
}

export function signTransaction(tx) {
  const payload = canonicalTransaction(tx) + ":" + SECRET_PEPPER;
  return sha256(payload);
}

export function verifyTransaction(tx, signature) {
  const expected = signTransaction(tx);
  if (signature.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}
