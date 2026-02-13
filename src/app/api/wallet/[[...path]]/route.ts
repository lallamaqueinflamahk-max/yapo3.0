/**
 * /api/wallet (path vacío) → balance y datos del usuario (wallet-db + SAFE MODE).
 * /api/wallet/* → proxy al backend WALLET_API_URL.
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import { getWallet, getOrCreateWallet } from "@/lib/wallet-db/service";
import { getUserShields } from "@/lib/wallet-db/shields";
import { createWallet as createWalletMemory } from "@/lib/wallet/ledger";
import { getBalance } from "@/lib/wallet/service";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";

function getWalletApiUrl(): string {
  const url =
    process.env.WALLET_API_URL ||
    process.env.NEXT_PUBLIC_WALLET_API_URL ||
    "http://localhost:3002";
  return url.replace(/\/$/, "");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await context.params;
  if (path.length === 0) {
    const access = await validateWalletAccess();
    if (!access.allowed || !access.userId) {
      return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
    }
    if (SAFE_MODE_ENABLED && access.safeMode) {
      const userId = access.userId;
      createWalletMemory(userId);
      const balanceObj = getBalance(userId);
      const balance = balanceObj
        ? balanceObj.balanceDisponible + balanceObj.balanceProtegido
        : 0;
      return NextResponse.json({
        wallet: {
          id: `dev-${userId}`,
          userId,
          balance,
          status: "ACTIVE",
          devOnly: true,
        },
        shields: [],
        devOnly: true,
      });
    }
    const wallet = await getWallet(access.userId) ?? await getOrCreateWallet(access.userId);
    const shields = await getUserShields(access.userId);
    return NextResponse.json({
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        status: wallet.status,
        createdAt: wallet.createdAt,
        devOnly: false,
      },
      shields,
      devOnly: false,
    });
  }
  const pathStr = path.join("/");
  const base = getWalletApiUrl();
  const url = `${base}/${pathStr}`;
  const reqUrl = new URL(request.url);
  const qs = reqUrl.searchParams.toString();
  const fullUrl = qs ? `${url}?${qs}` : url;
  try {
    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "application/json";
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Wallet API no disponible";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await context.params;
  const pathStr = path.length ? path.join("/") : "";
  const base = getWalletApiUrl();
  const url = pathStr ? `${base}/${pathStr}` : base;
  let body: string;
  try {
    body = await request.text();
  } catch {
    body = "{}";
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body || undefined,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Wallet API no disponible";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
