/**
 * Auth.js (NextAuth v5) – rutas de autenticación.
 * GET/POST /api/auth/* (signin, signout, callback, session, etc.)
 * Devuelve siempre JSON en errores para evitar ClientFetchError (HTML inesperado).
 */

import type { NextRequest } from "next/server";

function jsonResponse(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function safeGet(req: Request) {
  try {
    const { handlers } = await import("@/lib/auth-next/config");
    const res = await handlers.GET(req as NextRequest);
    if (res.status >= 400 && res.headers.get("Content-Type")?.includes("text/html")) {
      return jsonResponse({ error: "Auth request failed" }, res.status);
    }
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Auth error";
    return jsonResponse({ error: message }, 500);
  }
}

async function safePost(req: Request) {
  try {
    const { handlers } = await import("@/lib/auth-next/config");
    const res = await handlers.POST(req as NextRequest);
    if (res.status >= 400 && res.headers.get("Content-Type")?.includes("text/html")) {
      return jsonResponse({ error: "Auth request failed" }, res.status);
    }
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Auth error";
    return jsonResponse({ error: message }, 500);
  }
}

export const GET = safeGet;
export const POST = safePost;
