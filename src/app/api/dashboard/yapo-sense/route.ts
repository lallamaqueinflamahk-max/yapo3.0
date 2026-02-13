/**
 * GET /api/dashboard/yapo-sense – YAPÓ-SENSE: métricas para Gobierno/Enterprise.
 * Filtros: departamento, ciudad.
 * Devuelve: % desempleo real en la app, rubros más buscados, profesionales con/sin certificación,
 * y "Huecos de Mercado" (barrios/rubros donde demanda > oferta).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next/config";
import { YAPO_PERFILES_MOCK } from "@/data/yapo-perfiles-mock";

export interface YapoSenseMetrics {
  departamento: string | null;
  ciudad: string | null;
  desempleoPorcentaje: number;
  rubrosMasBuscados: { rubro: string; pedidos: number }[];
  profesionalesConCertificacion: number;
  profesionalesSinCertificacion: number;
  totalProfesionales: number;
  huecosDeMercado: {
    barrio: string;
    ciudad: string;
    rubro: string;
    demandaActiva: number;
    profesionales: number;
    deficit: number;
    nivel: "alto" | "medio" | "bajo";
  }[];
}

/** Mock: rubros más pedidos (en prod desde PedidoGeo + agregación). */
const RUBROS_MAS_BUSCADOS_MOCK: { rubro: string; pedidos: number }[] = [
  { rubro: "Limpieza", pedidos: 420 },
  { rubro: "Electricidad", pedidos: 318 },
  { rubro: "Plomería", pedidos: 285 },
  { rubro: "Limpieza en Sajonia", pedidos: 180 },
  { rubro: "Enfermería domiciliaria", pedidos: 142 },
  { rubro: "Flete", pedidos: 98 },
  { rubro: "Pintura", pedidos: 87 },
];

/** Mock: huecos de mercado (demanda > oferta por barrio/rubro). */
const HUECOS_MOCK: YapoSenseMetrics["huecosDeMercado"] = [
  { barrio: "Sajonia", ciudad: "Asunción", rubro: "Limpieza", demandaActiva: 45, profesionales: 8, deficit: 37, nivel: "alto" },
  { barrio: "Pitiantuta", ciudad: "Fernando de la Mora", rubro: "Plomería", demandaActiva: 22, profesionales: 5, deficit: 17, nivel: "alto" },
  { barrio: "Santa Ana", ciudad: "Lambaré", rubro: "Enfermería", demandaActiva: 18, profesionales: 6, deficit: 12, nivel: "medio" },
  { barrio: "Zona Sur", ciudad: "Lambaré", rubro: "Electricidad", demandaActiva: 30, profesionales: 4, deficit: 26, nivel: "alto" },
  { barrio: "Centro", ciudad: "Asunción", rubro: "Flete", demandaActiva: 12, profesionales: 10, deficit: 2, nivel: "bajo" },
];

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const departamento = searchParams.get("departamento")?.trim() || null;
  const ciudad = searchParams.get("ciudad")?.trim() || null;

  // Desempleo %: mock (usuarios sin trabajo activo / total en la app en la zona)
  const desempleoPorcentaje = departamento === "Central" ? 12.4 : ciudad ? 11.8 : 13.1;

  // Rubros más buscados (filtrar por zona si se implementa)
  let rubrosMasBuscados = [...RUBROS_MAS_BUSCADOS_MOCK];
  if (ciudad) {
    rubrosMasBuscados = rubrosMasBuscados.map((r) => ({
      ...r,
      pedidos: Math.max(1, Math.floor(r.pedidos * (0.6 + Math.random() * 0.4))),
    }));
  }

  // Profesionales con/sin certificación (IPS o sello MEC/SNPP) desde perfiles mock
  const enZona = (p: (typeof YAPO_PERFILES_MOCK)[0]) => {
    if (departamento && p.ubicacion.departamento !== departamento) return false;
    if (ciudad && p.ubicacion.ciudad !== ciudad) return false;
    return true;
  };
  const perfilesZona = YAPO_PERFILES_MOCK.filter(enZona);
  const conCert = perfilesZona.filter(
    (p) => p.estatus_laboral.ips || p.insignias?.includes("sello_mec_snpp")
  ).length;
  const sinCert = perfilesZona.length - conCert;

  // Huecos de mercado: filtrar por departamento/ciudad
  let huecosDeMercado = HUECOS_MOCK;
  if (departamento) {
    huecosDeMercado = huecosDeMercado.filter(
      (h) => h.ciudad === "Asunción" || h.ciudad === "Lambaré" || h.ciudad === "Fernando de la Mora"
    );
    if (departamento !== "Central") huecosDeMercado = [];
  }
  if (ciudad) {
    huecosDeMercado = huecosDeMercado.filter((h) => h.ciudad === ciudad);
  }

  const body: YapoSenseMetrics = {
    departamento,
    ciudad,
    desempleoPorcentaje,
    rubrosMasBuscados,
    profesionalesConCertificacion: conCert,
    profesionalesSinCertificacion: sinCert,
    totalProfesionales: perfilesZona.length,
    huecosDeMercado,
  };

  return NextResponse.json(body);
}
