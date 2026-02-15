/**
 * GET /api/profile/public/[userId]
 * Perfil público de un usuario (para ver desde el mapa: profesionales y empresas).
 * Incluye perfil completo (identidad, conectividad, laboral, estudios, preclasificación) para profesionales.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPerfilCompletoByUserId } from "@/data/perfil-completo-mock";

const MOCK_PUBLIC: Record<string, { name: string; role: string; workType: string; territory: string; isEmpresa: boolean; buscan?: string[] }> = {
  "PY-102938": { name: "Carlos R.", role: "vale", workType: "Plomería", territory: "Pitiantuta, Fernando de la Mora", isEmpresa: false },
  "PY-204851": { name: "María González", role: "mbarete", workType: "Electricidad", territory: "Sajonia, Asunción", isEmpresa: false },
  "PY-301662": { name: "Ana Martínez", role: "vale", workType: "Enfermería domiciliaria", territory: "Santa Ana, Lambaré", isEmpresa: false },
  "PY-405123": { name: "Rosa B.", role: "vale", workType: "Limpieza", territory: "Sajonia, Asunción", isEmpresa: false },
  "prof-1": { name: "Juan P.", role: "vale", workType: "Electricista", territory: "Botánico, Asunción", isEmpresa: false },
  "prof-2": { name: "María G.", role: "capeto", workType: "Limpieza", territory: "Botánico, Asunción", isEmpresa: false },
  "prof-3": { name: "Carlos R.", role: "vale", workType: "Plomería", territory: "Botánico, Asunción", isEmpresa: false },
  "prof-4": { name: "Ana L.", role: "vale", workType: "Empleada doméstica", territory: "Sajonia, Asunción", isEmpresa: false },
  "prof-5": { name: "Pedro S.", role: "capeto", workType: "Carpintero", territory: "Sajonia, Asunción", isEmpresa: false },
  "prof-6": { name: "Lucía M.", role: "vale", workType: "Electricista", territory: "Fernando de la Mora", isEmpresa: false },
  "prof-7": { name: "Roberto D.", role: "vale", workType: "Panadero", territory: "Fernando de la Mora", isEmpresa: false },
  "prof-8": { name: "Fernando T.", role: "vale", workType: "Delivery", territory: "Lambaré", isEmpresa: false },
  "prof-9": { name: "Silvia V.", role: "vale", workType: "Ventas", territory: "Ciudad del Este", isEmpresa: false },
  "prof-10": { name: "Miguel A.", role: "capeto", workType: "Contador", territory: "Ciudad del Este", isEmpresa: false },
  "emp-1": { name: "Construcciones Norte S.A.", role: "enterprise", workType: "Construcción", territory: "Botánico", isEmpresa: true, buscan: ["Electricista", "Albañilería", "Pintor"] },
  "emp-2": { name: "Limpieza Express", role: "pyme", workType: "Limpieza", territory: "Botánico", isEmpresa: true, buscan: ["Empleada doméstica", "Limpieza"] },
  "emp-3": { name: "Carpintería Central", role: "pyme", workType: "Carpintería", territory: "Sajonia", isEmpresa: true, buscan: ["Carpintero", "Ayudante"] },
  "emp-4": { name: "Panadería Santa Rosa", role: "pyme", workType: "Panadería", territory: "FdM", isEmpresa: true, buscan: ["Panadero", "Vendedor"] },
  "emp-5": { name: "Servicios Eléctricos FdM", role: "pyme", workType: "Electricidad", territory: "FdM", isEmpresa: true, buscan: ["Electricista"] },
  "emp-6": { name: "Logística Lambaré", role: "pyme", workType: "Logística", territory: "Lambaré", isEmpresa: true, buscan: ["Delivery", "Mecánico", "Conductor"] },
  "emp-7": { name: "Comercial del Este S.A.", role: "enterprise", workType: "Comercio", territory: "CDE", isEmpresa: true, buscan: ["Ventas", "Contador", "Administrativo"] },
};

/** Datos extendidos para profesionales: rating, badges, documento, videos (perfil público). */
const MOCK_PROFESIONAL_EXTRA: Record<string, { rating: number; verified: boolean; documentVerified: boolean; badges: string[]; videoCount: number; workHistory: string; videos: { id: string; title: string }[] }> = {
  "prof-1": { rating: 4.8, verified: true, documentVerified: true, badges: ["Top rated", "Puntual", "Certificado"], videoCount: 4, workHistory: "5 años en el rubro", videos: [{ id: "v1", title: "Instalación residencial" }, { id: "v2", title: "Tablero eléctrico" }, { id: "v3", title: "Recomendaciones seguridad" }, { id: "v4", title: "Presentación" }] },
  "prof-2": { rating: 4.5, verified: true, documentVerified: true, badges: ["Recomendada", "Cliente frecuente"], videoCount: 2, workHistory: "3 años", videos: [{ id: "v5", title: "Limpieza profunda" }, { id: "v6", title: "Presentación" }] },
  "prof-3": { rating: 4.2, verified: false, documentVerified: false, badges: [], videoCount: 1, workHistory: "1 año", videos: [{ id: "v7", title: "Trabajos realizados" }] },
  "prof-4": { rating: 4.9, verified: true, documentVerified: true, badges: ["Top rated", "Verificada", "Experiencia"], videoCount: 5, workHistory: "8 años", videos: [{ id: "v8", title: "Cuidado del hogar" }, { id: "v9", title: "Recomendaciones" }, { id: "v10", title: "Presentación" }, { id: "v11", title: "Testimonio cliente" }, { id: "v12", title: "Tips limpieza" }] },
  "prof-5": { rating: 4.6, verified: true, documentVerified: true, badges: ["Certificado", "Puntual"], videoCount: 3, workHistory: "6 años", videos: [{ id: "v13", title: "Muebles a medida" }, { id: "v14", title: "Restauración" }, { id: "v15", title: "Presentación" }] },
  "prof-6": { rating: 4.7, verified: true, documentVerified: true, badges: ["Top rated", "Certificado"], videoCount: 4, workHistory: "4 años", videos: [{ id: "v16", title: "Instalaciones" }, { id: "v17", title: "Mantenimiento" }, { id: "v18", title: "Presentación" }, { id: "v19", title: "Seguridad" }] },
  "prof-7": { rating: 4.4, verified: false, documentVerified: false, badges: ["Nuevo"], videoCount: 0, workHistory: "2 años", videos: [] },
  "prof-8": { rating: 4.5, verified: true, documentVerified: true, badges: ["Rápido", "Puntual"], videoCount: 2, workHistory: "3 años", videos: [{ id: "v20", title: "Zona de cobertura" }, { id: "v21", title: "Presentación" }] },
  "prof-9": { rating: 4.8, verified: true, documentVerified: true, badges: ["Top rated", "Experiencia"], videoCount: 6, workHistory: "7 años", videos: [{ id: "v22", title: "Ventas" }, { id: "v23", title: "Atención al cliente" }, { id: "v24", title: "Presentación" }, { id: "v25", title: "Logros" }, { id: "v26", title: "Testimonio" }, { id: "v27", title: "Servicios" }] },
  "prof-10": { rating: 4.6, verified: true, documentVerified: true, badges: ["Certificado", "Puntual"], videoCount: 3, workHistory: "10 años", videos: [{ id: "v28", title: "Servicios contables" }, { id: "v29", title: "Asesoría" }, { id: "v30", title: "Presentación" }] },
  "PY-102938": { rating: 4.8, verified: true, documentVerified: false, badges: ["Puntual", "Insurtech"], videoCount: 3, workHistory: "5 años en el rubro", videos: [{ id: "py1", title: "Destranque cañería" }, { id: "py2", title: "Cambio llave" }, { id: "py3", title: "Instalación baño" }] },
  "PY-204851": { rating: 4.9, verified: true, documentVerified: true, badges: ["Top rated", "Certificado SNPP"], videoCount: 4, workHistory: "8 años", videos: [{ id: "py4", title: "Instalaciones industriales" }, { id: "py5", title: "Tableros" }] },
  "PY-301662": { rating: 5, verified: true, documentVerified: true, badges: ["Enfermería", "Cuidados"], videoCount: 5, workHistory: "6 años", videos: [{ id: "py6", title: "Atención domiciliaria" }] },
  "PY-405123": { rating: 4.6, verified: false, documentVerified: false, badges: ["Insurtech"], videoCount: 2, workHistory: "3 años", videos: [] },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId?.trim();
  if (!userId) return NextResponse.json({ error: "Falta userId" }, { status: 400 });

  const mock = MOCK_PUBLIC[userId];
  if (mock) {
    const extra = userId.startsWith("prof-") ? MOCK_PROFESIONAL_EXTRA[userId] : null;
    const perfilCompleto = !mock.isEmpresa ? getPerfilCompletoByUserId(userId) : null;
    return NextResponse.json({
      userId,
      name: mock.name,
      image: null,
      role: mock.role,
      whatsapp: userId === "prof-1" ? "595981123456" : null,
      profile: {
        country: "Paraguay",
        territory: mock.territory,
        workStatus: "Activo",
        workType: mock.workType,
        education: extra ? "Secundaria completa / Capacitación técnica" : null,
        certifications: extra?.badges?.includes("Certificado") ? "Curso técnico homologado" : null,
      },
      profileStatus: "OK",
      isEmpresa: mock.isEmpresa,
      buscan: mock.buscan ?? undefined,
      rating: extra?.rating ?? null,
      verified: extra?.verified ?? false,
      documentVerified: extra?.documentVerified ?? false,
      badges: extra?.badges ?? undefined,
      videoCount: extra?.videoCount ?? 0,
      workHistory: extra?.workHistory ?? undefined,
      videos: extra?.videos ?? undefined,
      perfilCompleto: perfilCompleto ?? undefined,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const role = user.role ?? "vale";
    const isEmpresa = role === "pyme" || role === "enterprise";

    return NextResponse.json({
      userId: user.id,
      name: user.name ?? "Usuario",
      image: user.image ?? null,
      role,
      whatsapp: user.whatsapp ?? null,
      profile: user.profile
        ? {
            country: user.profile.country,
            territory: user.profile.territory,
            workStatus: user.profile.workStatus,
            workType: user.profile.workType,
            education: user.profile.education,
            certifications: user.profile.certifications,
          }
        : null,
      profileStatus: user.profile?.profileStatus ?? null,
      isEmpresa,
    });
  } catch {
    return NextResponse.json({ error: "Error al cargar perfil" }, { status: 500 });
  }
}
