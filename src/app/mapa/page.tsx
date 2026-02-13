"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import SearchPillar, { type QuickFilterType } from "@/components/dashboard/SearchPillar";
import MapaRealYapoDynamic from "@/components/dashboard/MapaRealYapoDynamic";
import {
  SEMAPHORES_MAP,
  getStateStyle,
  type SemaphoreDepartamento,
  type SemaphoreCiudad,
  type SemaphoreBarrio,
  type SemaphoreState,
} from "@/data/semaphores-map";
import { OFICIOS_20 } from "@/data/mapa-funcionalidades-busqueda";

export interface ProfesionZona {
  label: string;
  count: number;
  icon: string;
}

interface ProfesionalEnZona {
  userId: string;
  name: string;
  profession: string;
  rating: number;
  image?: string | null;
  role: string;
  verified: boolean;
  barrioId: string;
  documentVerified?: boolean;
  matriculado?: "ANDE" | "MOPC";
  badges?: string[];
  videoCount?: number;
  workHistory?: string;
}

interface EmpresaEnZona {
  userId: string;
  name: string;
  type: "pyme" | "enterprise";
  ruc?: string | null;
  buscan: string[];
  contacto?: string | null;
  barrioId: string;
  detectada?: boolean;
  sector?: string;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-yapo-amber-dark" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: full }, (_, i) => <span key={`f-${i}`} aria-hidden>★</span>)}
      {half ? <span aria-hidden>★</span> : null}
      {Array.from({ length: empty }, (_, i) => <span key={`e-${i}`} className="text-yapo-amber-dark/40" aria-hidden>★</span>)}
    </span>
  );
}

/** Alias de términos de búsqueda a oficios (OFICIOS_20). */
const OFICIO_ALIASES: Record<string, string> = {
  plomero: "Plomería",
  plomia: "Plomería",
  electricista: "Electricista",
  limpieza: "Limpieza",
  empleada: "Empleada doméstica",
  domestica: "Empleada doméstica",
  carpintero: "Carpintero",
  pintor: "Pintor",
  delivery: "Delivery",
  mecanico: "Mecánico",
  jardinería: "Jardinería",
  jardinero: "Jardinería",
  panadero: "Panadero",
  ventas: "Ventas",
  contador: "Contador",
  cuidado: "Cuidado personas",
  niñera: "Niñera",
  ninyera: "Niñera",
  albañil: "Albañil",
  albanil: "Albañil",
  refrigeracion: "Refrigeración",
  refrigerador: "Refrigeración",
  gasista: "Gasista",
  lavado: "Lavado y planchado",
  planchado: "Lavado y planchado",
  it: "IT / Soporte",
  soporte: "IT / Soporte",
  tecnico: "IT / Soporte",
};

/** Intenta detectar un oficio en el texto (ej. "plomero" → Plomería). */
function detectOficioEnTexto(texto: string): string | null {
  const t = texto.toLowerCase().trim();
  if (!t) return null;
  for (const oficio of OFICIOS_20) {
    if (oficio.toLowerCase().includes(t) || t.includes(oficio.toLowerCase())) return oficio;
  }
  const words = t.split(/\s+/);
  for (const w of words) {
    if (OFICIO_ALIASES[w]) return OFICIO_ALIASES[w];
  }
  for (const [key, value] of Object.entries(OFICIO_ALIASES)) {
    if (t.includes(key)) return value;
  }
  return null;
}

/** Nombres de ciudad abreviados o alternativos para matchear en la búsqueda. */
const CIUDAD_ALIASES: Record<string, string> = {
  fdm: "Fernando de la Mora",
  "fernando de la mora": "Fernando de la Mora",
  lambare: "Lambaré",
  luque: "Luque",
  asuncion: "Asunción",
  asunción: "Asunción",
};

