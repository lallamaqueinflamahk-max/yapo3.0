"use client";

import { useState } from "react";
import Link from "next/link";
import { SPONSORS_YAPO, getCategoryLabel, type SponsorYapo } from "@/data/sponsors-yapo";

function SponsorCard({ sponsor }: { sponsor: SponsorYapo }) {
  const [imgError, setImgError] = useState(false);
  const content = (
    <article
      className="nav-card-interactive flex w-[min(140px,36vw)] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-gris-ui-border bg-yapo-white shadow-md transition-all hover:border-yapo-cta/30 hover:shadow-lg active:scale-[0.98]"
      aria-label={`${sponsor.name} - ${sponsor.discountPercent}% descuento en ${sponsor.categories.map(getCategoryLabel).join(", ")}`}
    >
      <div className="flex h-20 w-full items-center justify-center bg-gris-ui/20 px-2 py-1.5">
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={sponsor.image}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-center text-lg font-bold text-yapo-petroleo" aria-hidden>
            {sponsor.name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="flex flex-col justify-center p-2">
        <p className="truncate text-center text-xs font-bold text-yapo-petroleo">{sponsor.name}</p>
        <p className="mt-0.5 text-center text-sm font-extrabold text-yapo-cta">{sponsor.discountPercent}% descuento</p>
        <p className="mt-0.5 text-center text-[10px] text-gris-texto-light">
          {sponsor.categories.map(getCategoryLabel).join(" · ")}
        </p>
      </div>
    </article>
  );

  if (sponsor.link) {
    return (
      <Link href={sponsor.link} className="snap-start focus:outline-none focus:ring-2 focus:ring-yapo-cta focus:ring-offset-2 rounded-2xl">
        {content}
      </Link>
    );
  }
  return <div className="snap-start">{content}</div>;
}

export default function SponsorsCarousel() {
  return (
    <section className="w-full py-5" aria-label="Sponsors YAPÓ y cupones de descuento">
      <div className="mx-auto max-w-[390px] px-4 sm:max-w-4xl">
        <h2 className="mb-1 text-lg font-bold text-yapo-petroleo">Sponsors YAPÓ</h2>
        <p className="mb-3 text-xs text-gris-texto-light">
          Cupones de 20% en mercaderías, medicamentos y nafta
        </p>
      </div>
      <div
        className="flex gap-4 overflow-x-auto overflow-y-visible px-4 pb-2 scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
        role="list"
        aria-label="Carrusel de sponsors. Deslizá para ver más."
        style={{ scrollPaddingInline: "1rem" }}
      >
        {SPONSORS_YAPO.map((s) => (
          <SponsorCard key={s.id} sponsor={s} />
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-gris-texto-light">Deslizá para ver más sponsors</p>
    </section>
  );
}
