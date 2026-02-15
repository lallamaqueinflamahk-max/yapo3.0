"use client";

import Link from "next/link";
import MapaRealYapoDynamic from "@/components/dashboard/MapaRealYapoDynamic";
import LocationToggle from "@/components/territory/LocationToggle";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function MapSection() {
  const geo = useGeolocation();
  const userPosition = geo.position
    ? { lat: geo.position.lat, lng: geo.position.lng }
    : null;

  return (
    <section className="mx-auto w-full max-w-[390px] px-4 py-5 sm:max-w-4xl" aria-label="Trabajos cerca tuyo">
      <h2 className="mb-2 text-lg font-bold text-yapo-petroleo">Mapa territorial</h2>
      <p className="mb-3 text-xs text-gris-texto-light">
        Tu ubicación y zonas. Activá tiempo real o &quot;Usar mi ubicación actual&quot;.
      </p>
      <div className="mb-3 rounded-2xl border border-gris-ui-border bg-yapo-white/95 p-3 shadow-sm">
        <LocationToggle
          realTimeEnabled={geo.realTimeEnabled}
          onRealTimeChange={geo.setRealTimeEnabled}
          onRequestMyLocation={geo.requestPosition}
          position={geo.position}
          error={geo.error}
          loading={geo.loading}
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-gris-ui-border bg-yapo-white shadow-md">
        <MapaRealYapoDynamic
          height="240px"
          showLegend
          userPosition={userPosition}
        />
      </div>
      <Link
        href="/mapa"
        className="btn-interactive mt-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-yapo-cta font-bold text-white shadow-md border-2 border-yapo-cta-hover/50"
      >
        Ver trabajos en esta zona
      </Link>
    </section>
  );
}
