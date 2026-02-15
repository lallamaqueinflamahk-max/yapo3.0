"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useMemo } from "react";
import {
  getPuntosMapaReal,
  MAP_CENTER_PARAGUAY,
  MAP_ZOOM_DEFAULT,
} from "@/data/mapa-barrios-coords";
import { getGoogleMapsDirectionsUrl } from "@/lib/maps/directions";

const COLOR_BY_STATE = {
  green: "#059669",
  yellow: "#E8A317",
  red: "#D52B1E",
} as const;

export interface UserPosition {
  lat: number;
  lng: number;
}

export interface MapaRealYapoProps {
  className?: string;
  /** Altura del contenedor del mapa (px o rem). */
  height?: string;
  /** Si se muestra la leyenda debajo. */
  showLegend?: boolean;
  /** Ubicación GPS del usuario (se muestra en el mapa y permite "Cómo llegar"). */
  userPosition?: UserPosition | null;
}

export default function MapaRealYapo({
  className = "",
  height = "280px",
  showLegend = true,
  userPosition = null,
}: MapaRealYapoProps) {
  const puntos = useMemo(() => getPuntosMapaReal(), []);

  return (
    <section
      className={`overflow-hidden rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white ${className}`}
      aria-label="Mapa territorial YAPÓ"
    >
      <div style={{ height }} className="relative w-full">
        <MapContainer
          center={MAP_CENTER_PARAGUAY}
          zoom={MAP_ZOOM_DEFAULT}
          className="h-full w-full rounded-xl"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPosition && (
            <CircleMarker
              center={[userPosition.lat, userPosition.lng]}
              pathOptions={{
                fillColor: "#1F6FAF",
                color: "#fff",
                weight: 2,
                fillOpacity: 0.95,
                radius: 10,
              }}
            >
              <Popup>
                <span className="font-medium text-yapo-blue">Tu ubicación</span>
                <br />
                <span className="text-xs text-foreground/70">
                  GPS: {userPosition.lat.toFixed(5)}, {userPosition.lng.toFixed(5)}
                </span>
              </Popup>
            </CircleMarker>
          )}
          {puntos.map((p) => {
            const directionsUrl = getGoogleMapsDirectionsUrl(
              userPosition ?? null,
              { lat: p.lat, lng: p.lng },
              p.name
            );
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                pathOptions={{
                  fillColor: COLOR_BY_STATE[p.state],
                  color: "#fff",
                  weight: 1.5,
                  fillOpacity: 0.9,
                  radius: 8,
                }}
              >
                <Popup>
                  <span className="font-medium text-yapo-blue">{p.name}</span>
                  <br />
                  <span className="text-xs text-foreground/70">
                    {p.state === "green" ? "Zona estable" : p.state === "yellow" ? "Atención" : "Prioridad"}
                  </span>
                  <br />
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-interactive mt-1 inline-block rounded-lg border-2 border-yapo-blue/50 px-2 py-1 text-xs font-semibold text-yapo-blue shadow-sm hover:bg-yapo-blue/15"
                  >
                    Cómo llegar
                  </a>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-yapo-blue/10 bg-yapo-blue-light/20 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yapo-red" aria-hidden />
            Prioridad
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yapo-amber" aria-hidden />
            Atención
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yapo-emerald" aria-hidden />
            Zona estable
          </span>
        </div>
      )}
    </section>
  );
}
