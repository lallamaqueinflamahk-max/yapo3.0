/**
 * Datos mock para secciones de perfil que aún no tienen backend:
 * planes de suscripción, sponsors, ofertas con bonificación, profesionales cerca (GPS).
 *
 * Planes alineados con onboarding YAPÓ: progresión por interacción, bioseguridad y beneficios.
 * Valé (básico) → Perfil completo → Verificado (bioseguridad + pagos) → Capeto → Kavaju → Mbareté.
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  level: string;
  /** Precio en PYG (número) o "0" gratis o "Consultar" */
  price: string;
  period: string;
  benefits: string[];
  /** Requisitos para acceder a este plan (se muestran al hacer clic en "Ver requisitos") */
  requirements: string[];
  highlighted?: boolean;
  role?: string;
}

/** Planes con requisitos y precios. Cuanto más beneficios, más acceso a datos de censo y mapa. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basico",
    name: "Básico",
    level: "basico",
    role: "vale",
    price: "20.000",
    period: "por mes",
    benefits: [
      "Perfil visible y 3 ofertas",
      "Chat básico",
      "Mapa: zonas básicas (semáforo territorial)",
    ],
    requirements: [
      "Registro con email o red social",
      "Aceptar términos y privacidad",
      "Pago: 20.000 PYG/mes",
    ],
  },
  {
    id: "vale",
    name: "Valé",
    level: "vale",
    role: "vale",
    price: "35.000",
    period: "por mes",
    benefits: [
      "Todo lo de Básico",
      "Feed personalizado y postulaciones",
      "Acceso a Comunidad",
      "Mapa: trabajadores por rubro, densidad, zonas de mejor desempeño",
    ],
    requirements: [
      "Cuenta Valé o superior",
      "Pago: 35.000 PYG/mes (incluye acceso a datos de mapa por rubro y desempeño)",
    ],
  },
  {
    id: "perfil-completo",
    name: "Perfil completo",
    level: "perfil",
    price: "0",
    period: "Gratis",
    benefits: [
      "Todo lo de Valé",
      "Ofertas personalizadas por zona",
      "Ubicación para ofertas cercanas (GPS)",
      "Semáforo territorial en tu zona",
      "Notificaciones de ofertas y mensajes",
    ],
    requirements: [
      "Tener cuenta Valé (básico)",
      "Completar perfil: teléfono (opcional), zona o ubicación",
      "Aceptar consentimiento de datos territoriales (si usás ubicación)",
      "Opcional: activar notificaciones (con consentimiento de comunicaciones)",
    ],
  },
  {
    id: "verificado",
    name: "Verificado (bioseguridad)",
    level: "verificado",
    price: "0",
    period: "Tras verificación",
    benefits: [
      "Documento y biometría verificados",
      "Billetera: cobrar y pagar seguro",
      "Transferencias y contratos",
      "Acceso a subsidios",
      "Escudos (Insurtech, Fintech, Regalos, Comunidad)",
      "Beneficios por usar la app",
    ],
    requirements: [
      "Tener perfil completo (Valé o superior)",
      "Aceptar consentimiento de verificación y biometría",
      "Subir documento: cédula (frente y dorso) o RUC si sos PyME/Enterprise",
      "Completar verificación biométrica (rostro) en el flujo indicado",
      "La verificación se exige al usar billetera, transferencia o activar rol laboral",
    ],
    highlighted: true,
  },
  {
    id: "capeto",
    name: "Capeto",
    level: "capeto",
    role: "capeto",
    price: "55.000",
    period: "por mes",
    benefits: [
      "Todo lo de Verificado",
      "Liderar cuadrilla de Valés",
      "Validar desempeño del equipo",
      "Métricas de tu cuadrilla",
      "Mapa: desempleados por barrio y por rubro (censo)",
    ],
    requirements: [
      "Estar verificado (bioseguridad completada)",
      "Ser validado como Capeto por un Kavaju o Mbareté de tu zona",
      "Tener historial activo como Valé (postulaciones, trabajos)",
      "Aceptar responsabilidades de líder de cuadrilla",
    ],
  },
  {
    id: "kavaju",
    name: "Kavaju",
    level: "kavaju",
    role: "kavaju",
    price: "85.000",
    period: "por mes",
    benefits: [
      "Todo lo de Capeto",
      "Supervisar varias cuadrillas",
      "Reportes avanzados de tu área",
      "Mapa: zonas rojas (riesgo y prioridad de intervención)",
    ],
    requirements: [
      "Ser Capeto activo con cuadrilla validada",
      "Ser designado Kavaju por un Mbareté del territorio",
      "Cumplir métricas de supervisión y moderación",
      "Aceptar responsabilidades de supervisión de zona",
    ],
  },
  {
    id: "mbarete",
    name: "Mbareté",
    level: "mbarete",
    role: "mbarete",
    price: "0",
    period: "Máximo nivel",
    benefits: [
      "Todo lo de Kavaju",
      "Control del territorio (cuadrillas y mapas)",
      "Beca Laboral (salud, cursos, insumos)",
      "Prioridad en ofertas grandes y contratos",
      "Semáforo de Gestión Territorial (Verde/Amarillo/Rojo)",
      "Calificación de Kavajus, Capetos y Valés",
    ],
    requirements: [
      "Ser Kavaju activo en el territorio",
      "Designación por gobernanza YAPÓ o programa institucional",
      "Acceso al Semáforo de Gestión Territorial",
      "Responsabilidad sobre Beca Laboral y reportes del territorio",
    ],
  },
  {
    id: "cliente",
    name: "Cliente",
    level: "cliente",
    role: "cliente",
    price: "0",
    period: "Contratante",
    benefits: [
      "Publicar ofertas de trabajo",
      "Contratar trabajadores (Valés, Capetos)",
      "Chat con postulantes",
      "Perfil de contratante",
    ],
    requirements: [
      "Crear cuenta y elegir rol Contratante / Contrato trabajadores",
      "Completar perfil de contratante (nombre, contacto)",
      "Aceptar términos para publicar ofertas y contratar",
    ],
  },
  {
    id: "pyme",
    name: "PyME",
    level: "pyme",
    role: "pyme",
    price: "249.000",
    period: "por mes",
    benefits: [
      "Todo lo de Cliente",
      "Gestionar ofertas y equipos",
      "Datos verificados (RUC, RRHH)",
      "Mapa: demanda por rubro y todas las capas de censo",
    ],
    requirements: [
      "RUC vigente y datos de empresa verificados",
      "Suscripción PyME: 249.000 PYG/mes",
      "Aceptar condiciones para múltiples ofertas y equipos",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    level: "enterprise",
    role: "enterprise",
    price: "549.000",
    period: "por mes",
    benefits: [
      "Todo lo de PyME",
      "Contratos masivos y planillas al Ministerio",
      "Múltiples sedes",
      "Mapa: datos completos de censo y exportación",
    ],
    requirements: [
      "Cumplir requisitos de PyME",
      "Suscripción Enterprise: 549.000 PYG/mes (o plan corporativo a consultar)",
      "Carga de planillas al sistema (obrero patronal) cuando aplique",
      "Contrato marco con YAPÓ para múltiples sedes y licitaciones",
    ],
  },
];

export interface SponsorEntry {
  id: string;
  name: string;
  logo?: string;
  description: string;
  link?: string;
}

export const SPONSORS_MOCK: SponsorEntry[] = [
  { id: "s1", name: "Partner YAPÓ", description: "Aliados que apoyan la empleabilidad.", link: "#" },
  { id: "s2", name: "Programa Laboral", description: "Bonificaciones y capacitación.", link: "#" },
];

export interface ProductOfferBonus {
  id: string;
  title: string;
  description: string;
  bonus: string;
  price?: string;
}

export const PRODUCT_OFFERS_BONUS_MOCK: ProductOfferBonus[] = [
  { id: "o1", title: "Kit herramientas", description: "Kit básico para oficios.", bonus: "15% bonificación con puntos YAPÓ", price: "120.000" },
  { id: "o2", title: "Curso certificado", description: "Capacitación en seguridad laboral.", bonus: "20% descuento para usuarios verificados", price: "80.000" },
];

export interface ProfessionalNearby {
  id: string;
  name: string;
  profession: string;
  rating: number;
  distance: string;
  photo?: string | null;
  role: string;
  verified: boolean;
}

export function getProfessionalsNearbyMock(): ProfessionalNearby[] {
  return [
    { id: "pn1", name: "Juan P.", profession: "Electricista", rating: 4.8, distance: "0.5 km", role: "Valé", verified: true },
    { id: "pn2", name: "María G.", profession: "Limpieza", rating: 4.5, distance: "1.2 km", role: "Capeto", verified: true },
    { id: "pn3", name: "Carlos R.", profession: "Plomería", rating: 4.2, distance: "2 km", role: "Valé", verified: false },
  ];
}
