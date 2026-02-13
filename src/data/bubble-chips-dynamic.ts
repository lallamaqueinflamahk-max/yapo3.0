/**
 * Chips bubble dinámicos: render desde JSON mock filtrado por rol, categoría y escudos.
 * Rol: Valé, Capeto, Kavaju, Mbareté.
 * Categoría: 🛠️ oficios, 🚗 movilidad, ❤️ cuidados, 💼 profesional, escudos.
 * Puede actualizar contenido en tiempo real (mock) vía estado.
 */

import type { CerebroRole } from "@/lib/ai/cerebro";

export type RoleFilter = "vale" | "capeto" | "kavaju" | "mbarete" | "cliente" | "pyme" | "enterprise";
export type CategoryFilter = "oficios" | "movilidad" | "cuidados" | "profesional" | "escudos";

export interface DynamicChipConfig {
  id: string;
  label: string;
  icon: string;
  description?: string;
  intentId: string;
  payload?: Record<string, unknown>;
  /** Roles que pueden ver este chip (Valé, Capeto, Kavaju, Mbareté) */
  roles: RoleFilter[];
  /** Categoría: 🛠️ 🚗 ❤️ 💼 o escudos */
  category: CategoryFilter;
  /** Mock: trabajos recientes o usuarios activos (puede actualizarse en tiempo real) */
  jobsCount?: number;
}

const ALL_ROLES: RoleFilter[] = ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"];

/** JSON mock unificado: 4 categorías (oficios, movilidad, cuidados, profesional) + escudos. Visible para todos los roles. */
export const BUBBLE_CHIPS_DYNAMIC_MOCK: DynamicChipConfig[] = [
  // 🛠️ Oficios
  { id: "d-oficios-arreglos", label: "Arreglos", icon: "🛠️", description: "Servicios de arreglos", intentId: "search.services", payload: { query: "arreglos", category: "oficios" }, roles: ALL_ROLES, category: "oficios", jobsCount: 12 },
  { id: "d-oficios-electricista", label: "Electricista", icon: "⚡", intentId: "search.services", payload: { query: "electricista", category: "oficios" }, roles: ALL_ROLES, category: "oficios", jobsCount: 8 },
  { id: "d-oficios-plomero", label: "Plomería", icon: "🔧", intentId: "search.services", payload: { query: "plomero", category: "oficios" }, roles: ALL_ROLES, category: "oficios", jobsCount: 15 },
  { id: "d-oficios-pintor", label: "Pintura", icon: "🎨", intentId: "search.services", payload: { query: "pintor", category: "oficios" }, roles: ALL_ROLES, category: "oficios", jobsCount: 6 },
  { id: "d-oficios-albanil", label: "Albañilería", icon: "🧱", intentId: "search.services", payload: { query: "albañil", category: "oficios" }, roles: ALL_ROLES, category: "oficios", jobsCount: 22 },
  // 🚗 Movilidad
  { id: "d-movilidad-mecanico", label: "Mecánico", icon: "🚗", intentId: "search.services", payload: { query: "mecánico", category: "movilidad" }, roles: ALL_ROLES, category: "movilidad", jobsCount: 18 },
  { id: "d-movilidad-delivery", label: "Delivery", icon: "🛵", intentId: "search.jobs", payload: { query: "delivery", category: "movilidad" }, roles: ALL_ROLES, category: "movilidad", jobsCount: 31 },
  { id: "d-movilidad-conductor", label: "Conductor", icon: "🚚", intentId: "search.jobs", payload: { query: "conductor", category: "movilidad" }, roles: ALL_ROLES, category: "movilidad", jobsCount: 14 },
  { id: "d-movilidad-neumaticos", label: "Neumáticos", icon: "🛞", intentId: "search.services", payload: { query: "neumáticos", category: "movilidad" }, roles: ALL_ROLES, category: "movilidad", jobsCount: 9 },
  // ❤️ Cuidados
  { id: "d-cuidados-limpieza", label: "Limpieza", icon: "🧹", intentId: "search.services", payload: { query: "limpieza", category: "cuidados" }, roles: ALL_ROLES, category: "cuidados", jobsCount: 25 },
  { id: "d-cuidados-cuidado", label: "Cuidado personas", icon: "❤️", intentId: "search.services", payload: { query: "cuidado personas", category: "cuidados" }, roles: ALL_ROLES, category: "cuidados", jobsCount: 20 },
  { id: "d-cuidados-cocina", label: "Cocina", icon: "👨‍🍳", intentId: "search.services", payload: { query: "cocina", category: "cuidados" }, roles: ALL_ROLES, category: "cuidados", jobsCount: 11 },
  { id: "d-cuidados-jardin", label: "Jardinería", icon: "🌿", intentId: "search.services", payload: { query: "jardinería", category: "cuidados" }, roles: ALL_ROLES, category: "cuidados", jobsCount: 7 },
  // 💼 Profesional
  { id: "d-profesional-diseno", label: "Diseño gráfico", icon: "🖌️", intentId: "search.workers", payload: { query: "diseño", category: "profesional" }, roles: ALL_ROLES, category: "profesional", jobsCount: 16 },
  { id: "d-profesional-ventas", label: "Ventas", icon: "📊", intentId: "search.jobs", payload: { query: "ventas", category: "profesional" }, roles: ALL_ROLES, category: "profesional", jobsCount: 19 },
  { id: "d-profesional-contador", label: "Contador", icon: "💼", intentId: "search.workers", payload: { query: "contador", category: "profesional" }, roles: ALL_ROLES, category: "profesional", jobsCount: 8 },
  { id: "d-profesional-it", label: "IT / Soporte", icon: "💻", intentId: "search.workers", payload: { query: "it soporte", category: "profesional" }, roles: ALL_ROLES, category: "profesional", jobsCount: 10 },
  { id: "d-profesional-admin", label: "Administrativo", icon: "📁", intentId: "search.jobs", payload: { query: "administrativo", category: "profesional" }, roles: ALL_ROLES, category: "profesional", jobsCount: 13 },
  // Los 4 escudos oficiales (README §4): Insurtech, Fintech, Regalos, Comunidad
  { id: "d-escudo-insurtech", label: "Insurtech", icon: "🛡️", description: "Salud, farmacias y clínicas", intentId: "escudo_activate", payload: { escudo: "insurtech", tipo: "escudo" }, roles: ALL_ROLES, category: "escudos", jobsCount: 3 },
  { id: "d-escudo-fintech", label: "Fintech", icon: "💰", description: "Pagos y gestión financiera", intentId: "escudo_activate", payload: { escudo: "fintech", tipo: "escudo" }, roles: ALL_ROLES, category: "escudos", jobsCount: 5 },
  { id: "d-escudo-regalos", label: "Regalos", icon: "🎁", intentId: "escudo_activate", payload: { escudo: "regalos", tipo: "escudo" }, roles: ALL_ROLES, category: "escudos", jobsCount: 7 },
  { id: "d-escudo-comunidad", label: "Comunidad", icon: "👥", description: "Red laboral, validación y ranking", intentId: "escudo_activate", payload: { escudo: "comunidad", tipo: "escudo" }, roles: ALL_ROLES, category: "escudos", jobsCount: 12 },
];

