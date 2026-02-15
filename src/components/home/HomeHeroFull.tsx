"use client";

import Link from "next/link";
import Image from "next/image";
import BarraBusquedaYapo from "@/components/adaptive-ui/BarraBusquedaYapo";
import type { DashboardConfig } from "@/lib/adaptive-ui";

/**
 * Hero de alto nivel: espacio a la izquierda para texto y barra con IA (voz + texto, OpenAI + ElevenLabs),
 * imagen de trabajadores a la derecha.
 */
interface HomeHeroFullProps {
  config?: DashboardConfig | null;
}

export default function HomeHeroFull({ config }: HomeHeroFullProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[16px] bg-yapo-white shadow-2xl shadow-yapo-petroleo/10"
      aria-label="Bienvenido a YAPÓ"
    >
      <div className="grid min-h-[320px] grid-cols-1 md:min-h-[380px] md:grid-cols-[1fr,1fr]">
        {/* Izquierda: texto + barra con IA (mic + texto, enlazada a OpenAI y ElevenLabs) + CTAs */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:pl-10">
          <h1 className="text-2xl font-bold tracking-tight text-yapo-petroleo sm:text-3xl md:text-4xl">
            Trabajo real para gente real
          </h1>
          <p className="mt-2 max-w-md text-base text-gris-texto sm:text-lg">
            Preguntá lo que quieras por voz o texto. Encontrá ofertas o contratá talento verificado.
          </p>
          {/* Barra de búsqueda con IA: micrófono + texto, OpenAI + ElevenLabs */}
          <div className="mt-5">
            <BarraBusquedaYapo config={config} variant="hero" />
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href="/mapa"
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] bg-yapo-cta px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-yapo-cta/25 transition-all hover:bg-yapo-cta-hover hover:shadow-xl active:scale-[0.98] sm:flex-initial"
            >
              Publicar anuncio
            </Link>
            <Link
              href="/mapa"
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] border-2 border-yapo-blue bg-transparent px-5 py-2.5 text-sm font-bold text-yapo-blue transition-all hover:bg-yapo-blue/10 active:scale-[0.98] sm:flex-initial"
            >
              Buscar trabajo
            </Link>
          </div>
          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yapo-validacion/15 px-3 py-1.5 text-xs font-semibold text-yapo-validacion-dark">
              <span aria-hidden>✓</span> Verificado
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yapo-blue/10 px-3 py-1.5 text-xs font-semibold text-yapo-blue">
              <span aria-hidden>🛡</span> Pago protegido
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yapo-petroleo/10 px-3 py-1.5 text-xs font-semibold text-yapo-petroleo">
              <span aria-hidden>⚡</span> Escudos activos
            </span>
          </div>
        </div>

        {/* Derecha: imagen con trabajadores (soft DoF) */}
        <div className="relative min-h-[240px] md:min-h-0 bg-gradient-to-br from-yapo-petroleo via-yapo-petroleo-light to-yapo-blue">
          <div className="absolute inset-0 z-10 bg-gradient-to-l from-yapo-petroleo/30 via-transparent to-transparent pointer-events-none" aria-hidden />
          <Image
            src="/images/hero-workers.png"
            alt="Trabajador de la construcción y cocinera profesionales, sonrientes y confiables. Plataforma YAPÓ."
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </section>
  );
}
