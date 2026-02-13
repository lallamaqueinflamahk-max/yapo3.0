/**
 * Feature Escudos: capas de seguridad / beneficio.
 * Insurtech, Fintech, Regalos, Comunidad.
 * Activables por rol y zona; modifican CerebroResult; UI tipo badge.
 */

export type {
  EscudoId,
  EscudoConfig,
  ActiveEscudo,
  ZoneState,
  CerebroResultModifier,
} from "./types";

export { ESCUDOS_CONFIG, ESCUDO_IDS } from "./config";

export {
  getEscudosForRoleAndZone,
  isEscudoAvailableForRoleAndZone,
} from "./getEscudosForRoleAndZone";
export type { EscudosForContext } from "./getEscudosForRoleAndZone";

export { applyEscudosToResult } from "./applyEscudosToResult";

export { default as EscudoBadge } from "./EscudoBadge";
export type { EscudoBadgeProps } from "./EscudoBadge";

export { default as EscudosBadges } from "./EscudosBadges";
export type { EscudosBadgesProps } from "./EscudosBadges";
