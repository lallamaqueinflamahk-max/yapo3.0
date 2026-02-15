"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  type MapProps,
} from "@react-google-maps/api";
import { getGoogleMapsDirectionsUrl } from "@/lib/maps/directions";
import type {
  BarrioPoint,
  EmpresaMarker,
  ProfesionalMarker,
  MapLayerId,
  Coords,
} from "@/lib/maps/types";

const MAP_CENTER: Coords = { lat: -25.282, lng: -57.635 };
const DEFAULT_ZOOM = 11;
const containerStyle = { width: "100%", height: "100%", borderRadius: "0.75rem" };

const COLOR_BY_STATE = {
  green: "#059669",
  yellow: "#E8A317",
  red: "#D52B1E",
} as const;

export interface MapGoogleYapoProps {
  /** Clave API de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY). */
  apiKey: string;
  /** Altura del contenedor (ej. "320px"). */
  height?: string;
  /** Ubicación GPS del usuario. */
  userPosition?: Coords | null;
  /** Puntos de barrios (zonas) con estado y opcionalmente counts. */
  barrioPoints?: BarrioPoint[];
  /** Capa activa: qué tipo de marcadores resaltar. */
  layer?: MapLayerId;
  /** Oficio seleccionado para capas segmentación / mas-trabajo / menos-demanda. */
  profesionFiltro?: string | null;
  /** Marcadores de empresas (con lat/lng). */
  empresas?: EmpresaMarker[];
  /** Marcadores de profesionales (con lat/lng). */
  profesionales?: ProfesionalMarker[];
  /** Si se muestra el selector de capas. */
  showLayerSelector?: boolean;
  /** Callback al elegir un barrio (opcional). */
  onBarrioSelect?: (barrioId: string) => void;
  /** Barrio actualmente seleccionado (resaltar). */
  selectedBarrioId?: string | null;
  /** Callback al cambiar la capa del mapa. */
  onLayerChange?: (layer: MapLayerId) => void;
}

