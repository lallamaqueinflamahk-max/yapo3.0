/**
 * Funcionalidades de búsqueda en el mapa (censo y estadísticas).
 * Cada funcionalidad define: qué métrica es, qué roles/planes pueden usarla,
 * y cómo se traducen los datos a colores (rojo / amarillo / verde).
 * Base de datos de sentido para PYME, Enterprise, Capeto, Mbareté, etc.
 */

export type RolId = "vale" | "capeto" | "kavaju" | "mbarete" | "cliente" | "pyme" | "enterprise";
export type PlanSlug = "basico" | "vale" | "capeto" | "kavaju" | "mbarete" | "pyme" | "enterprise";

/** Orden de planes de menor a mayor nivel (para comparar si un plan tiene acceso). */
export const PLAN_LEVEL: Record<PlanSlug, number> = {
  basico: 0,
  vale: 1,
  capeto: 2,
  kavaju: 3,
  mbarete: 4,
  pyme: 5,
  enterprise: 6,
};

/** Tipos de métrica de censo/estadística (delimitan búsqueda en el mapa por colores). */
export type MetricTypeCenso =
  | "trabajadores_por_rubro"       // cantidad de trabajadores por rubro por barrio
  | "desempleados_por_rubro"       // desempleados por rubro por barrio
  | "desempleados_por_barrio"      // total desempleados por barrio
  | "zonas_rojas"                  // zonas de alto riesgo / baja performance
  | "zonas_capacitacion"           // donde Mbareté debe capacitar a su equipo
  | "zonas_mejor_desempeno"        // mejor desempeño y calidad
  | "calidad_vales_mbarete"        // calidad de vales de un Mbareté por zona
  | "demanda_por_rubro"            // demanda (pedidos) por rubro por barrio
  | "densidad_profesionales"       // densidad de profesionales por zona
  | "pymes_detectadas"             // PyMEs/Enterprises detectadas y registradas por barrio
  | "profesionales_verificados_rubro"  // profesionales con identificación verificada por rubro
  | "ofertas_activas"              // ofertas de trabajo activas por barrio
  | "verificados_barrio"           // profesionales con documento verificado por barrio
  | "contratos_activos";           // contratos activos por zona (empleo formal)

export interface FuncionalidadBusqueda {
  id: string;
  metricType: MetricTypeCenso;
  label: string;
  description: string;
  /** Roles que pueden ver esta funcionalidad (si no tienen plan suficiente, se muestra bloqueada). */
  roles: RolId[];
  /** Plan mínimo para usar (sin restricción = basico). */
  planMinimo: PlanSlug;
  /** Significado de verde en el mapa para esta métrica. */
  verdeSignificado: string;
  /** Significado de amarillo. */
  amarilloSignificado: string;
  /** Significado de rojo. */
  rojoSignificado: string;
  /** Si la búsqueda puede filtrar por rubro (dropdown rubro). */
  filtraPorRubro: boolean;
  /** Icono corto para UI. */
  icon: string;
}

/**
 * Catálogo de funcionalidades de búsqueda: lo que tienen PYME, Enterprise, Capeto, Mbareté, etc.
 * Los filtros del mapa se construyen desde aquí; el acceso se delimita por rol y plan.
 */
