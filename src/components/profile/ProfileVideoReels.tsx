"use client";

import Link from "next/link";

/**
 * Sección para subir y ver videos en formato reels (Instagram/Facebook)
 * para promocionar trabajo o lo que necesitan PYMEs/Enterprises.
 */
export default function ProfileVideoReels() {
  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Videos y promoción">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Videos (formato reels)
      </h2>
      <p className="text-sm text-foreground/80">
        Subí videos cortos tipo Instagram o Facebook para promocionar tu trabajo o lo que tu empresa o PYME necesita.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/profile/videos"
          className="rounded-lg bg-yapo-blue px-4 py-2 text-sm font-medium text-yapo-white"
        >
          Subir video
        </Link>
        <Link
          href="/profile/videos/mis-videos"
          className="rounded-lg border-2 border-yapo-blue/30 px-4 py-2 text-sm font-medium text-yapo-blue"
        >
          Ver mis videos
        </Link>
      </div>
      <p className="mt-2 text-xs text-foreground/60">
        Promocioná tu desempeño o las ofertas de tu empresa para llegar a más personas.
      </p>
    </section>
  );
}
