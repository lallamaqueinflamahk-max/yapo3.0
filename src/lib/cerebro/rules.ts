/**
 * Reglas del Cerebro YAPÓ.
 * Este módulo define quién puede hacer qué.
 * Sin UI. 100% testeable.
 */

import type { RoleId, ActionId } from "./types";

/** Acciones canónicas evaluadas por el Cerebro. */
export const CEREBRO_ACTIONS = {
  release_payment: "release_payment",
  hold_payment: "hold_payment",
  validate_task: "validate_task",
  view: "view",
  admin: "admin",
  contract_publish: "contract_publish",
  contract_view: "contract_view",
} as const;

/**
 * Reglas de negocio:
 * - Valé: no puede liberar pagos ni validar a otros.
 * - Capeto: puede validar trabajos; no liberar pagos.
 * - Kavaju: puede retener y liberar pagos.
 * - Mbareté: acceso total.
 * - Cliente / PyME / Enterprise: solo acciones de contratación (contract_*).
 */

/** Roles que pueden ejecutar cada acción. */
const ACTION_ROLES: Record<string, RoleId[]> = {
  [CEREBRO_ACTIONS.release_payment]: ["kavaju", "mbarete"],
  [CEREBRO_ACTIONS.hold_payment]: ["kavaju", "mbarete"],
  [CEREBRO_ACTIONS.validate_task]: ["capeto", "kavaju", "mbarete"],
  [CEREBRO_ACTIONS.view]: [
    "vale",
    "capeto",
    "kavaju",
    "mbarete",
    "cliente",
    "pyme",
    "enterprise",
  ],
  [CEREBRO_ACTIONS.admin]: ["mbarete"],
  [CEREBRO_ACTIONS.contract_publish]: ["cliente", "pyme", "enterprise"],
  [CEREBRO_ACTIONS.contract_view]: [
    "vale",
    "capeto",
    "kavaju",
    "mbarete",
    "cliente",
    "pyme",
    "enterprise",
  ],
};

const ROLES: RoleId[] = [
  "vale",
  "capeto",
  "kavaju",
  "mbarete",
  "cliente",
  "pyme",
  "enterprise",
];

function normalizeRole(r: string): RoleId {
  const s = (r ?? "").toString().toLowerCase().trim();
  return ROLES.includes(s as RoleId) ? (s as RoleId) : "vale";
}

/**
 * Indica si el rol puede ejecutar la acción según las reglas del Cerebro.
 */
export function can(role: string, action: string): boolean {
  const r = normalizeRole(role);
  if (r === "mbarete") return true;
  const allowed = ACTION_ROLES[action];
  if (!allowed) return false;
  return allowed.includes(r);
}

/**
 * Devuelve la lista de acciones permitidas para el rol.
 */
export function getAllowedActions(role: string): ActionId[] {
  const r = normalizeRole(role);
  return (Object.keys(ACTION_ROLES) as ActionId[]).filter((action) =>
    can(r, action)
  );
}

/**
 * Pasos sugeridos cuando la acción no está autorizada (por rol/acción).
 */
export function getNextSteps(role: string, action: string, authorized: boolean): string[] {
  if (authorized) return [];
  const r = normalizeRole(role);
  const steps: string[] = [];
  if (action === CEREBRO_ACTIONS.release_payment || action === CEREBRO_ACTIONS.hold_payment) {
    if (r === "vale" || r === "capeto") {
      steps.push("Solicitar a Kavaju o Mbareté para retener o liberar pagos.");
    }
  }
  if (action === CEREBRO_ACTIONS.validate_task) {
    if (r === "vale") {
      steps.push("Solicitar a Capeto, Kavaju o Mbareté para validar trabajos.");
    }
  }
  if (action === CEREBRO_ACTIONS.admin) {
    steps.push("Solo Mbareté puede ejecutar acciones de administración.");
  }
  if (action === CEREBRO_ACTIONS.contract_publish) {
    if (["vale", "capeto", "kavaju", "mbarete"].includes(r)) {
      steps.push("Acciones de contratación disponibles para Cliente, PyME o Enterprise.");
    }
  }
  if (steps.length === 0) {
    steps.push("Verificar rol y permisos con el equipo.");
  }
  return steps;
}
