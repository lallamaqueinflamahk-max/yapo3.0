/**
 * Escudos disponibles/activables por rol y zona.
 */

import type { ActiveEscudo, EscudoId, ZoneState } from "./types";
import type { CerebroRole } from "@/lib/ai/cerebro";
import { ESCUDOS_CONFIG, ESCUDO_IDS } from "./config";

export interface EscudosForContext {
  role: CerebroRole;
  zoneState: ZoneState;
  /** Escudos que el usuario puede activar en este contexto. */
  available: ActiveEscudo[];
  /** IDs de escudos activos (mock: desde estado o sesión). */
  activeIds: EscudoId[];
}

/**
 * Indica si un escudo está disponible para el rol y la zona.
 */
export function isEscudoAvailableForRoleAndZone(
  escudoId: EscudoId,
  role: CerebroRole,
  zoneState: ZoneState
): boolean {
  const config = ESCUDOS_CONFIG[escudoId];
  if (!config) return false;
  if (!config.allowedRoles.includes(role)) return false;
  if (config.allowedZoneStates?.length && !config.allowedZoneStates.includes(zoneState)) {
    return false;
  }
  return true;
}

/**
 * Devuelve los escudos disponibles y activos para un rol y zona.
 * activeIds: mock de escudos ya activados (p. ej. desde sesión o estado local).
 */
export function getEscudosForRoleAndZone(
  role: CerebroRole,
  zoneState: ZoneState,
  activeIds: EscudoId[] = []
): EscudosForContext {
  const available: ActiveEscudo[] = [];
  for (const id of ESCUDO_IDS) {
    if (!isEscudoAvailableForRoleAndZone(id, role, zoneState)) continue;
    const config = ESCUDOS_CONFIG[id];
    available.push({
      id: config.id,
      label: config.label,
      icon: config.icon,
      layer: config.layer,
      resultModifier: getResultModifierForEscudo(id),
    });
  }
  return {
    role,
    zoneState,
    available,
    activeIds: activeIds.filter((id) => ESCUDO_IDS.includes(id)),
  };
}

function getResultModifierForEscudo(escudoId: EscudoId): ActiveEscudo["resultModifier"] {
  switch (escudoId) {
    case "fintech":
      return {
        messageSuffix: " Fintech activo.",
        severityOverride: "green",
        extraActions: [{ type: "NAVIGATE", payload: { screen: "/wallet" }, label: "Ver billetera" }],
      };
    case "comunidad":
      return {
        messageSuffix: " Comunidad activa. Interacciones, validación de desempeño y ranking en la sección Comunidad.",
        severityOverride: "green",
        extraActions: [{ type: "NAVIGATE", payload: { screen: "/comunidad" }, label: "Ir a Comunidad" }],
      };
    case "insurtech":
      return {
        messageSuffix: " Insurtech activo.",
        severityOverride: "green",
        extraActions: [{ type: "OPEN_MODAL", payload: { modalId: "insurtech" }, label: "Ver beneficios salud" }],
      };
    case "regalos":
      return {
        messageSuffix: " Regalos activos.",
        severityOverride: "green",
      };
    default:
      return undefined;
  }
}
