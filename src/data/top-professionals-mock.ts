/**
 * Top 20 profesionales por área (oficios, movilidad, cuidados, profesional).
 * Mock para UI; en producción vendría de API/backend.
 * Valores deterministas para evitar hydration mismatch (sin Math.random()).
 */

export type CategoryArea = "oficios" | "movilidad" | "cuidados" | "profesional";

export interface TopProfessionalEntry {
  id: string;
  name: string;
  role: string;
  category: CategoryArea;
  rating?: number;
  jobsCount?: number;
  /** Distancia en km (diseño predictivo: Time on Task, filtros de proximidad). */
  distanceKm?: number;
}

/** Pseudo-random determinista a partir de una semilla (mismo seed = mismo valor en server y client). */
function deterministic(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i) | 0;
  return Math.abs(h) / 2147483647;
}

function genOficios(): TopProfessionalEntry[] {
  const roles = ["Electricista", "Plomero/a", "Pintor/a", "Albañil", "Arreglos generales", "Carpintero/a", "Herrero", "Técnico refrigeración", "Gasista", "Instalador", "Soldador", "Chapista", "Mecánico automotor", "Tornero", "Fumigador", "Tapicero", "Vidriero", "Ceramista", "Yesero", "Techista"];
  return roles.slice(0, 20).map((role, i) => {
    const id = `oficios-${i + 1}`;
    const r = deterministic(id);
    const j = deterministic(id + "jobs");
    const d = deterministic(id + "km");
    return {
      id,
      name: `Profesional ${i + 1}`,
      role,
      category: "oficios" as const,
      rating: Math.round((4 + r * 0.9) * 10) / 10,
      jobsCount: 5 + Math.floor(j * 50),
      distanceKm: 1 + Math.floor(d * 24),
    };
  });
}

function genMovilidad(): TopProfessionalEntry[] {
  const roles = ["Mecánico", "Conductor", "Delivery", "Chapa y pintura", "Neumáticos", "Mecánico motos", "Grúa", "Lubricentro", "Electricista automotor", "Auxiliar mecánico", "Conductor camión", "Conductor particular", "Mensajero", "Repartidor", "Transporte escolar", "Mecánico diesel", "Diagnóstico electrónico", "Alineación y balanceo", "Tapizado automotor", "Detallado"];
  return roles.slice(0, 20).map((role, i) => {
    const id = `movilidad-${i + 1}`;
    const r = deterministic(id);
    const j = deterministic(id + "jobs");
    const d = deterministic(id + "km");
    return {
      id,
      name: `Profesional ${i + 1}`,
      role,
      category: "movilidad" as const,
      rating: Math.round((4 + r * 0.9) * 10) / 10,
      jobsCount: 10 + Math.floor(j * 80),
      distanceKm: 1 + Math.floor(d * 24),
    };
  });
}

function genCuidados(): TopProfessionalEntry[] {
  const roles = ["Limpieza", "Cuidado de personas", "Cocina", "Jardinería", "Cuidado mascotas", "Niñera", "Adulto mayor", "Enfermería domiciliaria", "Lavado y planchado", "Orden y limpieza oficinas", "Portería", "Seguridad", "Chef a domicilio", "Personal doméstico", "Compañía adultos mayores", "Paseador de perros", "Cuidador nocturno", "Acompañante terapéutico", "Limpieza profunda", "Organización del hogar"];
  return roles.slice(0, 20).map((role, i) => {
    const id = `cuidados-${i + 1}`;
    const r = deterministic(id);
    const j = deterministic(id + "jobs");
    const d = deterministic(id + "km");
    return {
      id,
      name: `Profesional ${i + 1}`,
      role,
      category: "cuidados" as const,
      rating: Math.round((4 + r * 0.9) * 10) / 10,
      jobsCount: 8 + Math.floor(j * 60),
      distanceKm: 1 + Math.floor(d * 24),
    };
  });
}

function genProfesional(): TopProfessionalEntry[] {
  const roles = ["Contador", "Diseño gráfico", "IT / Soporte", "Ventas", "Administrativo", "Abogado", "Asistente virtual", "Community manager", "Redactor", "Traductor", "Archivista", "Recursos humanos", "Analista datos", "Desarrollador", "Marketing digital", "Secretariado", "Asistente contable", "Asesor comercial", "Auditor", "Consultor"];
  return roles.slice(0, 20).map((role, i) => {
    const id = `profesional-${i + 1}`;
    const r = deterministic(id);
    const j = deterministic(id + "jobs");
    const d = deterministic(id + "km");
    return {
      id,
      name: `Profesional ${i + 1}`,
      role,
      category: "profesional" as const,
      rating: Math.round((4 + r * 0.9) * 10) / 10,
      jobsCount: 5 + Math.floor(j * 40),
      distanceKm: 1 + Math.floor(d * 24),
    };
  });
}

const OFICIOS_TOP = genOficios();
const MOVILIDAD_TOP = genMovilidad();
const CUIDADOS_TOP = genCuidados();
const PROFESIONAL_TOP = genProfesional();

export const TOP_PROFESSIONALS_BY_CATEGORY: Record<CategoryArea, TopProfessionalEntry[]> = {
  oficios: OFICIOS_TOP,
  movilidad: MOVILIDAD_TOP,
  cuidados: CUIDADOS_TOP,
  profesional: PROFESIONAL_TOP,
};

export const CATEGORY_AREA_LABELS: Record<CategoryArea, string> = {
  oficios: "Oficios",
  movilidad: "Movilidad",
  cuidados: "Cuidados",
  profesional: "Profesional",
};

export const CATEGORY_AREA_ORDER: CategoryArea[] = ["oficios", "movilidad", "cuidados", "profesional"];

/** Todas las entradas en una lista (para buscar por id). */
const ALL_ENTRIES: TopProfessionalEntry[] = [
  ...OFICIOS_TOP,
  ...MOVILIDAD_TOP,
  ...CUIDADOS_TOP,
  ...PROFESIONAL_TOP,
];

/** Obtener un profesional por id (para página de detalle). */
export function getProfessionalById(id: string): TopProfessionalEntry | null {
  return ALL_ENTRIES.find((e) => e.id === id) ?? null;
}
