/**
 * Cliente API para la billetera interna YAPÓ.
 * Todas las llamadas van al backend REST (sin dinero real).
 */

import type {
  WalletBalance,
  Transaction,
  TransferRequest,
  TransferResult,
} from "./types";

/** URL relativa al origen (localhost, Vercel o ngrok) para mismo comportamiento. */
const DEFAULT_BASE_URL = "/api/wallet";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_WALLET_API_URL ?? DEFAULT_BASE_URL;
  }
  return process.env.WALLET_API_URL ?? process.env.NEXT_PUBLIC_WALLET_API_URL ?? DEFAULT_BASE_URL;
}

export async function fetchBalance(userId: string): Promise<WalletBalance | null> {
  const base = getBaseUrl();
  const url = `${base}/balance/${encodeURIComponent(userId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(await res.text().catch(() => res.statusText));
  }
  return res.json() as Promise<WalletBalance>;
}

export async function fetchTransactions(
  userId: string,
  limit = 50
): Promise<Transaction[]> {
  const base = getBaseUrl();
  const url = `${base}/transactions/${encodeURIComponent(userId)}?limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const data = (await res.json()) as { transactions: Transaction[] };
  return data.transactions ?? [];
}

export async function transfer(
  request: TransferRequest
): Promise<TransferResult> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data = (await res.json().catch(() => ({}))) as TransferResult & { error?: string };
  if (!res.ok) {
    return {
      success: false,
      error: data.error ?? res.statusText ?? "Error en la transferencia",
    };
  }
  return {
    success: data.success,
    transaction: data.transaction,
    error: data.error,
  };
}
