"use client";

import Link from "next/link";

/**
 * Subir videos en formato reels (Instagram/Facebook) para promocionar trabajo o necesidades de PYME/Enterprise.
 */
export default function ProfileVideosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6">
        <Link href="/profile" className="text-sm font-medium text-yapo-blue">
          ← Volver al perfil
        </Link>
        <h1 className="mt-2 text-xl font-bold text-yapo-blue">Subir video (reels)</h1>
        <p className="mt-1 text-sm text-foreground/80">
          Subí un video corto tipo Instagram o Facebook para promocionar tu trabajo o lo que tu empresa necesita.
        </p>
      </header>
      <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-6">
        <p className="text-sm text-foreground/80">
          Acá podés grabar o elegir un video desde tu dispositivo. Formatos soportados: vertical (reels), hasta 60 segundos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-yapo-blue px-4 py-3 font-medium text-yapo-white"
          >
            Grabar video
          </button>
          <button
            type="button"
            className="rounded-xl border-2 border-yapo-blue/30 px-4 py-3 font-medium text-yapo-blue"
          >
            Elegir desde galería
          </button>
        </div>
      </section>
    </main>
  );
}
