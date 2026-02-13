/**
 * Chips "bubble" por rol: Valé, Capeto, Kavaju, Mbareté.
 * Cada rol tiene colores y estilo distinto; cada chip emite CerebroIntent con contexto de rol.
 */

import type { CerebroRole } from "@/lib/ai/cerebro";
import type { IntentId } from "@/lib/ai/intents";

export type RoleChipId = "vale" | "capeto" | "kavaju" | "mbarete";

export interface RoleChipConfig {
  id: string;
  role: RoleChipId;
  label: string;
  description: string;
  icon: string;
  intentId: IntentId;
  payload?: Record<string, unknown>;
}

/** Valé: trabajo simple, perfil, desempeño. Verde claro / animación suave. */
export const VALE_CHIPS: RoleChipConfig[] = [
  { id: "vale-perfil", role: "vale", label: "Mi perfil", description: "Ver y editar perfil laboral", icon: "👤", intentId: "navigate.profile" },
  { id: "vale-buscar", role: "vale", label: "Buscar trabajo", description: "Ofertas cercanas", icon: "🔍", intentId: "search.jobs", payload: { query: "trabajo" } },
  { id: "vale-desempeño", role: "vale", label: "Subir desempeño", description: "Video o foto de trabajo", icon: "📤", intentId: "action.post_performance", payload: { type: "video" } },
  { id: "vale-billetera", role: "vale", label: "Mi billetera", description: "Ver saldo y subsidios", icon: "💼", intentId: "wallet_view" },
  { id: "vale-subsidios", role: "vale", label: "Subsidios", description: "Ver programas disponibles", icon: "📋", intentId: "wallet_subsidy" },
];

/** Capeto: cuadrilla, validar, capacitar. Azul / efecto bounce. */
export const CAPETO_CHIPS: RoleChipConfig[] = [
  { id: "capeto-cuadrilla", role: "capeto", label: "Cuadrilla", description: "Ver equipo a cargo", icon: "👷‍♂️", intentId: "navigate.crew" },
  { id: "capeto-validar", role: "capeto", label: "Validar tareas", description: "Aprobar desempeños", icon: "✅", intentId: "action.validate_tasks" },
  { id: "capeto-capacitar", role: "capeto", label: "Micro-capacitar", description: "Formar al equipo", icon: "📚", intentId: "action.micro_train" },
  { id: "capeto-billetera", role: "capeto", label: "Transferir", description: "Enviar a cuadrilla", icon: "💸", intentId: "wallet_transfer", payload: { toUserId: "user-cuadrilla", amount: 5000 } },
  { id: "capeto-ubicacion", role: "capeto", label: "Ubicación equipo", description: "Ver dónde está el equipo", icon: "📍", intentId: "navigate.team_location" },
];

/** Kavaju: territorio, reportes, incentivos. Naranja / efecto glow. */
export const KAVAJU_CHIPS: RoleChipConfig[] = [
  { id: "kavaju-territorio", role: "kavaju", label: "Territorio", description: "Semáforo y zona", icon: "🗺️", intentId: "navigate.territory" },
  { id: "kavaju-organizar", role: "kavaju", label: "Organizar cuadrilla", description: "Asignar y coordinar", icon: "📋", intentId: "action.organize_crew" },
  { id: "kavaju-tareas", role: "kavaju", label: "Asignar tareas", description: "Repartir trabajo", icon: "📌", intentId: "action.assign_tasks" },
  { id: "kavaju-rendimiento", role: "kavaju", label: "Rendimiento grupo", description: "Métricas del equipo", icon: "📊", intentId: "navigate.group_performance" },
  { id: "kavaju-mbarete", role: "kavaju", label: "Conectar Mbareté", description: "Contactar líder", icon: "📞", intentId: "action.connect_mbarete" },
];

/** Mbareté: liderazgo, mapa, beneficios, reportes. Rojo / efecto pulso. */
export const MBARETE_CHIPS: RoleChipConfig[] = [
  { id: "mbarete-mapa", role: "mbarete", label: "Mapa territorial", description: "Ver toda la zona", icon: "🗺️", intentId: "navigate.territory_map" },
  { id: "mbarete-semáforo", role: "mbarete", label: "Semáforo", description: "Estado por zona", icon: "🚦", intentId: "navigate.semaphore" },
  { id: "mbarete-beneficios", role: "mbarete", label: "Activar beneficios", description: "Programas y becas", icon: "🎁", intentId: "action.activate_benefits" },
  { id: "mbarete-reportes", role: "mbarete", label: "Reportes", description: "Reportes generales", icon: "📈", intentId: "navigate.reports" },
  { id: "mbarete-billetera", role: "mbarete", label: "Billetera", description: "Transferencias y saldo", icon: "💼", intentId: "wallet_view" },
];

const ROLE_CHIPS_MAP: Record<RoleChipId, RoleChipConfig[]> = {
  vale: VALE_CHIPS,
  capeto: CAPETO_CHIPS,
  kavaju: KAVAJU_CHIPS,
  mbarete: MBARETE_CHIPS,
};

/** Chips visibles para el rol actual (laborales: vale, capeto, kavaju, mbarete). */
export function getChipsForRole(role: CerebroRole): RoleChipConfig[] {
  const id = role as RoleChipId;
  if (id in ROLE_CHIPS_MAP) return ROLE_CHIPS_MAP[id];
  return VALE_CHIPS;
}
