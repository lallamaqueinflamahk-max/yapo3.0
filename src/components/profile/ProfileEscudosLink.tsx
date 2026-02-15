"use client";

import Link from "next/link";

const ESCUDOS = [
  { id: "insurtech", label: "Insurtech", icon: "🛡️", href: "/escudos/insurtech" },
  { id: "fintech", label: "Fintech", icon: "💰", href: "/escudos/fintech" },
  { id: "regalos", label: "Regalos", icon: "🎁", href: "/escudos/regalos" },
  { id: "comunidad", label: "Comunidad", icon: "👥", href: "/escudos/comunidad" },
] as const;

/**
 * Los 4 escudos con enlace: siempre visibles en perfil para saber qué protecciones y beneficios hay.
 */
export default function ProfileEscudosLink() {
  return (
    <section
      id="escudos"
      className="mb-4 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 scroll-mt-20"
      aria-label="Mis escudos"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Los 4 escudos
      </h2>
      <p className="mb-3 text-sm text-foreground/80">
        Protección, fintech, regalos y comunidad. Tocá uno para ver precios y cómo activarlo.
      </p>
      <div className="flex flex-wrap gap-2">
        {ESCUDOS.map(({ id, label, icon, href }) => (
          <Link
            key={id}
            href={href}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-yapo-blue/20 bg-yapo-blue-light/20 px-3 py-2 text-sm font-medium text-yapo-blue transition-[background,border] hover:bg-yapo-blue/10 hover:border-yapo-blue/30"
          >
            <span aria-hidden>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
      <Link
        href="/escudos"
        className="mt-3 inline-block text-sm font-semibold text-yapo-blue underline"
      >
        Ver todos los escudos →
      </Link>
    </section>
  );
}
