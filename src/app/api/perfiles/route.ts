/**
 * GET /api/perfiles – Listado de perfiles YAPÓ (para feed y búsqueda).
 * Query: departamento, ciudad, barrio, tipificacion, especialidad, insurtech, minEstrellas.
 * Responde con estructura YapoPerfil[] (backend alimenta YAPÓ-METRIX).
 */
import { NextResponse } from "next/server";
import { searchPerfiles } from "@/lib/yapo-busqueda";
import type { YapoPerfil } from "@/types/yapo-perfil";

export interface PerfilesQuery {
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  tipificacion?: string;
  especialidad?: string;
  insurtech?: string;
  minEstrellas?: string;
  limit?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: PerfilesQuery = {
    departamento: searchParams.get("departamento") ?? undefined,
    ciudad: searchParams.get("ciudad") ?? undefined,
    barrio: searchParams.get("barrio") ?? undefined,
    tipificacion: searchParams.get("tipificacion") ?? undefined,
    especialidad: searchParams.get("especialidad") ?? undefined,
    insurtech: searchParams.get("insurtech") ?? undefined,
    minEstrellas: searchParams.get("minEstrellas") ?? undefined,
    limit: searchParams.get("limit") ?? "20",
  };

  const perfiles: YapoPerfil[] = await searchPerfiles(query);
  return NextResponse.json({ perfiles, total: perfiles.length });
}
