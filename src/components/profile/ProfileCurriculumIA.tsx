"use client";

import Link from "next/link";

/**
 * Apartado para crear currículum digital con YAPÓ IA.
 */
export default function ProfileCurriculumIA() {
  return (
    <section
      id="curriculum-ia"
      className="mb-4 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 scroll-mt-20"
      aria-label="Currículum digital con YAPÓ IA"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Currículum digital con YAPÓ IA
      </h2>
      <p className="mb-4 text-sm text-foreground/80">
        Generá tu CV digital a partir de tu perfil, oficios y experiencia. La IA de YAPÓ te ayuda a destacar.
      </p>
      <Link
        href="/profile/curriculum"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/30 px-4 py-3 font-semibold text-yapo-blue transition-[transform,background] active:scale-[0.98] active:bg-yapo-blue/10"
      >
        <span aria-hidden>📄</span>
        Crear o editar mi currículum digital
      </Link>
    </section>
  );
}
