/**
 * GET /api/wallet/shields – Escudos activos del usuario.
 * POST /api/wallet/shields – Asignar o revocar escudo (body: { action: "assign"|"revoke", shieldType }).
 * Valida: sesión, consentimiento, perfil OK.
 */

import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import { getUserShields, assignShield, revokeShield } from "@/lib/wallet-db/shields";
import { SHIELD_TYPES } from "@/lib/wallet-db/types";
import { SAFE_MODE_ENABLED } from "@/lib/auth/dev/safeMode";

export async function GET() {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }

  if (SAFE_MODE_ENABLED && access.safeMode) {
    return NextResponse.json({ shields: [], devOnly: true });
  }

  const shields = await getUserShields(access.userId);
  return NextResponse.json({ shields, devOnly: false });
}

export async function POST(request: Request) {
  const access = await validateWalletAccess();
  if (!access.allowed || !access.userId) {
    return NextResponse.json({ error: access.reason ?? "Acceso denegado" }, { status: 403 });
  }
  if (SAFE_MODE_ENABLED && access.safeMode) {
    return NextResponse.json({ ok: true, message: "Modo desarrollo: escudo no persistido", devOnly: true });
  }

  let body: { action?: string; shieldType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const action = (body.action ?? "").toLowerCase();
  const shieldType = typeof body.shieldType === "string" ? body.shieldType.trim().toUpperCase() : "";
  if (!["assign", "revoke"].includes(action)) {
    return NextResponse.json({ error: "action debe ser assign o revoke" }, { status: 400 });
  }
  if (!SHIELD_TYPES.includes(shieldType as "SALUD" | "FINTECH" | "COMUNIDAD" | "SUBSIDIO")) {
    return NextResponse.json({ error: "shieldType inválido. Usar: SALUD, FINTECH, COMUNIDAD, SUBSIDIO" }, { status: 400 });
  }

  try {
    if (action === "assign") {
      const result = await assignShield(access.userId, shieldType);
      return NextResponse.json({ ok: true, userShieldId: result.userShieldId });
    }
    await revokeShield(access.userId, shieldType);
    return NextResponse.json({ ok: true, message: "Escudo revocado" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al actualizar escudo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
