/**
 * Chips bubble MVP: categorías laborales y filtros.
 * 4 categorías principales 🛠️ 🚗 ❤️ 💼 + subcategorías (top 20 profesiones + escudos).
 * Render desde mock; cada chip dispara CerebroIntent (intentId + payload).
 */

export type CategoryId = "oficios" | "movilidad" | "cuidados" | "profesional" | "escudos";

export interface CategoryChipConfig {
  id: string;
  category: CategoryId;
  subcategory: string;
  label: string;
  icon: string;
  /** Color Tailwind o hex para la burbuja (Paraguay + tonos cálidos) */
  color: string;
  /** Intent para Cerebro (search.services, search.jobs, escudo_activate, etc.) */
  intentId: string;
  payload?: Record<string, unknown>;
  /** Mock: cantidad de trabajos recientes o usuarios activos */
  jobsCount?: number;
}

/** Colores por categoría: Paraguay 🇵🇾 + tonos cálidos */
const CATEGORY_COLORS: Record<CategoryId, string> = {
  oficios: "oficios",      // 🛠️ azul/índigo
  movilidad: "movilidad",   // 🚗 ámbar
  cuidados: "cuidados",    // ❤️ rosa/coral
  profesional: "profesional", // 💼 verde/teal
  escudos: "escudos",      // rojo Paraguay
};

