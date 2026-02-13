/**
 * Catálogo de intents del Cerebro (MVP).
 * Cerebro gobierna la Wallet: wallet_view, wallet_transfer, wallet_subsidy.
 * Decide acciones; navegación reactiva desde CerebroResult.navigationTarget.
 */

import type { IntentDefinition, IntentId } from "./types";
import type { RoleId } from "@/lib/auth";

const ALL_ROLES: RoleId[] = [
  "vale",
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

const LABOR_ROLES: RoleId[] = ["vale", "capeto", "kavaju", "mbarete"];
const CONTRACTOR_ROLES: RoleId[] = ["cliente", "pyme", "enterprise"];
const TERRITORY_ROLES: RoleId[] = ["kavaju", "mbarete"];
/** Capeto y superiores (cuadrilla, validar, capacitar). */
const CAPETO_AND_ABOVE: RoleId[] = ["capeto", "kavaju", "mbarete"];
/** Kavaju y Mbareté (territorio, equipo, reportes). */
const KAVAJU_AND_ABOVE: RoleId[] = ["kavaju", "mbarete"];
/** Solo Mbareté (mapa, semáforo, beneficios, reportes generales). */
const MBARETE_ONLY: RoleId[] = ["mbarete"];
/** Roles que pueden ejecutar transferencia (wallet:transfer). */
const WALLET_TRANSFER_ROLES: RoleId[] = [
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

/** Catálogo de intents: id → definición. */
export const INTENT_CATALOG: Record<IntentId, IntentDefinition> = {
  // --- Search ---
  "search.workers": {
    id: "search.workers",
    category: "search",
    description: "Buscar trabajadores o talento",
    allowedRoles: CONTRACTOR_ROLES,
    expectedParams: ["query", "filters"],
    resultAction: "search",
    defaultMessage: "Encontré trabajadores según tu búsqueda.",
    deniedMessage: "Solo contratantes (Cliente, PyME, Enterprise) pueden buscar trabajadores.",
  },
  "search.jobs": {
    id: "search.jobs",
    category: "search",
    description: "Buscar trabajos u ofertas laborales",
    allowedRoles: LABOR_ROLES,
    expectedParams: ["query", "location"],
    resultAction: "search",
    defaultMessage: "Encontré ofertas relacionadas.",
    deniedMessage: "Iniciá sesión como trabajador para ver ofertas.",
  },
  "search.services": {
    id: "search.services",
    category: "search",
    description: "Buscar servicios o capacidades",
    allowedRoles: ALL_ROLES,
    expectedParams: ["query"],
    resultAction: "search",
    defaultMessage: "Encontré servicios relacionados.",
  },

  // --- Navigate ---
  "navigate.wallet": {
    id: "navigate.wallet",
    category: "navigate",
    description: "Ir a Billetera",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/wallet",
    defaultMessage: "Podés gestionar pagos en Billetera.",
  },
  "navigate.chat": {
    id: "navigate.chat",
    category: "navigate",
    description: "Ir a Chat",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/chat",
    defaultMessage: "Abrí Chat para conversar.",
  },
  "navigate.territory": {
    id: "navigate.territory",
    category: "navigate",
    description: "Ir a territorio / semáforo de gestión",
    allowedRoles: TERRITORY_ROLES,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Panel de territorio disponible.",
    deniedMessage: "Solo Kavaju y Mbareté acceden al territorio.",
  },
  "navigate.profile": {
    id: "navigate.profile",
    category: "navigate",
    description: "Ir a Mi perfil",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/profile",
    defaultMessage: "Tu perfil está en la sección Perfil.",
  },
  "navigate.home": {
    id: "navigate.home",
    category: "navigate",
    description: "Ir a Inicio",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/home",
    defaultMessage: "Inicio es tu pantalla principal.",
  },

  // --- Action ---
  "action.post_performance": {
    id: "action.post_performance",
    category: "action",
    description: "Subir video/foto de desempeño laboral",
    allowedRoles: LABOR_ROLES,
    expectedParams: ["type"],
    resultAction: "execute",
    navigationTarget: "/home",
    defaultMessage: "Podés subir tu desempeño desde Inicio.",
    deniedMessage: "Solo trabajadores (Vale, Capeto, Kavaju, Mbareté) pueden subir desempeño.",
  },
  "action.transfer_wallet": {
    id: "action.transfer_wallet",
    category: "action",
    description: "Realizar transferencia desde billetera",
    allowedRoles: ALL_ROLES,
    expectedParams: ["amount", "toUserId"],
    resultAction: "execute",
    navigationTarget: "/wallet",
    requiresValidation: true,
    defaultMessage: "Completá la transferencia en Billetera.",
    deniedMessage: "Verificá tu identidad para transferir.",
  },

  // --- Wallet gobernada por Cerebro (wallet_view, wallet_transfer, wallet_subsidy) ---
  /** Ver billetera / saldo. Cerebro decide; navegación reactiva a /wallet. */
  wallet_view: {
    id: "wallet_view",
    category: "action",
    description: "Ver billetera y saldo",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/wallet",
    defaultMessage: "Tu saldo está en Billetera.",
    deniedMessage: "Iniciá sesión para ver tu billetera.",
  },
  /** Intent orquestado por Cerebro: guard → applyTransaction. Payload: { toUserId, amount }. */
  wallet_transfer: {
    id: "wallet_transfer",
    category: "action",
    description: "Transferir a otro usuario (Cerebro orquesta guard y wallet.service)",
    allowedRoles: WALLET_TRANSFER_ROLES,
    expectedParams: ["toUserId", "amount"],
    resultAction: "execute",
    navigationTarget: "/wallet",
    defaultMessage: "Transferencia realizada.",
    deniedMessage: "Tu rol no permite transferir; verificá tu identidad en Billetera.",
  },
  wallet_release_transaction: {
    id: "wallet_release_transaction",
    category: "action",
    description: "Liberar una transacción retenida (Cerebro orquesta wallet.service)",
    allowedRoles: WALLET_TRANSFER_ROLES,
    expectedParams: ["transactionId"],
    resultAction: "execute",
    navigationTarget: "/wallet",
    defaultMessage: "Transacción liberada.",
    deniedMessage: "No podés liberar esta transacción.",
  },
  wallet_block_transaction: {
    id: "wallet_block_transaction",
    category: "action",
    description: "Bloquear una transacción retenida (Cerebro orquesta wallet.service)",
    allowedRoles: WALLET_TRANSFER_ROLES,
    expectedParams: ["transactionId"],
    resultAction: "execute",
    navigationTarget: "/wallet",
    defaultMessage: "Transacción bloqueada.",
    deniedMessage: "No podés bloquear esta transacción.",
  },
  /** Ver subsidios disponibles. Cerebro decide; navegación reactiva a /wallet (sección subsidios). */
  wallet_subsidy: {
    id: "wallet_subsidy",
    category: "action",
    description: "Ver y aceptar subsidios en billetera",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/wallet",
    defaultMessage: "Los subsidios están en Billetera.",
    deniedMessage: "Iniciá sesión para ver subsidios.",
  },
  /** Activar escudo (biométrico, tiempo, monto, territorial). Navega a wallet; mensaje mock. */
  escudo_activate: {
    id: "escudo_activate",
    category: "action",
    description: "Activar escudo de seguridad (mock)",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/wallet",
    defaultMessage: "Escudos en Billetera. Activá desde la sección de seguridad.",
    deniedMessage: "Iniciá sesión para gestionar escudos.",
  },
  "action.open_whatsapp": {
    id: "action.open_whatsapp",
    category: "action",
    description: "Abrir contacto por WhatsApp",
    allowedRoles: ALL_ROLES,
    expectedParams: ["phone"],
    resultAction: "execute",
    requiresValidation: true,
    defaultMessage: "WhatsApp se habilita con verificación.",
    deniedMessage: "Completá la verificación para habilitar WhatsApp.",
  },
  "action.view_balance": {
    id: "action.view_balance",
    category: "action",
    description: "Ver saldo de billetera",
    allowedRoles: ALL_ROLES,
    resultAction: "navigate",
    navigationTarget: "/wallet",
    defaultMessage: "Tu saldo está en Billetera.",
  },

  // --- Más opciones (abre bottom sheet con chips secundarios) ---
  "action.show_more_options": {
    id: "action.show_more_options",
    category: "action",
    description: "Abrir más opciones (chips secundarios)",
    allowedRoles: ALL_ROLES,
    resultAction: "execute",
    defaultMessage: "Más opciones disponibles.",
  },

  // --- Info ---
  "info.explain_feature": {
    id: "info.explain_feature",
    category: "info",
    description: "Explicar una función o capacidad",
    allowedRoles: ALL_ROLES,
    expectedParams: ["feature"],
    resultAction: "search",
    defaultMessage: "Te explico según la función que elegiste.",
  },

  // --- Rol: Valé ---
  "navigate.ranking": {
    id: "navigate.ranking",
    category: "navigate",
    description: "Ver mi ranking",
    allowedRoles: LABOR_ROLES,
    resultAction: "navigate",
    navigationTarget: "/profile",
    defaultMessage: "Tu ranking está en tu perfil.",
  },

  // --- Rol: Capeto ---
  "navigate.crew": {
    id: "navigate.crew",
    category: "navigate",
    description: "Ver cuadrilla",
    allowedRoles: CAPETO_AND_ABOVE,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Cuadrilla disponible en el panel.",
    deniedMessage: "Solo Capeto y superiores pueden ver la cuadrilla.",
  },
  "action.validate_tasks": {
    id: "action.validate_tasks",
    category: "action",
    description: "Validar trabajos",
    allowedRoles: CAPETO_AND_ABOVE,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Validá trabajos desde el panel.",
    deniedMessage: "Solo Capeto y superiores pueden validar.",
  },
  "action.micro_train": {
    id: "action.micro_train",
    category: "action",
    description: "Micro-capacitar al equipo",
    allowedRoles: CAPETO_AND_ABOVE,
    resultAction: "execute",
    navigationTarget: "/dashboard",
    defaultMessage: "Micro-capacitación disponible en el panel.",
    deniedMessage: "Solo Capeto y superiores pueden capacitar.",
  },
  "navigate.team_location": {
    id: "navigate.team_location",
    category: "navigate",
    description: "Ubicación del equipo",
    allowedRoles: CAPETO_AND_ABOVE,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Ubicación del equipo en el panel.",
    deniedMessage: "Solo Capeto y superiores acceden a la ubicación.",
  },

  // --- Rol: Kavaju ---
  "action.organize_crew": {
    id: "action.organize_crew",
    category: "action",
    description: "Organizar cuadrilla",
    allowedRoles: KAVAJU_AND_ABOVE,
    resultAction: "execute",
    navigationTarget: "/dashboard",
    defaultMessage: "Organizá la cuadrilla desde el panel.",
    deniedMessage: "Solo Kavaju y Mbareté pueden organizar cuadrilla.",
  },
  "action.assign_tasks": {
    id: "action.assign_tasks",
    category: "action",
    description: "Asignar tareas",
    allowedRoles: KAVAJU_AND_ABOVE,
    resultAction: "execute",
    navigationTarget: "/dashboard",
    defaultMessage: "Asigná tareas desde el panel.",
    deniedMessage: "Solo Kavaju y Mbareté pueden asignar tareas.",
  },
  "navigate.group_performance": {
    id: "navigate.group_performance",
    category: "navigate",
    description: "Rendimiento del grupo",
    allowedRoles: KAVAJU_AND_ABOVE,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Rendimiento del grupo en el panel.",
    deniedMessage: "Solo Kavaju y Mbareté acceden al rendimiento.",
  },
  "action.connect_mbarete": {
    id: "action.connect_mbarete",
    category: "action",
    description: "Conectar con Mbareté",
    allowedRoles: ["kavaju"],
    resultAction: "execute",
    navigationTarget: "/chat",
    defaultMessage: "Conectá con Mbareté desde Chat.",
    deniedMessage: "Solo Kavaju puede usar este atajo.",
  },

  // --- Rol: Mbareté ---
  "navigate.territory_map": {
    id: "navigate.territory_map",
    category: "navigate",
    description: "Mapa territorial",
    allowedRoles: MBARETE_ONLY,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Mapa territorial disponible.",
    deniedMessage: "Solo Mbareté accede al mapa territorial.",
  },
  "navigate.semaphore": {
    id: "navigate.semaphore",
    category: "navigate",
    description: "Ver semáforo de gestión",
    allowedRoles: MBARETE_ONLY,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Semáforo en el panel.",
    deniedMessage: "Solo Mbareté accede al semáforo.",
  },
  "action.activate_benefits": {
    id: "action.activate_benefits",
    category: "action",
    description: "Activar beneficios",
    allowedRoles: MBARETE_ONLY,
    resultAction: "execute",
    navigationTarget: "/dashboard",
    defaultMessage: "Activá beneficios desde el panel.",
    deniedMessage: "Solo Mbareté puede activar beneficios.",
  },
  "navigate.reports": {
    id: "navigate.reports",
    category: "navigate",
    description: "Reportes generales",
    allowedRoles: MBARETE_ONLY,
    resultAction: "navigate",
    navigationTarget: "/dashboard",
    defaultMessage: "Reportes generales en el panel.",
    deniedMessage: "Solo Mbareté accede a reportes generales.",
  },
};

/** Lista de IDs de intents (para validación y recorrido). */
export const INTENT_IDS: IntentId[] = Object.keys(INTENT_CATALOG) as IntentId[];

/** Obtiene la definición de un intent por ID. */
export function getIntentDefinition(intentId: IntentId): IntentDefinition | undefined {
  return INTENT_CATALOG[intentId];
}

/** Indica si un intentId existe en el catálogo. */
export function isValidIntentId(intentId: string): intentId is IntentId {
  return intentId in INTENT_CATALOG;
}