/** Intenta seleccionar departamento/ciudad/barrio por nombres en el texto (ej. "Fernando de la Mora San Miguel", "fdm zona norte"). */
function detectZonaEnTexto(
  texto: string,
  semaphores: typeof SEMAPHORES_MAP
): { depto: SemaphoreDepartamento; ciudad: SemaphoreCiudad; barrio: SemaphoreBarrio } | null {
  const raw = texto.toLowerCase().trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  const normalizedRaw = raw.replace(/\s+/g, " ");

  for (const d of semaphores) {
    for (const c of d.ciudades) {
      const cityName = c.name.toLowerCase();
      const cityAlias = CIUDAD_ALIASES[cityName]?.toLowerCase() ?? cityName;
      const cityMatch = normalizedRaw.includes(cityName) || normalizedRaw.includes(cityAlias) || parts.some((p) => cityName.includes(p) || (CIUDAD_ALIASES[p] && CIUDAD_ALIASES[p].toLowerCase() === cityName));

      for (const b of c.barrios) {
        const barrioName = b.name.toLowerCase();
        const barrioMatch = normalizedRaw.includes(barrioName) || parts.some((p) => barrioName.includes(p) || (p.length >= 2 && barrioName.includes(p)));
        if (barrioMatch && cityMatch) return { depto: d, ciudad: c, barrio: b };
        if (barrioMatch && c.barrios.includes(b)) return { depto: d, ciudad: c, barrio: b };
      }
    }
  }
  for (const d of semaphores) {
    for (const c of d.ciudades) {
      const cityName = c.name.toLowerCase();
      const cityAlias = CIUDAD_ALIASES[cityName]?.toLowerCase();
      const cityMatch = normalizedRaw.includes(cityName) || (cityAlias && normalizedRaw.includes(cityAlias)) || parts.some((p) => cityName.includes(p));
      if (cityMatch && c.barrios.length > 0) return { depto: d, ciudad: c, barrio: c.barrios[0] };
    }
  }
  if (parts.some((p) => p === "fdm" || p === "fernando")) {
    for (const d of semaphores) {
      const c = d.ciudades.find((ci) => ci.name === "Fernando de la Mora");
      if (c?.barrios.length) return { depto: d, ciudad: c, barrio: c.barrios[0] };
    }
  }
  return null;
}

