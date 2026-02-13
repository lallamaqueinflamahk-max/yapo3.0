/**
 * Chips contextuales por rol (Valé, Capeto, Kavaju, Mbareté).
 * Cada rol ve solo chips útiles y accionables; el Cerebro valida permisos al ejecutar.
 * Contexto > cantidad; máx 6–8 chips visibles por rol.
 */

import type { IntentId, IntentPayload } from "@/lib/ai/intents";
import type { RoleId } from "@/lib/auth";

export interface RoleChip {
  id: string;
  label: string;
  icon: string;
  intentId: IntentId;
  payload?: IntentPayload;
}

/** Chips para Valé: subir trabajo, buscar cerca, ranking, chat con Capeto. */
const VALE_CHIPS: RoleChip[] = [
  { id: "vale-subir", label: "Subir trabajo", icon: "🎥", intentId: "action.post_performance", payload: { type: "video" } },
  { id: "vale-buscar-cerca", label: "Buscar trabajo cerca", icon: "📍", intentId: "search.jobs", payload: { query: "trabajo cerca", near: true } },
  { id: "vale-ranking", label: "Ver mi ranking", icon: "🏅", intentId: "navigate.ranking" },
  { id: "vale-chat-capeto", label: "Chat con Capeto", icon: "💬", intentId: "navigate.chat", payload: { with: "capeto" } },
];

/** Chips para Capeto: cuadrilla, validar, capacitar, ubicación. */
const CAPETO_CHIPS: RoleChip[] = [
  { id: "capeto-cuadrilla", label: "Ver cuadrilla", icon: "👥", intentId: "navigate.crew" },
  { id: "capeto-validar", label: "Validar trabajos", icon: "✅", intentId: "action.validate_tasks" },
  { id: "capeto-capacitar", label: "Micro-capacitar", icon: "🎓", intentId: "action.micro_train" },
  { id: "capeto-ubicacion", label: "Ubicación del equipo", icon: "📍", intentId: "navigate.team_location" },
];

/** Chips para Kavaju: organizar, asignar, rendimiento, conectar Mbareté. */
const KAVAJU_CHIPS: RoleChip[] = [
  { id: "kavaju-organizar", label: "Organizar cuadrilla", icon: "🧩", intentId: "action.organize_crew" },
  { id: "kavaju-asignar", label: "Asignar tareas", icon: "🔄", intentId: "action.assign_tasks" },
  { id: "kavaju-rendimiento", label: "Rendimiento del grupo", icon: "📊", intentId: "navigate.group_performance" },
  { id: "kavaju-mbarete", label: "Conectar con Mbareté", icon: "🤝", intentId: "action.connect_mbarete" },
];

/** Chips para Mbareté: mapa, semáforo, beneficios, reportes. */
const MBARETE_CHIPS: RoleChip[] = [
  { id: "mbarete-mapa", label: "Mapa territorial", icon: "🧭", intentId: "navigate.territory_map" },
  { id: "mbarete-semaforo", label: "Ver semáforo", icon: "🚦", intentId: "navigate.semaphore" },
  { id: "mbarete-beneficios", label: "Activar beneficios", icon: "🎁", intentId: "action.activate_benefits" },
  { id: "mbarete-reportes", label: "Reportes generales", icon: "📊", intentId: "navigate.reports" },
];

/** Máximo de chips visibles por rol (contexto > cantidad). */
export const MAX_ROLE_CHIPS_VISIBLE = 8;

const CHIPS_BY_ROLE: Record<RoleId, RoleChip[]> = {
  vale: VALE_CHIPS,
  capeto: CAPETO_CHIPS,
  kavaju: KAVAJU_CHIPS,
  mbarete: MBARETE_CHIPS,
  cliente: [],
  pyme: [],
  enterprise: [],
};

/**
 * Devuelve los chips para un rol. Solo roles laborales (vale, capeto, kavaju, mbarete) tienen chips.
 * Orden de prioridad si el usuario tiene varios roles: mbarete > kavaju > capeto > vale.
 */
export function getChipsForRole(role: RoleId): RoleChip[] {
  return CHIPS_BY_ROLE[role] ?? [];
}

/**
 * Devuelve los chips para el rol primario del usuario (el de mayor poder).
 * Máx MAX_ROLE_CHIPS_VISIBLE; si no hay rol laboral, devuelve array vacío.
 */
export function getChipsForRoles(roles: RoleId[]): RoleChip[] {
  const primary = getPrimaryLaborRole(roles);
  if (!primary) return [];
  const chips = getChipsForRole(primary);
  return chips.slice(0, MAX_ROLE_CHIPS_VISIBLE);
}

/** Orden de poder: mbarete > kavaju > capeto > vale. */
const LABOR_ROLE_PRIORITY: RoleId[] = ["mbarete", "kavaju", "capeto", "vale"];

function getPrimaryLaborRole(roles: RoleId[]): RoleId | null {
  for (const r of LABOR_ROLE_PRIORITY) {
    if (roles.includes(r)) return r;
  }
  return null;
}
