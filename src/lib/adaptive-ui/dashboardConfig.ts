/**
 * Configuración del dashboard adaptativo por rol y tier.
 * Trabajador (Gratis/Básico): Trabajo, Calificación, Escudos, Beneficios.
 * Mbareté: Ruedas, Territorio, Ganancias, Reclutamiento.
 * PYME/Enterprise: Vacante, Talentos, Pagos, Analytics.
 */

import type { RoleId } from "@/lib/auth";
import type {
  DashboardConfig,
  QuadrantItem,
  SubscriptionTier,
  MainActionId,
} from "./types";

function q(
  id: MainActionId,
  label: string,
  href: string,
  icon: string,
  description?: string
): QuadrantItem {
  return { id, label, href, icon, description };
}

/** Trabajador (Valé, Capeto, Kavaju): foco oportunidades y escudos. */
const TRABAJADOR_QUADRANTS: [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem] = [
  q("Buscar_Trabajo", "Buscar trabajo", "/mapa", "🔍", "Empleos y ofertas cerca"),
  q("Mi_Calificacion", "Mi Calificación", "/profile", "⭐", "Rating y cumplidor %"),
  q("Mis_Escudos", "Mis Escudos", "/escudos", "🛡️", "Insurtech, Fintech, Regalos, Comunidad"),
  q("Beneficios_Sponsors", "Beneficios / Sponsors", "/comunidad", "🎁", "Promos y referidos"),
];

/** Mbareté: foco gestión y liquidez. */
const MBARETE_QUADRANTS: [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem] = [
  q("Mis_Ruedas", "Mis Ruedas", "/dashboard", "👥", "Gestión de gente"),
  q("Mi_Territorio", "Mi Territorio", "/mapa", "🗺️", "Mapa simplificado"),
  q("Panel_Ganancias", "Panel Ganancias", "/wallet", "💰", "Comisiones y liquidez"),
  q("Reclutamiento", "Reclutamiento", "/mapa", "➕", "Sumar a la cuadrilla"),
];

/** PYME / Enterprise: foco contratación y productividad. */
const PYME_QUADRANTS: [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem] = [
  q("Publicar_Vacante", "Publicar Vacante", "/mapa", "📋", "Oferta de trabajo"),
  q("Filtro_Talentos", "Filtro Talentos", "/mapa", "🏆", "Ranking Mbareté"),
  q("Gestion_Pagos", "Gestión de Pagos", "/wallet", "💳", "Pagos y acuerdos"),
  q("Analytics_Marca", "Analytics Marca", "/dashboard", "📊", "Métricas y reportes"),
];

/** Cliente (contratante individual): similar a trabajador pero con foco en buscar y contratar. */
const CLIENTE_QUADRANTS: [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem] = [
  q("Buscar_Trabajo", "Buscar Trabajadores", "/mapa", "🔍", "Encontrar talento"),
  q("Mi_Calificacion", "Mi Perfil", "/profile", "⭐", "Tu perfil de contratante"),
  q("Mis_Escudos", "Seguro Colectivo", "/escudos", "🛡️", "Protección y escudos"),
  q("Beneficios_Sponsors", "Beneficios", "/comunidad", "🎁", "Promos"),
];

function getQuadrantsForRole(role: RoleId): [QuadrantItem, QuadrantItem, QuadrantItem, QuadrantItem] {
  switch (role) {
    case "mbarete":
      return MBARETE_QUADRANTS;
    case "pyme":
    case "enterprise":
      return PYME_QUADRANTS;
    case "cliente":
      return CLIENTE_QUADRANTS;
    case "vale":
    case "capeto":
    case "kavaju":
    default:
      return TRABAJADOR_QUADRANTS;
  }
}

