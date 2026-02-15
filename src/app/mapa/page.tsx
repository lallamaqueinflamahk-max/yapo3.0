"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import SmartSearch from "@/components/mapa/SmartSearch";
import UXKPIDashboard from "@/components/dashboard/UXKPIDashboard";
import { type QuickFilterType } from "@/components/dashboard/SearchPillar";
import { trackUX, trackResultEngagement } from "@/lib/analytics/ux-tracking";
import MapaRealYapoDynamic from "@/components/dashboard/MapaRealYapoDynamic";
import LocationToggle from "@/components/territory/LocationToggle";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getGoogleMapsDirectionsUrl } from "@/lib/maps/directions";
import type { MapLayerId } from "@/lib/maps/types";
import { BARRIO_COORDS, getBarrioPointsForMap } from "@/data/mapa-barrios-coords";
import { getProfesionalesPorBarrio } from "@/data/mapa-profesionales-empresas-mock";
import dynamic from "next/dynamic";
import {
  SEMAPHORES_MAP,
  getStateStyle,
  type SemaphoreDepartamento,
  type SemaphoreCiudad,
  type SemaphoreBarrio,
  type SemaphoreState,
} from "@/data/semaphores-map";
import { OFICIOS_20, OFICIOS_ICON } from "@/data/mapa-funcionalidades-busqueda";