/** 4 categorías principales + subcategorías (top 20 profesiones + escudos) */
export const CATEGORY_CHIPS_MOCK: CategoryChipConfig[] = [
  // 🛠️ Oficios
  { id: "oficios-arreglos", category: "oficios", subcategory: "Arreglos", label: "Arreglos", icon: "🛠️", color: "oficios", intentId: "search.services", payload: { query: "arreglos", category: "oficios" }, jobsCount: 12 },
  { id: "oficios-electricista", category: "oficios", subcategory: "Electricidad", label: "Electricista", icon: "⚡", color: "oficios", intentId: "search.services", payload: { query: "electricista", category: "oficios" }, jobsCount: 8 },
  { id: "oficios-plomero", category: "oficios", subcategory: "Plomería", label: "Plomería", icon: "🔧", color: "oficios", intentId: "search.services", payload: { query: "plomero", category: "oficios" }, jobsCount: 15 },
  { id: "oficios-pintor", category: "oficios", subcategory: "Pintura", label: "Pintura", icon: "🎨", color: "oficios", intentId: "search.services", payload: { query: "pintor", category: "oficios" }, jobsCount: 6 },
  { id: "oficios-albañil", category: "oficios", subcategory: "Construcción", label: "Albañilería", icon: "🧱", color: "oficios", intentId: "search.services", payload: { query: "albañil", category: "oficios" }, jobsCount: 22 },
  // 🚗 Movilidad
  { id: "movilidad-mecanico", category: "movilidad", subcategory: "Mecánica", label: "Mecánico", icon: "🚗", color: "movilidad", intentId: "search.services", payload: { query: "mecánico", category: "movilidad" }, jobsCount: 18 },
  { id: "movilidad-chapa", category: "movilidad", subcategory: "Chapa y pintura", label: "Chapa y pintura", icon: "🔩", color: "movilidad", intentId: "search.services", payload: { query: "chapa pintura", category: "movilidad" }, jobsCount: 5 },
  { id: "movilidad-neumaticos", category: "movilidad", subcategory: "Neumáticos", label: "Neumáticos", icon: "🛞", color: "movilidad", intentId: "search.services", payload: { query: "neumáticos", category: "movilidad" }, jobsCount: 9 },
  { id: "movilidad-conductor", category: "movilidad", subcategory: "Conducción", label: "Conductor", icon: "🚚", color: "movilidad", intentId: "search.jobs", payload: { query: "conductor", category: "movilidad" }, jobsCount: 14 },
  { id: "movilidad-delivery", category: "movilidad", subcategory: "Delivery", label: "Delivery", icon: "🛵", color: "movilidad", intentId: "search.jobs", payload: { query: "delivery", category: "movilidad" }, jobsCount: 31 },
  // ❤️ Cuidados
  { id: "cuidados-cuidado", category: "cuidados", subcategory: "Cuidado", label: "Cuidado de personas", icon: "❤️", color: "cuidados", intentId: "search.services", payload: { query: "cuidado personas", category: "cuidados" }, jobsCount: 20 },
  { id: "cuidados-limpieza", category: "cuidados", subcategory: "Limpieza", label: "Limpieza", icon: "🧹", color: "cuidados", intentId: "search.services", payload: { query: "limpieza", category: "cuidados" }, jobsCount: 25 },
  { id: "cuidados-cocina", category: "cuidados", subcategory: "Cocina", label: "Cocina", icon: "👨‍🍳", color: "cuidados", intentId: "search.services", payload: { query: "cocina", category: "cuidados" }, jobsCount: 11 },
  { id: "cuidados-jardin", category: "cuidados", subcategory: "Jardín", label: "Jardinería", icon: "🌿", color: "cuidados", intentId: "search.services", payload: { query: "jardinería", category: "cuidados" }, jobsCount: 7 },
  { id: "cuidados-mascotas", category: "cuidados", subcategory: "Mascotas", label: "Cuidado mascotas", icon: "🐕", color: "cuidados", intentId: "search.services", payload: { query: "mascotas", category: "cuidados" }, jobsCount: 4 },
  // 💼 Profesional
  { id: "profesional-contador", category: "profesional", subcategory: "Contabilidad", label: "Contador", icon: "💼", color: "profesional", intentId: "search.workers", payload: { query: "contador", category: "profesional" }, jobsCount: 8 },
  { id: "profesional-diseno", category: "profesional", subcategory: "Diseño", label: "Diseño gráfico", icon: "🖌️", color: "profesional", intentId: "search.workers", payload: { query: "diseño", category: "profesional" }, jobsCount: 16 },
  { id: "profesional-it", category: "profesional", subcategory: "Tecnología", label: "IT / Soporte", icon: "💻", color: "profesional", intentId: "search.workers", payload: { query: "it soporte", category: "profesional" }, jobsCount: 10 },
  { id: "profesional-ventas", category: "profesional", subcategory: "Ventas", label: "Ventas", icon: "📊", color: "profesional", intentId: "search.jobs", payload: { query: "ventas", category: "profesional" }, jobsCount: 19 },
  { id: "profesional-admin", category: "profesional", subcategory: "Administración", label: "Administrativo", icon: "📁", color: "profesional", intentId: "search.jobs", payload: { query: "administrativo", category: "profesional" }, jobsCount: 13 },
  // Los 4 escudos oficiales: Insurtech, Fintech, Regalos, Comunidad
  { id: "escudo-insurtech", category: "escudos", subcategory: "Insurtech", label: "Insurtech", icon: "🛡️", color: "escudos", intentId: "escudo_activate", payload: { escudo: "insurtech", tipo: "escudo" }, jobsCount: 3 },
  { id: "escudo-fintech", category: "escudos", subcategory: "Fintech", label: "Fintech", icon: "💰", color: "escudos", intentId: "escudo_activate", payload: { escudo: "fintech", tipo: "escudo" }, jobsCount: 5 },
  { id: "escudo-regalos", category: "escudos", subcategory: "Regalos", label: "Regalos", icon: "🎁", color: "escudos", intentId: "escudo_activate", payload: { escudo: "regalos", tipo: "escudo" }, jobsCount: 7 },
  { id: "escudo-comunidad", category: "escudos", subcategory: "Comunidad", label: "Comunidad", icon: "👥", color: "escudos", intentId: "escudo_activate", payload: { escudo: "comunidad", tipo: "escudo" }, jobsCount: 12 },
];

/** Agrupa chips por categoría para UI (4 principales + escudos) */
export function getChipsByCategory(): Record<CategoryId, CategoryChipConfig[]> {
  const byCategory: Record<string, CategoryChipConfig[]> = {
    oficios: [],
    movilidad: [],
    cuidados: [],
    profesional: [],
    escudos: [],
  };
  for (const chip of CATEGORY_CHIPS_MOCK) {
    byCategory[chip.category].push(chip);
  }
  return byCategory as Record<CategoryId, CategoryChipConfig[]>;
}

/** Todas las categorías en orden (4 principales + escudos) */
export const CATEGORY_ORDER: CategoryId[] = ["oficios", "movilidad", "cuidados", "profesional", "escudos"];

/** Labels de categoría para títulos */
export const CATEGORY_LABELS: Record<CategoryId, string> = {
  oficios: "Oficios",
  movilidad: "Movilidad",
  cuidados: "Cuidados",
  profesional: "Profesional",
  escudos: "Escudos",
};