function getMainActionsForRole(role: RoleId): MainActionId[] {
  switch (role) {
    case "mbarete":
      return ["Mis_Ruedas", "Gestion_Liquidez", "Mapa_Territorio", "Escudo_Lider"];
    case "pyme":
    case "enterprise":
      return ["Publicar_Vacante", "Filtro_Talentos", "Gestion_Pagos", "Analytics_Marca"];
    case "cliente":
      return ["Buscar_Trabajo", "Mi_Calificacion", "Mis_Escudos", "Beneficios_Sponsors"];
    case "vale":
    case "capeto":
    case "kavaju":
    default:
      return ["Buscar_Trabajo", "Mi_Calificacion", "Mis_Escudos", "Beneficios_Sponsors"];
  }
}

function getSearchPlaceholder(role: RoleId): string {
  if (role === "pyme" || role === "enterprise") return "Buscar trabajadores con YAPÓ";
  return "Buscar con YAPÓ";
}

/** Placeholder YAPÓ AI Smart-Bar por rol (Layout Maestro: Cerebro Central). Sustituir {name} en cliente. */
function getSmartBarPlaceholder(role: RoleId): string {
  switch (role) {
    case "vale":
    case "capeto":
    case "kavaju":
    case "mbarete":
      return "Hola {name}, ¿qué trabajo buscamos hoy?";
    case "cliente":
      return "¿Necesitás un profesional hoy? Preguntale a YAPÓ AI.";
    case "pyme":
      return "¿Cuántos aplicantes nuevos tenés para [Vacante Abierta]?";
    case "enterprise":
      return "Tu reporte semanal de talento está listo. ¿Deseas verlo?";
    default:
      return "¿Qué necesitás hoy? Preguntale a YAPÓ AI.";
  }
}

/** Sugerencias rápidas debajo de la Smart-Bar por rol. */
function getQuickSuggestions(role: RoleId): string[] {
  switch (role) {
    case "vale":
    case "capeto":
    case "kavaju":
      return ["Buscar empleo cerca", "Ver mis postulaciones", "Top ofertas hoy"];
    case "mbarete":
      return ["Mi equipo", "Ganancias del mes", "Reclutar en mi zona"];
    case "cliente":
      return ["Necesito un electricista", "Profesionales mejor calificados", "Presupuesto para obra"];
    case "pyme":
    case "enterprise":
      return ["Candidatos recientes", "Publicar vacante", "Reporte de talento"];
    default:
      return ["Buscar con YAPÓ", "Ver ofertas", "Mi perfil"];
  }
}

function getEscudoLabel(role: RoleId): string {
  if (role === "pyme" || role === "enterprise") return "Seguro Colectivo Activo";
  return "Mis Escudos";
}

/** Color principal por rol (puede extenderse por tier). */
function getPrimaryColor(role: RoleId, _tier: SubscriptionTier): string {
  switch (role) {
    case "mbarete":
      return "#003366";
    case "pyme":
    case "enterprise":
      return "#0d47a1";
    default:
      return "#003366";
  }
}

/**
 * Devuelve la configuración del dashboard para el rol y tier dados.
 * Usado por la API /api/adaptive-ui/config y por componentes que necesitan la UI adaptativa.
 */
export function getDashboardConfig(
  role: RoleId,
  tier: SubscriptionTier
): DashboardConfig {
  const quadrants = getQuadrantsForRole(role);
  const showSponsors = tier === "Gratis" || tier === "Basico" || role === "vale" || role === "capeto";
  return {
    primary_color: getPrimaryColor(role, tier),
    main_actions: getMainActionsForRole(role),
    quadrants,
    show_sponsors: showSponsors,
    map_focus: "Paraguay_Only",
    search_placeholder: getSearchPlaceholder(role),
    smart_bar_placeholder: getSmartBarPlaceholder(role),
    quick_suggestions: getQuickSuggestions(role),
    escudo_label: getEscudoLabel(role),
  };
}

/**
 * Convierte slug de plan (vale, capeto, etc.) a SubscriptionTier.
 */
export function planSlugToTier(slug: string | null | undefined): SubscriptionTier {
  if (!slug) return "Gratis";
  const s = slug.toLowerCase();
  if (s === "enterprise") return "Enterprise";
  if (s === "mbarete" || s === "pyme" || s === "premium") return "Premium";
  if (s === "capeto" || s === "kavaju" || s === "basico") return "Basico";
  return "Gratis";
}
