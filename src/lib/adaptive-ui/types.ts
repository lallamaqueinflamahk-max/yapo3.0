/**
 * YAPÓ Adaptive Interface – Tipos para UI por rol y tier.
 * La interfaz cambia según User_Role y Subscription_Tier.
 */

import type { RoleId } from "@/lib/auth";

/** Nivel de suscripción: Gratis/Básico, Premium, Enterprise. */
export type SubscriptionTier = "Gratis" | "Basico" | "Premium" | "Enterprise";

/** Identificador de acción principal (Paraguayo directo, corto). */
export type MainActionId =
  | "Buscar_Chamba"
  | "Mi_Calificacion"
  | "Mis_Escudos"
  | "Beneficios_Sponsors"
  | "Mis_Ruedas"
  | "Mi_Territorio"
  | "Panel_Ganancias"
  | "Reclutamiento"
  | "Publicar_Vacante"
  | "Filtro_Talentos"
  | "Gestion_Pagos"
  | "Analytics_Marca"
  | "Escudo_Lider"
  | "Gestion_Liquidez"
  | "Mapa_Territorio";

export interface QuadrantItem {
  id: MainActionId;
  label: string;
  href: string;
  icon: string;
  description?: string;
}

export interface DashboardConfig {
  primary_color: string;
  main_actions: MainActionId[];
  quadrants: [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem];
  show_sponsors: boolean;
  map_focus: "Paraguay_Only";
  /** Placeholder del Cerebro: PYME busca trabajadores, Trabajador busca empleos/sponsors */
  search_placeholder: string;
  /** YAPÓ AI Smart-Bar: placeholder dinámico por rol (Diseño Maestro) */
  smart_bar_placeholder: string;
  /** Sugerencias rápidas para la Smart-Bar (por rol) */
  quick_suggestions: string[];
  /** Para PYME/Enterprise: mostrar "Seguro Colectivo Activo" en lugar de nivel de escudo individual */
  escudo_label: string;
}

export interface AdaptiveConfigPayload {
  user_id: string;
  role: RoleId;
  tier: SubscriptionTier;
  dashboard_config: DashboardConfig;
}
