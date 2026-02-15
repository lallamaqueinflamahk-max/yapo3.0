"use client";

import Link from "next/link";

/**
 * Rincón de capacitaciones y ofertas de estudio.
 * Visible en el perfil para que el usuario acceda a formación y ofertas educativas.
 */
export default function ProfileCapacitaciones() {
  return (
    <section
      id="capacitaciones"
      className="mb-4 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 scroll-mt-20"
      aria-label="Capacitaciones y ofertas de estudio"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Rincón de capacitaciones y ofertas de estudio
      </h2>
      <p className="mb-4 text-sm text-foreground/80">
        Cursos, talleres y ofertas de estudio para mejorar tu perfil profesional.
      </p>
      <ul className="space-y-3">
        <li>
          <Link
            href="/comunidad"
            className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3 transition-[background] hover:bg-yapo-blue-light/10"
          >
            <span className="text-xl" aria-hidden>🎓</span>
            <div>
              <h3 className="font-semibold text-yapo-blue">Capacitaciones por oficio</h3>
              <p className="text-sm text-foreground/80">Cursos recomendados según tu rubro y zona.</p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            href="/comunidad"
            className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3 transition-[background] hover:bg-yapo-blue-light/10"
          >
            <span className="text-xl" aria-hidden>📚</span>
            <div>
              <h3 className="font-semibold text-yapo-blue">Ofertas de estudio</h3>
              <p className="text-sm text-foreground/80">Instituciones y becas vinculadas a YAPÓ.</p>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  );
}
