/**
 * Tipos para la capa de criptografía.
 * Simulación de seguridad real: NO dinero real.
 */

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt?: string;
  tag?: string;
}

export interface KeyDerivationParams {
  salt: Uint8Array;
  iterations: number;
  hash: "SHA-256";
}

export interface TransactionPayload {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  createdAt: string;
}
