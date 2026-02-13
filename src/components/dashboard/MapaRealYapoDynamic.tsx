"use client";

import dynamic from "next/dynamic";
import type { MapaRealYapoProps } from "./MapaRealYapo";

const MapaRealYapo = dynamic(() => import("./MapaRealYapo"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border-2 border-yapo-blue/20 bg-yapo-blue-light/20 text-yapo-blue/80">
      Cargando mapa…
    </div>
  ),
});

export default function MapaRealYapoDynamic(props: MapaRealYapoProps) {
  return <MapaRealYapo {...props} />;
}
