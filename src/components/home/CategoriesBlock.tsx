"use client";

import Link from "next/link";

const CATEGORIES = [
  { id: "oficios", href: "/mapa?categoria=oficios", label: "Oficios", icon: "🔧" },
  { id: "movilidad", href: "/mapa?categoria=movilidad", label: "Movilidad", icon: "🚗" },
  { id: "cuidados", href: "/mapa?categoria=cuidados", label: "Cuidados", icon: "❤️" },
  { id: "profesionales", href: "/mapa?categoria=profesionales", label: "Profesionales", icon: "💼" },
];

export default function CategoriesBlock() {
  return (
    <section className="mx-auto w-full max-w-[390px] px-4 py-5 sm:max-w-4xl" aria-label="Categorías">
      <h2 className="mb-3 text-lg font-bold text-yapo-petroleo">Categorías</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map(({ id, href, label, icon }) => (
          <Link
            key={id}
            href={href}
            className="nav-card-interactive flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gris-ui-border bg-yapo-white p-4 shadow-md hover:shadow-xl hover:border-yapo-cta/40 hover:bg-yapo-cta/5"
          >
            <span className="text-2xl" aria-hidden>{icon}</span>
            <span className="text-sm font-semibold text-yapo-petroleo">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
