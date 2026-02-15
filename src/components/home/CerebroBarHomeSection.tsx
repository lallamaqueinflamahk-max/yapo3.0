"use client";

import BarraBusquedaYapo from "@/components/adaptive-ui/BarraBusquedaYapo";
import type { DashboardConfig } from "@/lib/adaptive-ui";

export interface CerebroBarHomeSectionProps {
  config?: DashboardConfig | null;
}

/**
 * Barra de IA fija en la home: input + lupa (CTA buscar) + micrófono.
 * Una sola lupa a la derecha como CTA de buscar.
 */
export default function CerebroBarHomeSection({ config }: CerebroBarHomeSectionProps) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 mt-4 sm:max-w-4xl md:max-w-7xl" aria-label="Buscador YAPÓ con IA">
      <div className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-lg shadow-yapo-petroleo/10">
        <div className="min-w-0">
          <BarraBusquedaYapo
            config={config}
            variant="hero"
            className="[&_form]:min-h-[52px] [&_input]:rounded-2xl [&_button]:rounded-2xl"
          />
          <p className="mt-2 text-xs text-gris-texto-light">
            Escribí o usá el micrófono
          </p>
        </div>
      </div>
    </section>
  );
}
