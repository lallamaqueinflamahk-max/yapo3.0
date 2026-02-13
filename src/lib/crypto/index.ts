/**
 * Capa de criptografía YAPÓ.
 * Separación clara: hash, kdf, cipher, sign.
 * AES simulado (base64 + salt) para balance. NO producción.
 */

export type { EncryptedPayload, KeyDerivationParams, TransactionPayload } from "./types";
export { sha256 } from "./hash";
export { deriveKey, generateSalt } from "./kdf";
export { encrypt, decrypt } from "./cipher";
export {
  canonicalTransaction,
  signTransaction,
  verifyTransaction,
} from "./sign";

export { getMasterKey, setMasterKey } from "./keyManager";
export { encryptBalance, decryptBalance } from "./aes";
