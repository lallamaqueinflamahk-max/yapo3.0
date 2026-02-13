/**
 * Store in-memory de billeteras y transacciones.
 * Balance cifrado en reposo; transacciones firmadas.
 * NO dinero real — simulación.
 */

import * as cryptoNode from "./crypto-node.js";

const CURRENCY = "YAP";
const INITIAL_BALANCE = "1000.00";
const WALLET_PASSWORD = process.env.WALLET_STORE_PASSWORD || "yapo-wallet-store-sim";

const wallets = new Map();
const transactions = new Map();
const transactionIndexByUser = new Map();

function ensureWallet(userId) {
  let w = wallets.get(userId);
  if (!w) {
    const salt = cryptoNode.generateSalt();
    const key = cryptoNode.deriveKey(WALLET_PASSWORD, salt);
    const encrypted = cryptoNode.encrypt(INITIAL_BALANCE, key);
    w = {
      userId,
      encryptedBalance: encrypted.ciphertext,
      iv: encrypted.iv,
      salt: salt.toString("base64"),
      currency: CURRENCY,
      updatedAt: new Date().toISOString(),
    };
    wallets.set(userId, w);
    transactionIndexByUser.set(userId, []);
  }
  return w;
}

function getBalance(userId) {
  const w = ensureWallet(userId);
  const key = cryptoNode.deriveKey(WALLET_PASSWORD, Buffer.from(w.salt, "base64"));
  const balance = cryptoNode.decrypt(w.encryptedBalance, w.iv, key);
  return { balance, currency: w.currency, updatedAt: w.updatedAt };
}

function setBalance(userId, balanceStr) {
  const w = ensureWallet(userId);
  const salt = Buffer.from(w.salt, "base64");
  const key = cryptoNode.deriveKey(WALLET_PASSWORD, salt);
  const encrypted = cryptoNode.encrypt(balanceStr, key);
  w.encryptedBalance = encrypted.ciphertext;
  w.iv = encrypted.iv;
  w.updatedAt = new Date().toISOString();
  return w.updatedAt;
}

export function getWalletBalance(userId) {
  const { balance, currency, updatedAt } = getBalance(userId);
  return { userId, balance, currency, updatedAt };
}

export function getTransactions(userId, limit = 50) {
  const ids = transactionIndexByUser.get(userId) || [];
  const txs = ids
    .slice(-limit)
    .map((id) => transactions.get(id))
    .filter(Boolean)
    .reverse();
  return txs;
}

function addTransactionToIndex(userId, txId) {
  const list = transactionIndexByUser.get(userId) || [];
  list.push(txId);
  transactionIndexByUser.set(userId, list);
}

export function transfer(fromUserId, toUserId, amountStr) {
  const amount = parseFloat(amountStr);
  if (Number.isNaN(amount) || amount <= 0) {
    return { success: false, error: "Monto inválido" };
  }
  if (fromUserId === toUserId) {
    return { success: false, error: "No se puede transferir al mismo usuario" };
  }

  const fromBal = getBalance(fromUserId);
  const currentFrom = parseFloat(fromBal.balance);
  if (currentFrom < amount) {
    return { success: false, error: "Saldo insuficiente" };
  }

  const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const createdAt = new Date().toISOString();
  const tx = {
    id: txId,
    fromUserId,
    toUserId,
    amount: amount.toFixed(2),
    currency: CURRENCY,
    createdAt,
    status: "completed",
  };
  const signature = cryptoNode.signTransaction(tx);
  tx.signature = signature;

  if (!cryptoNode.verifyTransaction(tx, signature)) {
    return { success: false, error: "Error de firma" };
  }

  setBalance(fromUserId, (currentFrom - amount).toFixed(2));
  const toBal = getBalance(toUserId);
  const currentTo = parseFloat(toBal.balance);
  setBalance(toUserId, (currentTo + amount).toFixed(2));

  transactions.set(txId, tx);
  addTransactionToIndex(fromUserId, txId);
  addTransactionToIndex(toUserId, txId);

  return { success: true, transaction: tx };
}