/**
 * Filtra chips por rol actual y opcionalmente por categoría.
 * Renderizado dinámico: puede actualizar contenido en tiempo real (mock) pasando chipsOverride.
 */
export function getDynamicChips(
  currentRole: CerebroRole,
  filterCategory?: CategoryFilter | "all",
  chipsOverride?: DynamicChipConfig[]
): DynamicChipConfig[] {
  const source = chipsOverride ?? BUBBLE_CHIPS_DYNAMIC_MOCK;
  const roleRaw = (currentRole ?? "vale") as RoleFilter;
  const role = ALL_ROLES.includes(roleRaw) ? roleRaw : "vale";
  const byRole = source.filter((c) => c.roles.includes(role));
  if (filterCategory == null || filterCategory === "all") return byRole;
  return byRole.filter((c) => c.category === filterCategory);
}

export const CATEGORY_FILTER_ORDER: CategoryFilter[] = ["oficios", "movilidad", "cuidados", "profesional", "escudos"];
export const CATEGORY_FILTER_LABELS: Record<CategoryFilter, string> = {
  oficios: "Oficios",
  movilidad: "Movilidad",
  cuidados: "Cuidados",
  profesional: "Profesional",
  escudos: "Escudos",
};

const STORAGE_KEY_RECENT_CHIPS = "yapo_recent_chip_ids";

/** Guarda el id del chip clickeado para sugerencias (aprende por lo que más buscás). */
export function recordChipClick(chipId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_RECENT_CHIPS);
    const prev: string[] = raw ? JSON.parse(raw) : [];
    const next = [chipId, ...prev.filter((id) => id !== chipId)].slice(0, 10);
    window.localStorage.setItem(STORAGE_KEY_RECENT_CHIPS, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Lee los últimos chips usados (para priorizar en sugerencias). */
export function getRecentChipIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_RECENT_CHIPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Chips sugeridos por rol, profesión y lo que más buscás. Ordenados por relevancia. */
export function getSuggestedChips(
  currentRole: CerebroRole,
  profession?: string | null,
  recentChipIds: string[] = []
): DynamicChipConfig[] {
  const roleRaw = (currentRole ?? "vale") as RoleFilter;
  const role = ALL_ROLES.includes(roleRaw) ? roleRaw : "vale";
  const all = BUBBLE_CHIPS_DYNAMIC_MOCK.filter((c) => c.roles.includes(role));
  const prof = (profession ?? "").toLowerCase();

  const score = (c: DynamicChipConfig): number => {
    let s = 0;
    if (recentChipIds.includes(c.id)) s += 20;
    if (prof && (c.label.toLowerCase().includes(prof) || (c.payload?.query as string)?.toLowerCase().includes(prof))) s += 15;
    if (role === "vale" && (c.category === "oficios" || c.category === "cuidados")) s += 2;
    if (role === "cliente" && c.category === "profesional") s += 2;
    if (role === "pyme" || role === "enterprise") s += 1;
    return s;
  };

  const sorted = [...all].sort((a, b) => score(b) - score(a));
  return sorted.slice(0, 8);
}
