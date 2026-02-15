"use client";

import { useState } from "react";
import Link from "next/link";
import BarraBusquedaYapo from "@/components/adaptive-ui/BarraBusquedaYapo";
import type { DashboardConfig } from "@/lib/adaptive-ui";

const CITIES = ["Asunción", "Ciudad del Este", "Encarnación", "Luque", "Fernando de la Mora", "Otra"];

export interface SearchBlockProps {
  config?: DashboardConfig | null;
}

/**
 * Bloque de búsqueda: input grande "Buscar trabajo o servicio", selector ciudad, ícono voz, botón naranja.
 * Usa BarraBusquedaYapo (IA + voz); añade selector de ciudad opcional.
 */
export default function SearchBlock({ config }: SearchBlockProps) {
  const [city, setCity] = useState("");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-5" aria-label="Búsqueda">
      <div className="rounded-2xl border-2 border-gris-ui-border bg-yapo-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <BarraBusquedaYapo config={config} className="[&_form]:min-h-[52px]" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 rounded-xl border border-gris-ui-border bg-gris-ui px-3 text-sm text-gris-texto focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/20"
              aria-label="Ciudad"
            >
              <option value="">Ciudad</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Link
              href="/mapa"
              className="btn-interactive flex h-12 min-w-[52px] items-center justify-center rounded-xl bg-yapo-cta py-2 shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover"
              aria-label="Buscar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icon-buscar.png" alt="" className="h-8 w-auto max-w-[80px] object-contain" />
            </Link>
          </div>
        </div>
        <p className="mt-2 text-xs text-gris-texto-light">
          Escribí o usá el micrófono para preguntar lo que necesites. Conectado a IA.
        </p>
      </div>
    </section>
  );
}
