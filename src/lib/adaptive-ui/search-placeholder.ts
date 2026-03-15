/**
 * Placeholder adaptativo del buscador según rol de usuario.
 * Futuro: integrar historial de búsquedas (localStorage o API) para sugerir
 * "Continuar con: X" o "Volver a buscar: Y".
 */

import type { RoleId } from "@/lib/auth";

/** Roles de contratantes (buscan profesionales/oficios). */
const ROLES_CONTRATANTES: RoleId[] = ["cliente", "pyme", "enterprise"];

/** Roles de trabajadores (buscan ofertas/categorías/zona). */
const ROLES_TRABAJADORES: RoleId[] = ["vale", "capeto", "kavaju", "mbarete"];

/** Placeholders generales por segmento de rol. Sin ejemplos específicos (plomero, Lambaré)
 * porque varían según lo que busca cada usuario y pueden confundir. */
const PLACEHOLDER_BY_SEGMENT: Record<string, string> = {
  contratantes: "Profesional, oficio o zona",
  trabajadores: "Oferta, categoría o zona",
  default: "Preguntá lo que quieras",
};

/**
 * Devuelve un placeholder general según el rol principal del usuario.
 * @param roles - Roles del usuario (identity.roles)
 * @param lastSearch - Opcional: última búsqueda para futuro "Continuar con: X"
 */
export function getSearchPlaceholder(
  roles: RoleId[] | undefined | null,
  lastSearch?: string | null
): string {
  const primaryRole = roles?.[0];

  if (lastSearch?.trim()) {
    // Futuro: "Continuar con: plomero Lambaré" o similar
    return `Continuar con: ${lastSearch.trim().slice(0, 30)}${lastSearch.length > 30 ? "…" : ""}`;
  }

  if (primaryRole && ROLES_CONTRATANTES.includes(primaryRole)) {
    return PLACEHOLDER_BY_SEGMENT.contratantes;
  }
  if (primaryRole && ROLES_TRABAJADORES.includes(primaryRole)) {
    return PLACEHOLDER_BY_SEGMENT.trabajadores;
  }

  return PLACEHOLDER_BY_SEGMENT.default;
}

/** Key para localStorage con últimas búsquedas (futuro). */
export const SEARCH_HISTORY_KEY = "yapo_last_searches";

/**
 * Lee últimas búsquedas del usuario desde localStorage.
 * Futuro: conectar a API para sincronizar entre dispositivos.
 */
export function getLastSearches(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { query: string; at?: number }[];
    return (parsed ?? []).slice(0, 5).map((x) => x.query).filter(Boolean);
  } catch {
    return [];
  }
}
