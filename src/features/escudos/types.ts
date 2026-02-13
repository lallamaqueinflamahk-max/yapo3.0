/**
 * Escudos como capas de seguridad / beneficio.
 * Nombres oficiales: Insurtech, Fintech, Regalos, Comunidad.
 * Activables por rol y zona; modifican CerebroResult.
 */

import type { CerebroRole } from "@/lib/ai/cerebro";
import type { TerritorySemaphoreState } from "@/lib/territory";

/** Identificadores de escudos (seguridad / beneficio). */
export type EscudoId = "fintech" | "comunidad" | "insurtech" | "regalos";

/** Estado del semáforo territorial (zona). */
export type ZoneState = TerritorySemaphoreState;

/** Configuración de un escudo: roles y zonas donde está disponible. */
export interface EscudoConfig {
  id: EscudoId;
  label: string;
  description: string;
  icon: string;
  /** Roles que pueden activar este escudo. */
  allowedRoles: CerebroRole[];
  /** Estados de zona donde el escudo está disponible (green = solo verde, etc.). Si vacío, no restringe por zona. */
  allowedZoneStates?: ZoneState[];
  /** Beneficio o capa: seguridad financiera, comunidad, seguro, regalos. */
  layer: "security" | "benefit";
}

/** Escudo activo para un usuario (activado en su sesión o contexto). */
export interface ActiveEscudo {
  id: EscudoId;
  label: string;
  icon: string;
  layer: "security" | "benefit";
  /** Cómo modifica el CerebroResult cuando está activo. */
  resultModifier?: CerebroResultModifier;
}

/** Cómo un escudo modifica el CerebroResult (mensaje, severidad, acciones). */
export interface CerebroResultModifier {
  /** Sufijo o mensaje adicional al result.message. */
  messageSuffix?: string;
  /** Ajuste de severidad si el resultado es permitido (ej. green → green con mensaje de escudo). */
  severityOverride?: "green" | "yellow" | "red";
  /** Acciones adicionales a añadir (ej. ACTIVATE_ESCUDO, navegación). */
  extraActions?: Array<{ type: string; payload?: Record<string, unknown>; label?: string }>;
}