export default function MapaGPSPage() {
  const [depto, setDepto] = useState<SemaphoreDepartamento | null>(null);
  const [ciudad, setCiudad] = useState<SemaphoreCiudad | null>(null);
  const [barrio, setBarrio] = useState<SemaphoreBarrio | null>(null);
  const [profesiones, setProfesiones] = useState<ProfesionZona[]>([]);
  const [loadingProfesiones, setLoadingProfesiones] = useState(false);
  const [errorProfesiones, setErrorProfesiones] = useState<string | null>(null);
  const [profesionalesZona, setProfesionalesZona] = useState<ProfesionalEnZona[]>([]);
  const [empresasZona, setEmpresasZona] = useState<EmpresaEnZona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const [errorZonas, setErrorZonas] = useState<string | null>(null);
  const [profesionFiltro, setProfesionFiltro] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandDepto, setExpandDepto] = useState<Record<string, boolean>>({});
  const zonaSeleccionadaRef = useRef<HTMLDivElement>(null);
  const profesionalesSectionRef = useRef<HTMLElement>(null);

  const ciudades = depto?.ciudades ?? [];
  const barrios = ciudad?.barrios ?? [];

  useEffect(() => {
    if (!barrio) {
      setProfesiones([]);
      setErrorProfesiones(null);
      return;
    }
    let cancelled = false;
    setLoadingProfesiones(true);
    setErrorProfesiones(null);
    fetch(`/api/mapa/profesiones?barrioId=${encodeURIComponent(barrio.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Error al cargar"))))
      .then((data: { profesiones?: ProfesionZona[] }) => {
        if (!cancelled && Array.isArray(data?.profesiones)) setProfesiones(data.profesiones);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorProfesiones("No se pudieron cargar las profesiones de la zona.");
          setProfesiones([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfesiones(false);
      });
    return () => { cancelled = true; };
  }, [barrio]);

  useEffect(() => {
    if (!barrio) {
      setProfesionalesZona([]);
      setEmpresasZona([]);
      setErrorZonas(null);
      return;
    }
    let cancelled = false;
    setLoadingZonas(true);
    setErrorZonas(null);
    const barrioId = encodeURIComponent(barrio.id);
    Promise.all([
      fetch(`/api/mapa/zonas/profesionales?barrioId=${barrioId}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Error profesionales")))),
      fetch(`/api/mapa/zonas/empresas?barrioId=${barrioId}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Error empresas")))),
    ])
      .then(([profRes, empRes]) => {
        if (!cancelled) {
          setProfesionalesZona(Array.isArray(profRes?.profesionales) ? profRes.profesionales : []);
          setEmpresasZona(Array.isArray(empRes?.empresas) ? empRes.empresas : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorZonas("No se pudieron cargar profesionales ni empresas de la zona.");
          setProfesionalesZona([]);
          setEmpresasZona([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingZonas(false);
      });
    return () => { cancelled = true; };
  }, [barrio]);

  const selectBarrio = useCallback((d: SemaphoreDepartamento, c: SemaphoreCiudad, b: SemaphoreBarrio) => {
    setDepto(d);
    setCiudad(c);
    setBarrio(b);
    setProfesionFiltro(null);
  }, []);

  /** Al enviar búsqueda: intenta detectar zona y oficio en el texto y actualiza filtros. */
  const handleBuscarSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const zona = detectZonaEnTexto(q, SEMAPHORES_MAP);
    if (zona) selectBarrio(zona.depto, zona.ciudad, zona.barrio);
    const oficio = detectOficioEnTexto(q);
    if (oficio) setProfesionFiltro(oficio);
    zonaSeleccionadaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [searchQuery, selectBarrio]);

  /** Primera zona del mapa (Central > Asunción > Botánico) para mostrar resultados al elegir solo oficio. */
  const primeraZona = SEMAPHORES_MAP[0]?.ciudades?.[0]?.barrios?.[0]
    ? {
        depto: SEMAPHORES_MAP[0],
        ciudad: SEMAPHORES_MAP[0].ciudades[0],
        barrio: SEMAPHORES_MAP[0].ciudades[0].barrios[0],
      }
    : null;

  /** Al clicar un oficio: si no hay zona elegida, fijar primera zona para mostrar lista; filtrar por oficio y scroll a resultados. */
  const handleOficioClick = useCallback(
    (cat: string) => {
      const nextFilter = profesionFiltro === cat ? null : cat;
      setProfesionFiltro(nextFilter);
      if (!barrio && primeraZona) {
        selectBarrio(primeraZona.depto, primeraZona.ciudad, primeraZona.barrio);
      }
      setTimeout(() => profesionalesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    },
    [barrio, profesionFiltro, primeraZona, selectBarrio]
  );

  const toggleDepto = (id: string) => setExpandDepto((p) => ({ ...p, [id]: !p[id] }));

  /** Coincidencia flexible: "Plomero" con "Plomería", "Electricista" con "Electricista". */
  const matchProfession = (profession: string, filterLabel: string): boolean => {
    const a = profession.toLowerCase().trim();
    const b = filterLabel.toLowerCase().trim();
    return a === b || a.includes(b) || b.includes(a);
  };
  /** Filtrados por profesión, filtro rápido (certificado/amateur/kavaju) y ordenados por calidad. */
  const profesionalesFiltrados = (() => {
    let list = profesionFiltro
      ? profesionalesZona.filter((p) => matchProfession(p.profession, profesionFiltro))
      : profesionalesZona;
    if (quickFilter === "certificado") {
      list = list.filter((p) => p.documentVerified === true || !!p.matriculado);
    } else if (quickFilter === "amateur") {
      list = list.filter((p) => !p.documentVerified && !p.matriculado);
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mapa/page.tsx:profesionalesFiltrados',message:'quick filter',data:{quickFilter,zonaLen:profesionalesZona.length,listLen:list.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return [...list].sort((a, b) => {
      const aMat = a.matriculado ? 1 : 0;
      const bMat = b.matriculado ? 1 : 0;
      if (bMat !== aMat) return bMat - aMat;
      const aVerif = a.documentVerified === true ? 1 : 0;
      const bVerif = b.documentVerified === true ? 1 : 0;
      if (bVerif !== aVerif) return bVerif - aVerif;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  })();

  const totalBarrios = SEMAPHORES_MAP.reduce(
    (acc, d) => acc + d.ciudades.reduce((a, c) => a + c.barrios.length, 0),
    0
  );

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-yapo-blue">Buscador YAPÓ</h1>
        <p className="mt-0.5 text-sm text-foreground/70">
          Escribí oficio y zona (ej. plomero Fernando de la Mora San Miguel) o elegí abajo.
        </p>
      </header>

      {/* Mapa territorial real (OpenStreetMap) con puntos por zona */}
      <section className="mb-6" aria-label="Mapa territorial">
        <div className="mb-3 flex flex-wrap items-center gap-4 rounded-xl bg-yapo-white/90 px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold text-yapo-blue">Total zonas:</span>
          <span className="text-foreground/90">{totalBarrios} barrios</span>
          <span className="font-semibold text-yapo-blue">Departamentos:</span>
          <span className="text-foreground/90">{SEMAPHORES_MAP.length}</span>
          {barrio && !loadingZonas && (
            <>
              <span className="font-semibold text-yapo-emerald">En zona:</span>
              <span className="text-foreground/90">{profesionalesZona.length} profesionales · {empresasZona.length} PyMEs</span>
            </>
          )}
        </div>
        <MapaRealYapoDynamic height="320px" showLegend />
      </section>

      <SearchPillar
        simple
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onQuerySubmit={handleBuscarSubmit}
        placeholder="ej. plomero Fernando de la Mora San Miguel"
      />

      <section id="filtros-zona" className="mb-4 rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm" aria-label="Zona y oficios">
        <p className="mb-2 text-xs font-medium text-foreground/70">Oficios (20)</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {OFICIOS_20.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleOficioClick(cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${profesionFiltro === cat ? "bg-yapo-blue text-white shadow-md" : "bg-yapo-blue-light/30 text-yapo-blue hover:bg-yapo-blue/20"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-medium text-foreground/70">Zona (barrio)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={depto?.id ?? ""}
            onChange={(e) => {
              const d = SEMAPHORES_MAP.find((x) => x.id === e.target.value) ?? null;
              setDepto(d);
              setCiudad(null);
              setBarrio(null);
            }}
            className="rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue"
            aria-label="Departamento"
          >
            <option value="">Departamento</option>
            {SEMAPHORES_MAP.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={ciudad?.id ?? ""}
            onChange={(e) => {
              const c = ciudades.find((x) => x.id === e.target.value) ?? null;
              setCiudad(c);
              setBarrio(null);
            }}
            className="rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue"
            aria-label="Ciudad"
            disabled={!depto}
          >
            <option value="">Ciudad</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={barrio?.id ?? ""}
            onChange={(e) => {
              const b = barrios.find((x) => x.id === e.target.value) ?? null;
              setBarrio(b);
            }}
            className="rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue"
            aria-label="Barrio"
            disabled={!ciudad}
          >
            <option value="">Barrio</option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        {barrio && (
          <p className="mt-2 text-xs text-yapo-blue/90">
            Mostrando resultados en <strong>{barrio.name}</strong>
            {depto && ciudad && ` · ${ciudad.name}, ${depto.name}`}
          </p>
        )}
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-4 rounded-xl bg-yapo-white/80 px-4 py-2.5 text-sm" aria-label="Resumen">
        <span className="font-medium text-yapo-blue">{SEMAPHORES_MAP.length} dep.</span>
        <span className="text-foreground/70">{totalBarrios} barrios</span>
        {barrio && !loadingZonas && (
          <>
            <span className="text-yapo-emerald font-medium">{profesionalesZona.length} profesionales</span>
            <span className="text-foreground/70">{empresasZona.length} PyMEs</span>
          </>
        )}
      </section>

      {/* Zona seleccionada (resumen corto) */}
      {barrio && (
        <section ref={zonaSeleccionadaRef} className="mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-yapo-blue/10 px-3 py-2" aria-label="Zona actual">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStateStyle(barrio.state as SemaphoreState)}`}>{barrio.name}</span>
          {ciudad && <span className="text-xs text-foreground/70">{ciudad.name}</span>}
          {depto && <span className="text-xs text-foreground/70">{depto.name}</span>}
        </section>
      )}

      {/* Resultados en la zona: chips de oficio + lista (estilo Indeed/Fiverr) */}
      {barrio && (
        <section
          ref={profesionalesSectionRef}
          className="mb-6 rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm"
          aria-label="Resultados en la zona"
        >
          <h2 className="mb-2 text-base font-bold text-yapo-blue">En {barrio.name}</h2>
          {loadingProfesiones || loadingZonas ? (
            <div className="flex items-center justify-center py-10 text-sm text-foreground/70">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-yapo-blue border-t-transparent" aria-hidden />
              <span className="ml-2">Cargando resultados…</span>
            </div>
          ) : errorZonas ? (
            <p className="rounded-xl border border-yapo-amber/30 bg-yapo-amber/10 px-4 py-3 text-sm text-yapo-amber-dark">{errorZonas}</p>
          ) : (
            <>
              {!errorProfesiones && profesiones.length > 0 && (
                <p className="mb-2 text-xs font-medium text-foreground/70">Filtrar por oficio</p>
              )}
              {!errorProfesiones && profesiones.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setProfesionFiltro(null)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${!profesionFiltro ? "bg-yapo-blue text-white" : "bg-yapo-blue-light/30 text-yapo-blue"}`}>
                    Todos
                  </button>
                  {profesiones.map((p) => (
                    <button key={p.label} type="button" onClick={() => setProfesionFiltro((prev) => (prev === p.label ? null : p.label))} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${profesionFiltro === p.label ? "bg-yapo-blue text-white" : "bg-yapo-blue-light/30 text-yapo-blue hover:bg-yapo-blue/20"}`}>
                      {p.icon} {p.label} <span className="opacity-80">({p.count})</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {profesionalesFiltrados.length === 0 ? (
                  <div className="rounded-xl border-2 border-yapo-blue/10 bg-yapo-blue-light/10 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-foreground/90">
                      {profesionFiltro
                        ? `No hay profesionales de "${profesionFiltro}" en este barrio.`
                        : "Nadie en este barrio todavía. Probá otro barrio u oficio."}
                    </p>
                    <p className="mt-1 text-xs text-foreground/70">
                      Podés cambiar la zona o explorar todos los oficios en el mapa.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="#filtros-zona"
                        className="flex min-h-[44px] items-center justify-center rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 py-2.5 text-sm font-semibold text-yapo-blue transition active:scale-[0.98]"
                        onClick={(e) => {
                          const el = document.getElementById("filtros-zona");
                          if (el) {
                            e.preventDefault();
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                      >
                        Elegir otra zona
                      </Link>
                      <Link
                        href="/mapa"
                        className="flex min-h-[44px] items-center justify-center rounded-xl bg-yapo-blue px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
                      >
                        Ver todos los oficios
                      </Link>
                    </div>
                  </div>
                ) : (
                  profesionalesFiltrados.map((p) => (
                    <div key={p.userId} className="flex items-center gap-3 rounded-xl border border-yapo-blue/10 bg-white p-3">
                      <Link href={`/profile/${encodeURIComponent(p.userId)}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar src={p.image} name={p.name} size="md" className="h-12 w-12 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-yapo-blue">{p.name}</span>
                            {p.verified && <span className="text-yapo-emerald" title="Verificado">✓</span>}
                            {p.documentVerified && <span className="rounded bg-yapo-blue/15 px-1.5 py-0.5 text-xs text-yapo-blue" title="Documento verificado">🪪 ID</span>}
                            {p.matriculado && (
                              <span className="rounded bg-yapo-amber/20 px-1.5 py-0.5 text-xs font-medium text-yapo-amber-dark" title="Profesional Matriculado">
                                📜 {p.matriculado}
                              </span>
                            )}
                            <span className="rounded bg-yapo-blue/10 px-1.5 py-0.5 text-xs font-medium text-yapo-blue">{p.profession}</span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-2 text-sm text-foreground/70">
                            <Stars rating={p.rating} />
                            <span>{p.rating}</span>
                            {p.workHistory && <span>· {p.workHistory}</span>}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-yapo-blue">Ver →</span>
                      </Link>
                      <Link
                        href={`/trabajo/aceptar?profesionalId=${encodeURIComponent(p.userId)}&nombreProfesional=${encodeURIComponent(p.name)}`}
                        className="shrink-0 rounded-lg bg-yapo-blue px-3 py-1.5 text-xs font-medium text-yapo-white"
                      >
                        Aceptar propuesta
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* PyMEs en la zona — cards compactas */}
      {barrio && !loadingZonas && !errorZonas && (
        <section className="mb-6 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Empresas en la zona">
          <h2 className="mb-3 text-base font-bold text-yapo-blue">Empresas en {barrio.name}</h2>
          {empresasZona.length === 0 ? (
            <p className="rounded-xl bg-yapo-blue-light/10 px-4 py-3 text-sm text-foreground/70">Aún no hay PyMEs en este barrio.</p>
          ) : (
            <ul className="space-y-2">
              {empresasZona.map((e) => (
                <li key={e.userId}>
                  <Link href={`/profile/${encodeURIComponent(e.userId)}`} className="flex items-center justify-between gap-2 rounded-xl border border-yapo-blue/10 p-3 transition-[box-shadow] hover:shadow-md">
                    <div className="min-w-0">
                      <span className="font-medium text-yapo-blue">{e.name}</span>
                      {e.buscan?.length > 0 && <p className="mt-0.5 truncate text-xs text-foreground/70">Buscan: {e.buscan.slice(0, 3).join(", ")}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-yapo-blue/20 px-2 py-0.5 text-xs font-medium text-yapo-blue">{e.type === "enterprise" ? "E" : "PyME"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 py-3 font-medium text-yapo-blue"
        >
          ← Volver al Dashboard
        </Link>
      </section>
    </main>
  );
}
