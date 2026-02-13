/**
 * GET /api/dashboard/ratings – Calificaciones empleado ↔ empleador (recibidas y enviadas).
 */
import { auth } from "@/lib/auth-next/config";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  if (userId === "dev-master" || userId === "safe-user") {
    return NextResponse.json({
      received: [{ score: 5, type: "employer_to_employee", comment: "Excelente", fromUserId: "seed" }],
      sent: [{ score: 5, type: "employee_to_employer", comment: "Muy buen trato", toUserId: "seed" }],
      avgReceived: 4.6,
    });
  }

  try {
    const [received, sent] = await Promise.all([
      prisma.rating.findMany({
        where: { toUserId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, fromUserId: true, score: true, type: true, comment: true, createdAt: true },
      }),
      prisma.rating.findMany({
        where: { fromUserId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, toUserId: true, score: true, type: true, comment: true, createdAt: true },
      }),
    ]);

    const avgReceived =
      received.length > 0
        ? Math.round((received.reduce((s, r) => s + r.score, 0) / received.length) * 10) / 10
        : 0;

    return NextResponse.json({
      received: received.map((r) => ({
        score: r.score,
        type: r.type,
        comment: r.comment,
        fromUserId: r.fromUserId,
        createdAt: r.createdAt,
      })),
      sent: sent.map((r) => ({
        score: r.score,
        type: r.type,
        comment: r.comment,
        toUserId: r.toUserId,
        createdAt: r.createdAt,
      })),
      avgReceived,
    });
  } catch {
    return NextResponse.json({
      received: [],
      sent: [],
      avgReceived: 0,
    });
  }
}
