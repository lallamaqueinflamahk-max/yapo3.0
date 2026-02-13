"use client";

import Link from "next/link";

/**
 * Listado de videos subidos por el usuario (reels).
 */
export default function MisVideosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6">
        <Link href="/profile/videos" className="text-sm font-medium text-yapo-blue">
          ← Subir video
        </Link>
        <Link href="/profile" className="ml-4 text-sm font-medium text-yapo-blue">
          Perfil
        </Link>
        <h1 className="mt-2 text-xl font-bold text-yapo-blue">Mis videos</h1>
        <p className="mt-1 text-sm text-foreground/80">
          Videos que subiste para promocionar tu trabajo o tu empresa.
        </p>
      </header>
      <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-6">
        <p className="text-sm text-foreground/70">
          Aún no tenés videos. Subí el primero desde la pantalla anterior.
        </p>
      </section>
    </main>
  );
}
