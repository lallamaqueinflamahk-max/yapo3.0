/**
 * GET /api/dashboard/semaphores – Semáforos territoriales (desde Prisma o mock).
 */
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const list = await prisma.semaphore.findMany({ orderBy: { zone: "asc" } });
    const zones = list.map((s) => ({ zone: s.zone, state: s.state as "green" | "yellow" | "red" }));
    return NextResponse.json(zones);
  } catch {
    return NextResponse.json(
      [
        { zone: "Central", state: "green" },
        { zone: "Alto Paraná", state: "green" },
        { zone: "Itapúa", state: "yellow" },
        { zone: "Boquerón", state: "red" },
      ],
      { status: 200 }
    );
  }
}
