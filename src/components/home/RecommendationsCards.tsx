"use client";

import Link from "next/link";

const CARDS = [
  { id: "top-empleos", href: "/mapa", title: "Top empleos en tu zona", desc: "Ofertas destacadas cerca", image: "/images/top-empleos-zona.png" },
  { id: "habilidades", href: "/mapa?habilidades=1", title: "Habilidades en demanda", desc: "Formación y oportunidades", image: "/images/habilidades-demanda.png" },
  { id: "empresas", href: "/comunidad", title: "Empresas buscando", desc: "Quién está contratando", image: "/images/empresas-buscando.png" },
];

export default function RecommendationsCards() {
  return (
    <section className="mx-auto w-full max-w-[390px] px-4 py-5 sm:max-w-4xl" aria-label="Recomendaciones">
      <h2 className="mb-3 text-lg font-bold text-yapo-petroleo">Recomendaciones</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        {CARDS.map(({ id, href, title, desc, icon, image }) => (
          <Link
            key={id}
            href={href}
            className={`nav-card-interactive flex flex-col overflow-hidden rounded-2xl border-2 border-gris-ui-border bg-yapo-white shadow-md hover:border-yapo-blue/40 hover:shadow-xl hover:bg-yapo-blue-light/20 snap-start ${image ? "min-w-[280px] max-w-[300px] h-[320px]" : "min-w-[280px] max-w-[300px]"}`}
          >
            {image ? (
              <>
                <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-gris-ui">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-full w-full object-cover object-center" />
                </div>
                <div className="shrink-0 border-t border-gris-ui-border bg-yapo-white px-4 py-3">
                  <h3 className="font-recommendations text-base font-bold tracking-tight text-yapo-petroleo">{title}</h3>
                  <p className="mt-0.5 text-xs text-gris-texto-light leading-snug">{desc}</p>
                </div>
              </>
            ) : (
              <>
                <span className="block pt-4 px-4 text-3xl" aria-hidden>{icon}</span>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-recommendations text-lg font-bold tracking-tight text-yapo-petroleo">{title}</h3>
                  <p className="mt-1 text-sm text-gris-texto-light leading-snug">{desc}</p>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
