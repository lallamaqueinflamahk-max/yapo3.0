"use client";

import type { ProductOfferBonus } from "@/data/profile-mock";

interface ProfileProductOffersProps {
  offers: ProductOfferBonus[];
}

export default function ProfileProductOffers({ offers }: ProfileProductOffersProps) {
  if (offers.length === 0) return null;

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Ofertas con bonificación">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Ofertas para comprar con bonificaciones
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {offers.map((o) => (
          <li
            key={o.id}
            className="rounded-xl border border-yapo-amber/30 bg-yapo-amber-light/20 p-3"
          >
            <p className="font-medium text-yapo-blue">{o.title}</p>
            <p className="mt-1 text-sm text-foreground/80">{o.description}</p>
            <p className="mt-1 text-xs font-medium text-yapo-amber-dark">{o.bonus}</p>
            {o.price && (
              <p className="mt-1 text-sm font-semibold text-yapo-blue">{o.price} PYG</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
