/**
 * GET /api/adaptive-ui/config – Configuración de la UI adaptativa por rol y tier.
 * Devuelve: user_id, role, tier, dashboard_config (quadrants, main_actions, search_placeholder, escudo_label, etc.).
 */
import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getDashboardConfig, planSlugToTier } from "@/lib/adaptive-ui";
import type { RoleId } from "@/lib/auth";
import { isValidRoleId } from "@/lib/auth/roles";

export async function GET() {
  const session = await auth();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/adaptive-ui/config/route.ts:GET',message:'API config entry',data:{hasSession:!!session,userId:session?.user?.id??null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const roleFromToken = (session.user as { role?: string }).role;
  const role: RoleId = isValidRoleId(roleFromToken) ? (roleFromToken as RoleId) : "vale";
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/adaptive-ui/config/route.ts:role',message:'role resolved',data:{userId,roleFromToken,role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  let planSlug: string | null = "vale";
  if (userId !== "dev-master" && userId !== "safe-user") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlanId: true },
      });
      planSlug = user?.subscriptionPlanId ?? "vale";
    } catch {
      planSlug = "vale";
    }
  }

  const tier = planSlugToTier(planSlug);
  const dashboard_config = getDashboardConfig(role, tier);

  return NextResponse.json({
    user_id: userId,
    role,
    tier,
    dashboard_config,
  });
}
