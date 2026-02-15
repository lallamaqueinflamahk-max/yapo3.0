"use client";

import Link from "next/link";

const BENEFITS = [
  { id: "escudos", href: "/escudos", label: "Mis Escudos", image: "/images/icon-escudo.png" },
  { id: "comunidad", href: "/comunidad", label: "Comunidad", icon: "👥" },
  { id: "planes", href: "/profile#planes", label: "Planes", icon: "📋" },
];

export default function BenefitsBlock() {
  return (
    <section className="mx-auto w-full max-w-[390px] px-4 py-5 sm:max-w-4xl" aria-label="Beneficios">
      <h2 className="mb-3 text-lg font-bold text-yapo-petroleo">Beneficios</h2>
      <div className="grid grid-cols-3 gap-3">
        {BENEFITS.map(({ id, href, label, icon, image }) => (
          <Link
            key={id}
            href={href}
            className="nav-card-interactive flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gris-ui-border bg-yapo-white p-4 shadow-md hover:shadow-xl hover:border-yapo-validacion/40 hover:bg-yapo-validacion/10"
          >
            {image ? (
              <span className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="text-2xl" aria-hidden>{icon}</span>
            )}
            <span className="text-sm font-semibold text-yapo-petroleo">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
