/**
 * Motor de búsqueda por zonificación y necesidad (Prompt 2).
 * Prioriza: misma zona (departamento/ciudad/barrio), Escudo Insurtech activo,
 * profesionales con trabajos recientes (story en última semana), alta calificación.
 * Excluye baja calificación o reportes de incumplimiento.
 */

import { YAPO_PERFILES_MOCK } from "@/data/yapo-perfiles-mock";
import type { YapoPerfil } from "@/types/yapo-perfil";

export interface BusquedaPerfilesParams {
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  tipificacion?: string;
  especialidad?: string;
  insurtech?: string; // "true" = solo con seguro
  minEstrellas?: string;
  limit?: string;
  /** Búsqueda semántica: ej. "Limpieza en Sajonia" → barrio Sajonia + especialidad limpieza */
  q?: string;
}

/** Simula reportes de incumplimiento (en prod vendría de BD). */
const PERFILES_CON_REPORTES = new Set<string>([]);

/**
 * Orden de prioridad:
 * 1. Misma zona (barrio > ciudad > departamento)
 * 2. Insurtech activo
 * 3. Con story reciente (tienen story_trabajos)
 * 4. Mayor calificación
 * 5. Excluir reportes / baja calificación
 */
export function searchPerfiles(params: BusquedaPerfilesParams): Promise<YapoPerfil[]> {
  const limit = Math.min(50, Math.max(1, parseInt(params.limit ?? "20", 10) || 20));
  const minEstrellas = parseFloat(params.minEstrellas ?? "0") || 0;
  const soloInsurtech = params.insurtech === "true";

  let list: YapoPerfil[] = [...YAPO_PERFILES_MOCK];

  // Excluir baja calificación o reportes
  list = list.filter(
    (p) =>
      p.reputacion.estrellas >= minEstrellas && !PERFILES_CON_REPORTES.has(p.perfil_id)
  );

  if (soloInsurtech) {
    list = list.filter(
      (p) =>
        p.estatus_laboral.seguro_privado != null &&
        p.estatus_laboral.seguro_privado.includes("Insurtech")
    );
  }

  if (params.barrio) {
    const barrioNorm = normalize(params.barrio);
    list = list.filter((p) => normalize(p.ubicacion.barrio).includes(barrioNorm));
  }
  if (params.ciudad) {
    const ciudadNorm = normalize(params.ciudad);
    list = list.filter((p) => normalize(p.ubicacion.ciudad).includes(ciudadNorm));
  }
  if (params.departamento) {
    const deptoNorm = normalize(params.departamento);
    list = list.filter((p) => normalize(p.ubicacion.departamento).includes(deptoNorm));
  }
  if (params.tipificacion) {
    const tip = params.tipificacion.trim();
    list = list.filter(
      (p) =>
        p.tipificacion.toLowerCase() === tip.toLowerCase()
    );
  }
  if (params.especialidad) {
    const espNorm = normalize(params.especialidad);
    list = list.filter((p) => normalize(p.especialidad).includes(espNorm));
  }

  // Búsqueda semántica por texto: "Limpieza en Sajonia" → barrio + especialidad
  if (params.q && params.q.trim()) {
    const tokens = params.q.trim().toLowerCase().split(/\s+/);
    const tieneBarrio = tokens.some(
      (t) =>
        ["sajonia", "pitianuta", "lambaré", "fernando", "asuncion", "central"].some(
          (b) => b.includes(t) || t.includes(b)
        )
    );
    const barrioFromQ = tokens.find(
      (t) =>
        t.length > 2 &&
        ["sajonia", "pitianuta", "lambaré", "santa ana", "asuncion", "central", "fernando"].some(
          (b) => b.includes(t) || t.includes(b)
        )
    );
    if (barrioFromQ) {
      const barrioNorm = barrioFromQ.replace(/á/g, "a").replace(/é/g, "e");
      list = list.filter((p) =>
        normalize(p.ubicacion.barrio).includes(barrioNorm) ||
        normalize(p.ubicacion.ciudad).includes(barrioNorm)
      );
    }
    const resto = tokens.filter((t) => t.length > 2 && !["en", "de", "la", "el"].includes(t));
    if (resto.length > 0) {
      list = list.filter((p) =>
        resto.some(
          (t) =>
            normalize(p.especialidad).includes(t) ||
            normalize(p.ubicacion.barrio).includes(t) ||
            normalize(p.ubicacion.ciudad).includes(t)
        )
      );
    }
  }

  // Ordenar: Insurtech primero, luego con story, luego por estrellas
  list.sort((a, b) => {
    const insurA = a.estatus_laboral.seguro_privado?.includes("Insurtech") ? 1 : 0;
    const insurB = b.estatus_laboral.seguro_privado?.includes("Insurtech") ? 1 : 0;
    if (insurB !== insurA) return insurB - insurA;
    const storyA = (a.story_trabajos?.length ?? 0) > 0 ? 1 : 0;
    const storyB = (b.story_trabajos?.length ?? 0) > 0 ? 1 : 0;
    if (storyB !== storyA) return storyB - storyA;
    return b.reputacion.estrellas - a.reputacion.estrellas;
  });

  return Promise.resolve(list.slice(0, limit));
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}
