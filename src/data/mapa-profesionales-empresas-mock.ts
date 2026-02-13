/**
 * Mock: profesionales y empresas (PyME/Enterprise) por barrio para el mapa.
 * Incluye identificaciones, badges, estrellas, historial/videos y ejemplos de PyMEs detectadas.
 * Se completan con profesionales ficticios por oficio (OFICIOS_20) en cada barrio.
 */
import { OFICIOS_20 } from "./mapa-funcionalidades-busqueda";

export interface ProfesionalEnZona {
  userId: string;
  name: string;
  profession: string;
  rating: number;
  image?: string | null;
  role: string;
  verified: boolean;
  barrioId: string;
  /** Identificación verificada (documento). */
  documentVerified?: boolean;
  /** Badges: Top rated, Puntual, Certificado, etc. */
  badges?: string[];
  /** Cantidad de videos/reels en el perfil. */
  videoCount?: number;
  /** Resumen de historial (ej. "3 años en el rubro"). */
  workHistory?: string;
  /** Sello Profesional Matriculado (ANDE, MOPC) — Filtro Mbareté. */
  matriculado?: "ANDE" | "MOPC";
}

export interface EmpresaEnZona {
  userId: string;
  name: string;
  type: "pyme" | "enterprise";
  ruc?: string | null;
  buscan: string[];
  contacto?: string | null;
  barrioId: string;
  /** Si fue detectada por el sistema en la zona (ejemplo para demo). */
  detectada?: boolean;
  /** Sector o rubro principal de la empresa. */
  sector?: string;
}

const PROFESIONALES_POR_BARRIO: Record<string, ProfesionalEnZona[]> = {
  "asuncion-botanic": [
    { userId: "prof-1", name: "Juan P.", profession: "Electricista", rating: 4.8, image: null, role: "Valé", verified: true, barrioId: "asuncion-botanic", documentVerified: true, badges: ["Top rated", "Puntual", "Certificado"], videoCount: 4, workHistory: "5 años en el rubro", matriculado: "ANDE" },
    { userId: "prof-2", name: "María G.", profession: "Limpieza", rating: 4.5, image: null, role: "Capeto", verified: true, barrioId: "asuncion-botanic", documentVerified: true, badges: ["Recomendada", "Cliente frecuente"], videoCount: 2, workHistory: "3 años" },
    { userId: "prof-3", name: "Carlos R.", profession: "Plomería", rating: 4.2, image: null, role: "Valé", verified: false, barrioId: "asuncion-botanic", documentVerified: false, badges: [], videoCount: 1, workHistory: "1 año", matriculado: "MOPC" },
  ],
  "asuncion-sajonia": [
    { userId: "prof-4", name: "Ana L.", profession: "Empleada doméstica", rating: 4.9, image: null, role: "Valé", verified: true, barrioId: "asuncion-sajonia", documentVerified: true, badges: ["Top rated", "Verificada", "Experiencia"], videoCount: 5, workHistory: "8 años" },
    { userId: "prof-5", name: "Pedro S.", profession: "Carpintero", rating: 4.6, image: null, role: "Capeto", verified: true, barrioId: "asuncion-sajonia", documentVerified: true, badges: ["Certificado", "Puntual"], videoCount: 3, workHistory: "6 años" },
  ],
  "fdm-centro": [
    { userId: "prof-6", name: "Lucía M.", profession: "Electricista", rating: 4.7, image: null, role: "Valé", verified: true, barrioId: "fdm-centro", documentVerified: true, badges: ["Top rated", "Certificado"], videoCount: 4, workHistory: "4 años" },
    { userId: "prof-7", name: "Roberto D.", profession: "Panadero", rating: 4.4, image: null, role: "Valé", verified: false, barrioId: "fdm-centro", documentVerified: false, badges: ["Nuevo"], videoCount: 0, workHistory: "2 años" },
  ],
  "lambare-centro": [
    { userId: "prof-8", name: "Fernando T.", profession: "Delivery", rating: 4.5, image: null, role: "Valé", verified: true, barrioId: "lambare-centro", documentVerified: true, badges: ["Rápido", "Puntual"], videoCount: 2, workHistory: "3 años" },
  ],
  "cde-centro": [
    { userId: "prof-9", name: "Silvia V.", profession: "Ventas", rating: 4.8, image: null, role: "Valé", verified: true, barrioId: "cde-centro", documentVerified: true, badges: ["Top rated", "Experiencia"], videoCount: 6, workHistory: "7 años" },
    { userId: "prof-10", name: "Miguel A.", profession: "Contador", rating: 4.6, image: null, role: "Capeto", verified: true, barrioId: "cde-centro", documentVerified: true, badges: ["Certificado", "Puntual"], videoCount: 3, workHistory: "10 años" },
  ],
};

