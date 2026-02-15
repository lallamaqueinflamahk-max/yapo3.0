"use client";

import Link from "next/link";
import Image from "next/image";

interface HomeHeroProps {
  /** CTA principal: empleo (trabajador) o publicar oferta (pyme/enterprise) */
  primaryCtaHref: string;
  primaryCtaLabel: string;
}

/**
 * Hero HOME: valor diferencial en <5s, confianza (Validado), CTA claro.
 * Imagen: trabajador + cocinera (placeholder gradient si no hay asset).
 * Paleta: petróleo, azul YAPO, naranja CTA, verde validación.
 */
export default function HomeHero({ primaryCtaHref, primaryCtaLabel }: HomeHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[16px] bg-yapo-white shadow-xl shadow-yapo-petroleo/10 transition-shadow duration-300 hover:shadow-2xl hover:shadow-yapo-petroleo/15"
      aria-label="Bienvenido a YAPÓ"
    >
      {/* Zona imagen: gradiente petróleo → azul YAPO (placeholder si no hay imagen) */}
      <div className="relative h-[180px] w-full sm:h-[200px]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-yapo-petroleo via-yapo-petroleo-light to-yapo-blue"
          aria-hidden
        />
        {/* Ilustración mínima: iconos de profesiones (construcción + cocina) */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-90">
          <span className="text-5xl sm:text-6xl" aria-hidden>👷</span>
          <span className="text-5xl sm:text-6xl" aria-hidden>👩‍🍳</span>
        </div>
        {/* Sello Validado */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-yapo-validacion px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
          <span aria-hidden>✓</span>
          <span>Validado</span>
        </div>
      </div>

      {/* Copys + CTA */}
      <div className="p-4 sm:p-5">
        <h2 className="text-lg font-bold text-yapo-petroleo sm:text-xl">
          Trabajo con identidad, reputación y pago protegido
        </h2>
        <p className="mt-1 text-sm text-gris-texto sm:text-base">
          Encontrá ofertas o contratá talento verificado. Todo en un solo lugar.
        </p>
        <Link
          href={primaryCtaHref}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-yapo-cta px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-yapo-cta/25 transition-all duration-200 hover:bg-yapo-cta-hover hover:shadow-xl hover:shadow-yapo-cta/30 active:scale-[0.98]"
        >
          {primaryCtaLabel}
        </Link>
      </div>
    </section>
  );
}