export const FUNCIONALIDADES_BUSQUEDA: FuncionalidadBusqueda[] = [
  {
    id: "trabajadores-por-rubro",
    metricType: "trabajadores_por_rubro",
    label: "Trabajadores por rubro",
    description: "Cantidad de trabajadores registrados por rubro por barrio (censo).",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "vale",
    verdeSignificado: "Alta cantidad de trabajadores en el rubro",
    amarilloSignificado: "Cantidad media",
    rojoSignificado: "Pocos trabajadores en el rubro",
    filtraPorRubro: true,
    icon: "👷",
  },
  {
    id: "desempleados-por-barrio",
    metricType: "desempleados_por_barrio",
    label: "Desempleados por barrio",
    description: "Cantidad de trabajadores desempleados por barrio (censo).",
    roles: ["capeto", "kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "capeto",
    verdeSignificado: "Pocos desempleados (zona estable)",
    amarilloSignificado: "Desempleo medio",
    rojoSignificado: "Muchos desempleados (prioridad intervención)",
    filtraPorRubro: false,
    icon: "📊",
  },
  {
    id: "desempleados-por-rubro",
    metricType: "desempleados_por_rubro",
    label: "Desempleados por rubro",
    description: "Trabajadores desempleados por rubro por barrio.",
    roles: ["capeto", "kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "capeto",
    verdeSignificado: "Poco desempleo en el rubro",
    amarilloSignificado: "Desempleo medio en el rubro",
    rojoSignificado: "Alto desempleo en el rubro",
    filtraPorRubro: true,
    icon: "📉",
  },
  {
    id: "zonas-rojas",
    metricType: "zonas_rojas",
    label: "Zonas rojas (riesgo)",
    description: "Zonas de alto riesgo o baja performance (prioridad atención).",
    roles: ["kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "kavaju",
    verdeSignificado: "Zona estable",
    amarilloSignificado: "Zona con alertas",
    rojoSignificado: "Zona roja: alta prioridad",
    filtraPorRubro: false,
    icon: "🔴",
  },
  {
    id: "zonas-capacitacion",
    metricType: "zonas_capacitacion",
    label: "Zonas de capacitación",
    description: "Lugares donde el Mbareté debe capacitar a su equipo.",
    roles: ["mbarete", "pyme", "enterprise"],
    planMinimo: "mbarete",
    verdeSignificado: "Capacitación al día",
    amarilloSignificado: "Requiere refuerzo",
    rojoSignificado: "Alta prioridad de capacitación",
    filtraPorRubro: false,
    icon: "🎓",
  },
  {
    id: "zonas-mejor-desempeno",
    metricType: "zonas_mejor_desempeno",
    label: "Zonas de mejor desempeño",
    description: "Zonas con mejor desempeño y calidad (referencia).",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "vale",
    verdeSignificado: "Alto desempeño",
    amarilloSignificado: "Desempeño medio",
    rojoSignificado: "Bajo desempeño",
    filtraPorRubro: false,
    icon: "⭐",
  },
  {
    id: "calidad-vales-mbarete",
    metricType: "calidad_vales_mbarete",
    label: "Calidad de vales (Mbareté)",
    description: "Calidad de los vales de un Mbareté por zona.",
    roles: ["mbarete", "pyme", "enterprise"],
    planMinimo: "mbarete",
    verdeSignificado: "Alta calidad de vales",
    amarilloSignificado: "Calidad media",
    rojoSignificado: "Baja calidad / requiere apoyo",
    filtraPorRubro: false,
    icon: "🏅",
  },
  {
    id: "demanda-por-rubro",
    metricType: "demanda_por_rubro",
    label: "Demanda por rubro",
    description: "Pedidos y demanda activa por rubro por barrio.",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "pyme",
    verdeSignificado: "Alta demanda",
    amarilloSignificado: "Demanda media",
    rojoSignificado: "Baja demanda",
    filtraPorRubro: true,
    icon: "📈",
  },
  {
    id: "densidad-profesionales",
    metricType: "densidad_profesionales",
    label: "Densidad de profesionales",
    description: "Cantidad de profesionales por zona (oferta).",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "vale",
    verdeSignificado: "Alta densidad (más oferta)",
    amarilloSignificado: "Densidad media",
    rojoSignificado: "Baja densidad",
    filtraPorRubro: true,
    icon: "🗺️",
  },
  {
    id: "pymes-detectadas",
    metricType: "pymes_detectadas",
    label: "PyMEs detectadas por zona",
    description: "Empresas PyME y Enterprise detectadas y registradas por barrio.",
    roles: ["capeto", "kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "capeto",
    verdeSignificado: "Muchas PyMEs/Enterprises en la zona",
    amarilloSignificado: "Cantidad media de empresas",
    rojoSignificado: "Pocas empresas registradas",
    filtraPorRubro: false,
    icon: "🏢",
  },
  {
    id: "profesionales-verificados-rubro",
    metricType: "profesionales_verificados_rubro",
    label: "Profesionales verificados por rubro",
    description: "Profesionales con identificación verificada, tipificados por rubro.",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "vale",
    verdeSignificado: "Alta cantidad de verificados en el rubro",
    amarilloSignificado: "Cantidad media de verificados",
    rojoSignificado: "Pocos profesionales verificados en el rubro",
    filtraPorRubro: true,
    icon: "✅",
  },
  {
    id: "ofertas-activas",
    metricType: "ofertas_activas",
    label: "Ofertas activas por barrio",
    description: "Ofertas de trabajo publicadas y activas por zona.",
    roles: ["vale", "capeto", "kavaju", "mbarete", "cliente", "pyme", "enterprise"],
    planMinimo: "vale",
    verdeSignificado: "Muchas ofertas activas",
    amarilloSignificado: "Ofertas medias",
    rojoSignificado: "Pocas ofertas en la zona",
    filtraPorRubro: false,
    icon: "📋",
  },
  {
    id: "verificados-barrio",
    metricType: "verificados_barrio",
    label: "Verificados por barrio",
    description: "Profesionales con documento e identificación verificada por barrio.",
    roles: ["capeto", "kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "capeto",
    verdeSignificado: "Alta proporción de verificados",
    amarilloSignificado: "Proporción media",
    rojoSignificado: "Pocos verificados (prioridad validación)",
    filtraPorRubro: false,
    icon: "🪪",
  },
  {
    id: "contratos-activos",
    metricType: "contratos_activos",
    label: "Contratos activos por zona",
    description: "Contratos de trabajo activos (empleo formal) por barrio.",
    roles: ["kavaju", "mbarete", "pyme", "enterprise"],
    planMinimo: "kavaju",
    verdeSignificado: "Alta formalización",
    amarilloSignificado: "Formalización media",
    rojoSignificado: "Baja formalización",
    filtraPorRubro: false,
    icon: "📄",
  },
];

/** Rubros disponibles para filtros (alineado con servicios, planes y roles Yapó: Valé, Capeto, PyME, Enterprise). */
export const RUBROS_FILTRO = [
  /* Hogar y oficios */
  "Empleada doméstica",
  "Electricista",
  "Plomero",
  "Plomería",
  "Carpintero",
  "Pintor",
  "Albañil",
  "Arreglos generales",
  "Herrero",
  "Técnico refrigeración",
  "Gasista",
  "Instalador",
  "Soldador",
  "Chapista",
  "Yesero",
  "Techista",
  "Vidriero",
  "Ceramista",
  "Tapicero",
  "Fumigador",
  "Jardinería",
  "Limpieza",
  "Limpieza profunda",
  "Orden y limpieza oficinas",
  /* Alimentación y comercio */
  "Panadero",
  "Cocina",
  "Chef a domicilio",
  "Ventas",
  "Vendedor",
  "Delivery",
  "Repartidor",
  "Mensajero",
  /* Cuidado de personas y mascotas */
  "Cuidado personas",
  "Cuidado mascotas",
  "Niñera",
  "Adulto mayor",
  "Enfermería domiciliaria",
  "Lavado y planchado",
  "Personal doméstico",
  "Portería",
  "Seguridad",
  "Paseador de perros",
  "Cuidador nocturno",
  "Acompañante terapéutico",
  "Organización del hogar",
  /* Automotor y logística */
  "Mecánico",
  "Mecánico automotor",
  "Mecánico motos",
  "Mecánico diesel",
  "Conductor",
  "Conductor camión",
  "Conductor particular",
  "Chapa y pintura",
  "Neumáticos",
  "Grúa",
  "Lubricentro",
  "Electricista automotor",
  "Diagnóstico electrónico",
  "Alineación y balanceo",
  "Tapizado automotor",
  "Detallado",
  "Transporte escolar",
  /* Oficina, profesional y técnico */
  "Contador",
  "Administrativo",
  "Asistente virtual",
  "Community manager",
  "Recursos humanos",
  "Abogado",
  "Diseño gráfico",
  "IT / Soporte",
  "Desarrollador",
  "Analista datos",
  "Marketing digital",
  "Secretariado",
  "Asistente contable",
  "Asesor comercial",
  "Auditor",
  "Consultor",
  "Redactor",
  "Traductor",
  "Archivista",
  /* Construcción y obra */
  "Tornero",
  "Construcción",
  "Albañilería",
] as const;

export type RubroFiltro = (typeof RUBROS_FILTRO)[number];

/** 20 oficios fijos para búsqueda simple (Buscador YAPÓ). */
export const OFICIOS_20: readonly string[] = [
  "Electricista",
  "Plomería",
  "Limpieza",
  "Empleada doméstica",
  "Carpintero",
  "Pintor",
  "Delivery",
  "Mecánico",
  "Jardinería",
  "Panadero",
  "Ventas",
  "Contador",
  "Cuidado personas",
  "Albañil",
  "Costurera",
  "Refrigeración",
  "Gasista",
  "Albañilería",
  "Niñera",
  "Lavado y planchado",
  "IT / Soporte",
];

/** Icono por oficio para UI del mapa (emoji). */
export const OFICIOS_ICON: Record<string, string> = {
  "Empleada doméstica": "🧹",
  "Electricista": "⚡",
  "Plomería": "🔧",
  "Carpintero": "🪚",
  "Pintor": "🎨",
  "Jardinería": "🌿",
  "Panadero": "🍞",
  "Cuidado personas": "❤️",
  "Delivery": "🛵",
  "Mecánico": "🚗",
  "Ventas": "📊",
  "Contador": "💼",
  "Limpieza": "🧹",
  "Albañil": "🧱",
  "Costurera": "🧵",
  "Albañilería": "🧱",
  "Refrigeración": "❄️",
  "Gasista": "🔥",
  "Niñera": "👶",
  "Lavado y planchado": "👕",
  "IT / Soporte": "💻",
};

/** Categorías destacadas para chips (alias de OFICIOS_20 para compatibilidad). */
export const CATEGORIAS_DESTACADAS: readonly string[] = OFICIOS_20;

/**
 * Indica si el usuario (rol + plan) puede usar esta funcionalidad.
 */
export function puedeUsarFuncionalidad(
  func: FuncionalidadBusqueda,
  role: RolId,
  planSlug: PlanSlug | null
): boolean {
  if (!func.roles.includes(role)) return false;
  const plan = planSlug ?? "basico";
  const nivelPlan = PLAN_LEVEL[plan as PlanSlug] ?? 0;
  const nivelMin = PLAN_LEVEL[func.planMinimo];
  return nivelPlan >= nivelMin;
}

/**
 * Funcionalidades visibles para el rol/plan: permitidas y bloqueadas (para mostrar "requiere plan X").
 */
export function getFuncionalidadesParaRolPlan(
  role: RolId,
  planSlug: PlanSlug | null
): { permitidas: FuncionalidadBusqueda[]; bloqueadas: FuncionalidadBusqueda[] } {
  const permitidas: FuncionalidadBusqueda[] = [];
  const bloqueadas: FuncionalidadBusqueda[] = [];
  for (const f of FUNCIONALIDADES_BUSQUEDA) {
    if (!f.roles.includes(role)) continue;
    if (puedeUsarFuncionalidad(f, role, planSlug)) permitidas.push(f);
    else bloqueadas.push(f);
  }
  return { permitidas, bloqueadas };
}