function BarrioMarker({
  point,
  layer,
  profesionFiltro,
  userPosition,
  selectedBarrioId,
  onSelect,
}: {
  point: BarrioPoint;
  layer: MapLayerId;
  profesionFiltro?: string | null;
  userPosition: Coords | null;
  selectedBarrioId?: string | null;
  onSelect?: (barrioId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isSelected = selectedBarrioId === point.id;
  const fillColor =
    layer === "segmentacion-oficio" && profesionFiltro
      ? point.countByOficio === 0
        ? COLOR_BY_STATE.red
        : point.countByOficio && point.countByOficio < 3
          ? COLOR_BY_STATE.yellow
          : COLOR_BY_STATE.green
      : layer === "saturacion"
        ? point.totalProfesionales && point.totalProfesionales > 10
          ? COLOR_BY_STATE.red
          : point.totalProfesionales && point.totalProfesionales > 5
            ? COLOR_BY_STATE.yellow
            : COLOR_BY_STATE.green
        : COLOR_BY_STATE[point.state];

  const directionsUrl = userPosition
    ? getGoogleMapsDirectionsUrl(
        userPosition,
        { lat: point.lat, lng: point.lng },
        point.name
      )
    : null;

  const subtext =
    layer === "segmentacion-oficio" && profesionFiltro
      ? point.countByOficio != null
        ? `${point.countByOficio} ${profesionFiltro}`
        : point.name
      : layer === "saturacion" && point.totalProfesionales != null
        ? `${point.totalProfesionales} profesionales`
        : point.name;

  return (
    <Marker
      position={{ lat: point.lat, lng: point.lng }}
      onClick={() => {
        setOpen(true);
        onSelect?.(point.id);
      }}
      options={{
        icon: {
          path: window.google?.maps?.SymbolPath?.CIRCLE ?? 0,
          scale: isSelected ? 14 : 10,
          fillColor,
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      }}
    >
      {open && (
        <InfoWindow onCloseClick={() => setOpen(false)}>
          <div className="min-w-[160px] text-left">
            <p className="font-semibold text-yapo-blue">{point.name}</p>
            <p className="text-xs text-foreground/80">{subtext}</p>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block rounded-lg border border-yapo-blue/50 px-2 py-1 text-xs font-medium text-yapo-blue hover:bg-yapo-blue/10"
              >
                Cómo llegar
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}

const LAYER_LABELS: Record<MapLayerId, string> = {
  zonas: "Zonas (semáforo)",
  "segmentacion-oficio": "Dónde se necesita oficio",
  saturacion: "Saturación de profesionales",
  empresas: "Empresas en el mapa",
  profesionales: "Profesionales (GPS)",
  "mas-trabajo": "Más trabajo para mí",
  "menos-demanda": "Menos competencia",
  "empresas-buscan-mi-servicio": "Empresas que buscan mi servicio",
};

export default function MapGoogleYapo({
  apiKey,
  height = "320px",
  userPosition = null,
  barrioPoints = [],
  layer = "zonas",
  profesionFiltro = null,
  empresas = [],
  profesionales = [],
  showLayerSelector = true,
  onBarrioSelect,
  selectedBarrioId = null,
  onLayerChange,
}: MapGoogleYapoProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaMarker | null>(null);
  const [selectedProfesional, setSelectedProfesional] = useState<ProfesionalMarker | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-yapo",
    googleMapsApiKey: apiKey,
  });

  const mapOptions: MapProps["options"] = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "simplified" }],
        },
      ],
    }),
    []
  );

  const onLoad = useCallback(() => {}, []);
  const onUnmount = useCallback(() => {}, []);

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-yapo-amber/30 bg-yapo-amber/10 text-yapo-amber-dark"
        style={{ height }}
      >
        No se pudo cargar Google Maps. Revisá la API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-yapo-blue/20 bg-yapo-blue-light/20 text-yapo-blue/80"
        style={{ height }}
      >
        Cargando mapa…
      </div>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white"
      aria-label="Mapa YAPÓ con Google Maps"
    >
      {showLayerSelector && (
        <div className="flex flex-wrap items-center gap-2 border-b border-yapo-blue/10 bg-yapo-blue-light/20 px-3 py-2">
          <span className="text-xs font-semibold text-yapo-blue">Capa:</span>
          <select
            value={layer}
            onChange={(e) => onLayerChange?.(e.target.value as MapLayerId)}
            className="rounded-lg border border-yapo-blue/30 bg-white px-2 py-1.5 text-xs font-medium text-yapo-blue"
            aria-label="Capa del mapa"
            id="map-layer-select"
          >
            {(Object.entries(LAYER_LABELS) as [MapLayerId, string][]).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div style={{ height }} className="relative w-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userPosition ?? MAP_CENTER}
          zoom={DEFAULT_ZOOM}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {userPosition && (
            <Marker
              position={userPosition}
              title="Tu ubicación"
              options={{
                icon: {
                  path: window.google?.maps?.SymbolPath?.CIRCLE ?? 0,
                  scale: 12,
                  fillColor: "#1F6FAF",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                },
              }}
            />
          )}
          {barrioPoints.map((point) => (
            <BarrioMarker
              key={point.id}
              point={point}
              layer={layer}
              profesionFiltro={profesionFiltro}
              userPosition={userPosition}
              selectedBarrioId={selectedBarrioId}
              onSelect={onBarrioSelect}
            />
          ))}
          {layer === "empresas" || layer === "empresas-buscan-mi-servicio"
            ? empresas.map((emp) => (
                <Marker
                  key={emp.userId}
                  position={{ lat: emp.lat, lng: emp.lng }}
                  onClick={() => setSelectedEmpresa(emp)}
                  title={emp.name}
                  options={{
                    icon: {
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      scale: 1.8,
                      fillColor: "#1F6FAF",
                      fillOpacity: 1,
                      strokeColor: "#fff",
                      strokeWeight: 1,
                    },
                  }}
                >
                  {selectedEmpresa?.userId === emp.userId && (
                    <InfoWindow onCloseClick={() => setSelectedEmpresa(null)}>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-yapo-blue">{emp.name}</p>
                        {emp.buscan?.length > 0 && (
                          <p className="text-xs text-foreground/80">Buscan: {emp.buscan.slice(0, 3).join(", ")}</p>
                        )}
                        <Link
                          href={`/profile/${encodeURIComponent(emp.userId)}`}
                          className="mt-1 inline-block rounded-lg bg-yapo-blue px-2 py-1 text-xs font-medium text-white hover:bg-yapo-blue/90"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))
            : null}
          {layer === "profesionales" &&
            profesionales.map((prof) => (
              <Marker
                key={prof.userId}
                position={{ lat: prof.lat, lng: prof.lng }}
                onClick={() => setSelectedProfesional(prof)}
                title={`${prof.name} · ${prof.profession}`}
                options={{
                  icon: {
                    path: window.google?.maps?.SymbolPath?.CIRCLE ?? 0,
                    scale: 9,
                    fillColor: "#059669",
                    fillOpacity: 1,
                    strokeColor: "#fff",
                    strokeWeight: 2,
                  },
                }}
              >
                {selectedProfesional?.userId === prof.userId && (
                  <InfoWindow onCloseClick={() => setSelectedProfesional(null)}>
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-yapo-blue">{prof.name}</p>
                      <p className="text-xs text-foreground/80">{prof.profession}</p>
                      {prof.rating != null && <p className="text-xs text-yapo-amber-dark">★ {prof.rating}</p>}
                      <Link
                        href={`/profile/${encodeURIComponent(prof.userId)}`}
                        className="mt-1 inline-block rounded-lg bg-yapo-emerald px-2 py-1 text-xs font-medium text-white hover:bg-yapo-emerald/90"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
        </GoogleMap>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-yapo-blue/10 bg-yapo-blue-light/20 px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yapo-red" aria-hidden />
          Prioridad / Se necesita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yapo-amber" aria-hidden />
          Atención / Medio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yapo-emerald" aria-hidden />
          Estable / Oferta
        </span>
        {userPosition && (
          <span className="font-medium text-yapo-blue">Tu GPS en el mapa</span>
        )}
      </div>
    </section>
  );
}
