/**
 * Cliente para Incode Omni (verificación de identidad: documento + facial + liveness).
 * Uso: crear sesión desde backend, devolver customerToken al frontend para el SDK.
 * Documentación: https://developer.incode.com/docs/omni-platform-1
 */

import * as crypto from "crypto";
import type { KycSessionResponse } from "./types";

const INCODE_BASE_URL = process.env.INCODE_API_BASE_URL ?? "https://api.incode.com";
const INCODE_API_KEY = process.env.INCODE_API_KEY ?? "";
const INCODE_API_SECRET = process.env.INCODE_API_SECRET ?? "";

export function isIncodeConfigured(): boolean {
  return Boolean(INCODE_API_KEY && INCODE_API_SECRET);
}

/**
 * Crea una sesión de onboarding en Incode y obtiene un token para el cliente (SDK).
 * El frontend usará este token para inicializar el flujo sin exponer la API key.
 */
export async function createIncodeSession(customerId: string): Promise<KycSessionResponse | null> {
  if (!isIncodeConfigured()) {
    return null;
  }

  const authHeader = Buffer.from(`${INCODE_API_KEY}:${INCODE_API_SECRET}`).toString("base64");

  try {
    // 1) Crear sesión de onboarding (endpoint estándar Incode Omni)
    const createRes = await fetch(`${INCODE_BASE_URL}/omni/create/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Version": "1.0",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        customerId,
        // metadata opcional para asociar al usuario
        metadata: { source: "yapo", userId: customerId },
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("[KYC Incode] create session failed:", createRes.status, text);
      return null;
    }

    const sessionData = (await createRes.json()) as { sessionId?: string; token?: string; clientId?: string };
    const sessionId = sessionData.sessionId ?? sessionData.clientId ?? (sessionData as { id?: string }).id;
    if (!sessionId) {
      console.error("[KYC Incode] no sessionId in response:", sessionData);
      return null;
    }

    // 2) Obtener token para el cliente (algunos entornos devuelven token en el mismo create; si no, hay endpoint get token)
    let customerToken = sessionData.token;
    if (!customerToken) {
      const tokenRes = await fetch(`${INCODE_BASE_URL}/omni/get/customer/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Version": "1.0",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({ sessionId, customerId }),
      });
      if (tokenRes.ok) {
        const tokenData = (await tokenRes.json()) as { token?: string };
        customerToken = tokenData.token;
      }
    }

    if (!customerToken) {
      console.error("[KYC Incode] no customer token for session:", sessionId);
      return null;
    }

    return {
      sessionId: String(sessionId),
      customerToken: String(customerToken),
      flowUrl: process.env.INCODE_FLOW_URL
        ? `${process.env.INCODE_FLOW_URL}?sessionId=${sessionId}&token=${encodeURIComponent(customerToken)}`
        : undefined,
    };
  } catch (e) {
    console.error("[KYC Incode] createIncodeSession error:", e);
    return null;
  }
}

/**
 * Verifica la firma del webhook de Incode (si el proveedor envía header de firma).
 * Incode puede enviar X-Incode-Signature o similar; consultar documentación actual.
 */
export function verifyIncodeWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !INCODE_API_SECRET) return false;
  const expected = crypto.createHmac("sha256", INCODE_API_SECRET).update(rawBody).digest("hex");
  if (signature.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}