const EMPRESAS_POR_BARRIO: Record<string, EmpresaEnZona[]> = {
  "asuncion-botanic": [
    { userId: "emp-1", name: "Construcciones Norte S.A.", type: "enterprise", ruc: "80012345-6", buscan: ["Electricista", "Albañilería", "Pintor"], contacto: "021 123 456", barrioId: "asuncion-botanic", detectada: true, sector: "Construcción" },
    { userId: "emp-2", name: "Limpieza Express", type: "pyme", buscan: ["Empleada doméstica", "Limpieza"], contacto: "0981 111 222", barrioId: "asuncion-botanic", detectada: true, sector: "Limpieza" },
  ],
  "asuncion-sajonia": [
    { userId: "emp-3", name: "Carpintería Central", type: "pyme", buscan: ["Carpintero", "Ayudante"], barrioId: "asuncion-sajonia", detectada: true, sector: "Carpintería" },
  ],
  "fdm-centro": [
    { userId: "emp-4", name: "Panadería Santa Rosa", type: "pyme", buscan: ["Panadero", "Vendedor"], contacto: "021 555 123", barrioId: "fdm-centro", detectada: true, sector: "Alimentación" },
    { userId: "emp-5", name: "Servicios Eléctricos FdM", type: "pyme", buscan: ["Electricista"], barrioId: "fdm-centro", detectada: true, sector: "Electricidad" },
  ],
  "lambare-centro": [
    { userId: "emp-6", name: "Logística Lambaré", type: "pyme", buscan: ["Delivery", "Mecánico", "Conductor"], barrioId: "lambare-centro", detectada: true, sector: "Logística" },
  ],
  "cde-centro": [
    { userId: "emp-7", name: "Comercial del Este S.A.", type: "enterprise", ruc: "80099999-1", buscan: ["Ventas", "Contador", "Administrativo"], contacto: "061 200 300", barrioId: "cde-centro", detectada: true, sector: "Comercio" },
  ],
};

const DEFAULT_EMPRESAS: EmpresaEnZona[] = [
  { userId: "demo-e", name: "Empresa en la zona", type: "pyme", buscan: ["Consultar ofertas"], barrioId: "", detectada: false },
];

/** Nombres ficticios para generar profesionales por oficio/barrio (determinista por índice). */
const NOMBRES_FICTICIOS = [
  "Juan", "María", "Carlos", "Ana", "Pedro", "Lucía", "Roberto", "Fernanda", "Miguel", "Silvia",
  "José", "Patricia", "Luis", "Laura", "Ricardo", "Carmen", "Diego", "Elena", "Andrés", "Sofía",
  "Pablo", "Valentina", "Martín", "Isabel", "Jorge", "Adriana", "Daniel", "Claudia", "Francisco", "Mónica",
];

/** Genera 2 profesionales ficticios por oficio para un barrio (para que cada botón de oficio tenga resultados). */
function generarProfesionalesFicticios(barrioId: string): ProfesionalEnZona[] {
  const list: ProfesionalEnZona[] = [];
  let idx = 0;
  for (const oficio of OFICIOS_20) {
    for (let i = 0; i < 2; i++) {
      const seed = barrioId.length + oficio.length + idx;
      const nombre = NOMBRES_FICTICIOS[(seed + idx * 7) % NOMBRES_FICTICIOS.length];
      const apellido = NOMBRES_FICTICIOS[(seed + idx * 11 + 1) % NOMBRES_FICTICIOS.length];
      const rating = 3.5 + (seed % 15) / 10;
      const verified = seed % 3 === 0;
      const documentVerified = seed % 4 === 0;
      const matriculado = oficio === "Electricista" && i === 0 ? "ANDE" : oficio === "Plomería" && i === 1 ? "MOPC" : undefined;
      list.push({
        userId: `mock-${barrioId}-${oficio.replace(/\s+/g, "-")}-${i}`,
        name: `${nombre} ${apellido}.`,
        profession: oficio,
        rating: Math.round(rating * 10) / 10,
        image: null,
        role: "Valé",
        verified,
        barrioId,
        documentVerified,
        badges: verified ? ["Puntual"] : [],
        videoCount: (seed % 4),
        workHistory: `${(seed % 8) + 1} años`,
        matriculado,
      });
      idx++;
    }
  }
  return list;
}

/** Orden por calidad (Filtro Mbareté): matriculado primero, luego ID verificado, luego rating. */
function sortByQuality(list: ProfesionalEnZona[]): ProfesionalEnZona[] {
  return [...list].sort((a, b) => {
    const aMat = a.matriculado ? 1 : 0;
    const bMat = b.matriculado ? 1 : 0;
    if (bMat !== aMat) return bMat - aMat;
    const aV = a.documentVerified === true ? 1 : 0;
    const bV = b.documentVerified === true ? 1 : 0;
    if (bV !== aV) return bV - aV;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}

export function getProfesionalesPorBarrio(barrioId: string): ProfesionalEnZona[] {
  const base = PROFESIONALES_POR_BARRIO[barrioId] ?? [];
  const ficticios = generarProfesionalesFicticios(barrioId);
  const byUserId = new Map<string, ProfesionalEnZona>();
  for (const p of [...base, ...ficticios]) {
    byUserId.set(p.userId, p);
  }
  return sortByQuality(Array.from(byUserId.values()));
}

export function getEmpresasPorBarrio(barrioId: string): EmpresaEnZona[] {
  return EMPRESAS_POR_BARRIO[barrioId] ?? DEFAULT_EMPRESAS;
}