const MapGoogleYapo = dynamic(
  () => import("@/components/dashboard/MapGoogleYapo").then((m) => m.default),
  { ssr: false, loading: () => <div className="flex min-h-[320px] items-center justify-center rounded-2xl border-2 border-yapo-blue/20 bg-yapo-blue-light/20 text-yapo-blue/80">Cargando mapa…</div> }
);

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
  whatsapp?: string | null;
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
  costurera: "Costurera",
  costura: "Costurera",
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
  const searchParams = useSearchParams();
  const showUXDashboard = searchParams.get("ux") === "1";
  const geo = useGeolocation();
  const userPosition = geo.position ? { lat: geo.position.lat, lng: geo.position.lng } : null;

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
  const [mapLayer, setMapLayer] = useState<MapLayerId>("zonas");
  const zonaSeleccionadaRef = useRef<HTMLDivElement>(null);
  const profesionalesSectionRef = useRef<HTMLElement>(null);

  const googleMapsApiKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined;

  const barrioPoints = useMemo(() => {
    const countByOficio = barrio && profesionFiltro
      ? profesiones.find((p) => p.label === profesionFiltro)?.count
      : undefined;
    const points = getBarrioPointsForMap(
      barrio
        ? {
            barrioId: barrio.id,
            countByOficio,
            totalProfesionales: profesionalesZona.length,
          }
        : undefined
    );
    if (mapLayer === "saturacion" || mapLayer === "segmentacion-oficio") {
      const match = (profession: string, filterLabel: string) => {
        const a = profession.toLowerCase().trim();
        const b = filterLabel.toLowerCase().trim();
        return a === b || a.includes(b) || b.includes(a);
      };
      for (const p of points) {
        const profs = getProfesionalesPorBarrio(p.id);
        p.totalProfesionales = profs.length;
        if (profesionFiltro)
          p.countByOficio = profs.filter((pr) => match(pr.profession, profesionFiltro)).length;
      }
    }
    return points;
  }, [barrio, profesionFiltro, profesiones, profesionalesZona.length, mapLayer]);

  const empresasMarkers = useMemo(() => {
    return empresasZona
      .map((e) => {
        const coords = BARRIO_COORDS[e.barrioId];
        if (!coords) return null;
        return {
          userId: e.userId,
          name: e.name,
          lat: coords.lat,
          lng: coords.lng,
          buscan: e.buscan ?? [],
          type: e.type,
        };
      })
      .filter(Boolean) as { userId: string; name: string; lat: number; lng: number; buscan: string[]; type: "pyme" | "enterprise" }[];
  }, [empresasZona]);

  const profesionalesMarkers = useMemo(() => {
    return profesionalesZona.map((p) => {
      const coords = BARRIO_COORDS[p.barrioId] ?? { lat: -25.28, lng: -57.63 };
      return {
        userId: p.userId,
        name: p.name,
        profession: p.profession,
        lat: coords.lat,
        lng: coords.lng,
        rating: p.rating,
        geolocationEnabled: true,
      };
    });
  }, [profesionalesZona]);

  const empresasParaCapaBuscan = useMemo(() => {
    if (mapLayer !== "empresas-buscan-mi-servicio" || !profesionFiltro) return empresasMarkers;
    return empresasMarkers.filter((e) =>
      e.buscan.some((b) => b.toLowerCase().includes(profesionFiltro.toLowerCase()))
    );
  }, [mapLayer, profesionFiltro, empresasMarkers]);

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

  /** Primera zona del mapa (Central > Asunción > Botánico) para mostrar resultados al elegir solo oficio. */
  const primeraZona = SEMAPHORES_MAP[0]?.ciudades?.[0]?.barrios?.[0]
    ? {
        depto: SEMAPHORES_MAP[0],
        ciudad: SEMAPHORES_MAP[0].ciudades[0],
        barrio: SEMAPHORES_MAP[0].ciudades[0].barrios[0],
      }
    : null;

  /** Al enviar búsqueda: detecta zona y oficio; si solo hay oficio, fija zona por defecto para mostrar resultados. */
  const handleBuscarSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const zona = detectZonaEnTexto(q, SEMAPHORES_MAP);
    const oficio = detectOficioEnTexto(q);
    if (zona) {
      selectBarrio(zona.depto, zona.ciudad, zona.barrio);
    } else if (oficio && primeraZona) {
      selectBarrio(primeraZona.depto, primeraZona.ciudad, primeraZona.barrio);
    }
    if (oficio) setProfesionFiltro(oficio);
    zonaSeleccionadaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => profesionalesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }, [searchQuery, selectBarrio, primeraZona]);

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

  useEffect(() => {
    trackUX({
      task: "Buscar profesional",
      metrics: ["time_to_first_search", "clicks_to_result", "scroll_depth", "filter_usage", "abandonment_probability"],
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-yapo-blue">Mapa de búsqueda YAPÓ</h1>
        <p className="mt-0.5 text-sm text-foreground/70">
          Único mapa enlazado con Google Maps. Segmentación por oficio, empresas, profesionales y más.
        </p>
      </header>

      {/* SmartSearch: jerarquía clara, CTA único, prueba social */}
      <SmartSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSearch={handleBuscarSubmit}
        professionalsCount={3200}
        className="mb-4"
      />
      <div className="mb-4 rounded-xl border border-yapo-blue/20 bg-yapo-white/95 p-3">
        <p className="mb-2 text-xs text-foreground/60">Opcional: activá tu ubicación para ver distancia en el mapa</p>
        <LocationToggle
          realTimeEnabled={geo.realTimeEnabled}
          onRealTimeChange={geo.setRealTimeEnabled}
          onRequestMyLocation={geo.requestPosition}
          position={geo.position}
          error={geo.error}
          loading={geo.loading}
        />
      </div>

      {/* Mapa único: Google Maps (si hay API key) con capas; si no, OpenStreetMap */}
      <section className="mb-6" aria-label="Mapa de búsqueda">
        <div className="mb-3 flex flex-wrap items-center gap-4 rounded-xl bg-yapo-white/90 px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold text-yapo-blue">Total zonas:</span>
          <span className="text-foreground/90">{totalBarrios} barrios</span>
          <span className="font-semibold text-yapo-blue">Departamentos:</span>
          <span className="text-foreground/90">{SEMAPHORES_MAP.length}</span>
          {userPosition && (
            <span className="font-semibold text-yapo-emerald">Tu GPS en el mapa</span>
          )}
          {barrio && !loadingZonas && (
            <>
              <span className="font-semibold text-yapo-emerald">En zona:</span>
              <span className="text-foreground/90">{profesionalesZona.length} profesionales · {empresasZona.length} PyMEs</span>
            </>
          )}
        </div>
        {googleMapsApiKey ? (
          <MapGoogleYapo
            apiKey={googleMapsApiKey}
            height="320px"
            userPosition={userPosition}
            barrioPoints={barrioPoints}
            layer={mapLayer}
            profesionFiltro={profesionFiltro}
            empresas={mapLayer === "empresas-buscan-mi-servicio" ? empresasParaCapaBuscan : empresasMarkers}
            profesionales={mapLayer === "profesionales" ? profesionalesMarkers : []}
            showLayerSelector
            selectedBarrioId={barrio?.id ?? null}
            onLayerChange={setMapLayer}
            onBarrioSelect={(barrioId) => {
              for (const d of SEMAPHORES_MAP) {
                for (const c of d.ciudades) {
                  const b = c.barrios.find((x) => x.id === barrioId);
                  if (b) {
                    selectBarrio(d, c, b);
                    return;
                  }
                }
              }
            }}
          />
        ) : (
          <MapaRealYapoDynamic height="320px" showLegend userPosition={userPosition} />
        )}
      </section>

      {/* Filtros: oficio + zona — diseño claro y de baja fricción */}
      <section
        id="filtros-zona"
        ref={zonaSeleccionadaRef}
        className="mb-4 overflow-hidden rounded-2xl border border-yapo-blue/10 bg-yapo-white shadow-lg shadow-yapo-blue/5"
        aria-label="Buscar por oficio y zona"
      >
        {/* ¿Qué necesitás? — oficios con iconos */}
        <div className="border-b border-yapo-blue/5 bg-gradient-to-b from-yapo-blue-light/5 to-transparent px-4 py-4 sm:px-5">
          <h3 className="mb-3 text-sm font-semibold text-yapo-blue">¿Qué necesitás?</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {OFICIOS_20.map((cat) => {
              const icon = OFICIOS_ICON[cat] ?? "👤";
              const active = profesionFiltro === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleOficioClick(cat)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yapo-blue/30 focus:ring-offset-2 ${
                    active
                      ? "bg-yapo-blue text-white shadow-md"
                      : "bg-white text-foreground/90 shadow-sm ring-1 ring-yapo-blue/10 hover:bg-yapo-blue-light/20 hover:ring-yapo-blue/20"
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden>{icon}</span>
                  <span className="min-w-0 truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ¿Dónde? — departamento → ciudad → barrio */}
        <div className="px-4 py-4 sm:px-5">
          <h3 className="mb-3 text-sm font-semibold text-yapo-blue">¿Dónde?</h3>
          <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
            <select
              value={depto?.id ?? ""}
              onChange={(e) => {
                const d = SEMAPHORES_MAP.find((x) => x.id === e.target.value) ?? null;
                setDepto(d);
                setCiudad(null);
                setBarrio(null);
              }}
              className="min-w-[140px] flex-1 rounded-xl border border-yapo-blue/15 bg-white px-4 py-2.5 text-sm text-yapo-blue transition-colors focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20 sm:flex-initial"
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
              className="min-w-[140px] flex-1 rounded-xl border border-yapo-blue/15 bg-white px-4 py-2.5 text-sm text-yapo-blue transition-colors focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20 disabled:opacity-50 sm:flex-initial"
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
              className="min-w-[140px] flex-1 rounded-xl border border-yapo-blue/15 bg-white px-4 py-2.5 text-sm text-yapo-blue transition-colors focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20 disabled:opacity-50 sm:flex-initial"
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
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/80">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStateStyle(barrio.state as SemaphoreState)}`}>
                {barrio.name}
              </span>
              {ciudad && <span>{ciudad.name}</span>}
              {depto && <span className="text-foreground/60">{depto.name}</span>}
              {!loadingZonas && (
                <span className="text-yapo-emerald">
                  · {profesionalesZona.length} profesionales, {empresasZona.length} PyMEs
                </span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Resultados en la zona: chips de oficio + lista (estilo Indeed/Fiverr) */}
      {barrio && (
        <section
          ref={profesionalesSectionRef}
          className="mb-6 rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm"
          aria-label="Resultados en la zona"
        >
          <h2 className="mb-1 text-base font-bold text-yapo-blue">En {barrio.name}</h2>
          {profesionFiltro && (
            <p className="mb-2 text-sm text-foreground/80">Mostrando resultados para <strong>{profesionFiltro}</strong></p>
          )}
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
              <p className="mb-3 text-xs text-foreground/60">
                Ordenado por: verificación, matriculación y valoración (mejores primero).
              </p>
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
                  profesionalesFiltrados.map((p) => {
                    const barrioCoords = BARRIO_COORDS[p.barrioId];
                    const directionsUrl = barrioCoords
                      ? getGoogleMapsDirectionsUrl(
                          userPosition ?? null,
                          { lat: barrioCoords.lat, lng: barrioCoords.lng },
                          `${p.name} · ${barrioCoords.name}`
                        )
                      : null;
                    return (
                      <div key={p.userId} className="flex flex-wrap items-center gap-3 rounded-xl border border-yapo-blue/10 bg-white p-3">
                        <Link
                          href={`/profile/${encodeURIComponent(p.userId)}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                          onClick={() => trackResultEngagement("Ver perfil", { profesionalId: p.userId, profession: p.profession })}
                        >
                          <Avatar src={p.image} name={p.name} size="md" className="h-12 w-12 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-yapo-blue">{p.name}</span>
                              <span className="rounded bg-yapo-blue/15 px-1.5 py-0.5 text-xs font-medium text-yapo-blue/90" title="Tipo de usuario">{p.role}</span>
                              {p.verified && <span className="text-yapo-emerald" title="Verificado">✓</span>}
                              {p.documentVerified && <span className="rounded bg-yapo-blue/15 px-1.5 py-0.5 text-xs text-yapo-blue" title="Documento verificado">🪪 ID</span>}
                              {p.matriculado && (
                                <span className="rounded bg-yapo-amber/20 px-1.5 py-0.5 text-xs font-medium text-yapo-amber-dark" title="Profesional Matriculado">
                                  📜 {p.matriculado}
                                </span>
                              )}
                              <span className="rounded bg-yapo-blue/10 px-1.5 py-0.5 text-xs font-medium text-yapo-blue">{p.profession}</span>
                            </div>
                            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-foreground/70">
                              <Stars rating={p.rating} />
                              <span>{p.rating}</span>
                              {p.workHistory && <span>· {p.workHistory}</span>}
                              {p.badges && p.badges.length > 0 && <span>· {p.badges.slice(0, 3).join(", ")}</span>}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-yapo-blue">Ver →</span>
                        </Link>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/595${p.whatsapp.replace(/\D/g, "").replace(/^0/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-interactive inline-flex items-center gap-1.5 rounded-xl border-2 border-green-500/50 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-500/20"
                              onClick={() => trackResultEngagement("WhatsApp", { profesionalId: p.userId, profession: p.profession })}
                            >
                              WhatsApp
                            </a>
                          )}
                          {directionsUrl && (
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-interactive inline-block rounded-xl border-2 border-yapo-blue/50 px-3 py-1.5 text-xs font-semibold text-yapo-blue shadow-sm hover:bg-yapo-blue/15"
                            >
                              Cómo llegar
                            </a>
                          )}
                          <Link
                            href={`/trabajo/aceptar?profesionalId=${encodeURIComponent(p.userId)}&nombreProfesional=${encodeURIComponent(p.name)}`}
                            className="btn-interactive inline-block rounded-xl bg-yapo-cta px-3 py-1.5 text-xs font-semibold text-yapo-white shadow-sm border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover"
                            onClick={() => trackResultEngagement("Contratar", { profesionalId: p.userId, profession: p.profession })}
                          >
                            Aceptar propuesta
                          </Link>
                        </div>
                      </div>
                    );
                  })
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
              {empresasZona.map((e) => {
                const barrioCoords = BARRIO_COORDS[e.barrioId];
                const directionsUrl = barrioCoords
                  ? getGoogleMapsDirectionsUrl(
                      userPosition ?? null,
                      { lat: barrioCoords.lat, lng: barrioCoords.lng },
                      `${e.name} · ${barrioCoords.name}`
                    )
                  : null;
                return (
                  <li key={e.userId}>
                    <div className="nav-card-interactive flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-yapo-blue/15 p-3 hover:border-yapo-cta/30">
                      <Link href={`/profile/${encodeURIComponent(e.userId)}`} className="min-w-0 flex-1">
                        <div className="min-w-0">
                          <span className="font-medium text-yapo-blue">{e.name}</span>
                          {e.buscan?.length > 0 && <p className="mt-0.5 truncate text-xs text-foreground/70">Buscan: {e.buscan.slice(0, 3).join(", ")}</p>}
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        {directionsUrl && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-interactive inline-block rounded-xl border-2 border-yapo-blue/50 px-2 py-1 text-xs font-semibold text-yapo-blue shadow-sm hover:bg-yapo-blue/15"
                          >
                            Cómo llegar
                          </a>
                        )}
                        <span className="rounded-full bg-yapo-blue/20 px-2 py-0.5 text-xs font-medium text-yapo-blue">{e.type === "enterprise" ? "E" : "PyME"}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {showUXDashboard && <UXKPIDashboard className="mb-6" />}

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
