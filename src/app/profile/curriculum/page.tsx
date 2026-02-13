"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Currículum digital con YAPÓ IA.
 * Estructura lista para conectar con OpenAI: el botón "Generar con IA" disparará el flujo de generación.
 */
export default function ProfileCurriculumPage() {
  const [nombre, setNombre] = useState("");
  const [oficio, setOficio] = useState("");
  const [resumen, setResumen] = useState("");
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleGenerarIA = async () => {
    setGenerando(true);
    setMensaje(null);
    try {
      // Placeholder: aquí se llamará al backend que use OpenAI para generar/mejorar el CV
      await new Promise((r) => setTimeout(r, 800));
      setMensaje("Próximamente conectado a YAPÓ IA (OpenAI). Completá nombre, oficio y resumen para usarlo como base.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <div className="mb-4">
        <Link href="/profile#curriculum-ia" className="text-yapo-blue underline">
          ← Volver al perfil
        </Link>
      </div>

      <section className="mb-6 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-6">
        <h1 className="mb-1 text-xl font-bold text-yapo-blue">Currículum digital con YAPÓ IA</h1>
        <p className="mb-4 text-sm text-foreground/80">
          Generá tu CV a partir de tu perfil, oficios y experiencia. La IA te ayuda a redactar y destacar.
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground/70">Nombre completo</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. María López"
              className="w-full rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue placeholder:text-yapo-blue/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground/70">Oficio o profesión</span>
            <input
              type="text"
              value={oficio}
              onChange={(e) => setOficio(e.target.value)}
              placeholder="Ej. Plomería, Electricista"
              className="w-full rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue placeholder:text-yapo-blue/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground/70">Resumen (experiencia, habilidades)</span>
            <textarea
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Contá en pocas líneas tu experiencia y qué ofrecés."
              rows={4}
              className="w-full rounded-xl border border-yapo-blue/20 bg-white px-3 py-2.5 text-sm text-yapo-blue placeholder:text-yapo-blue/50"
            />
          </label>

          <button
            type="button"
            onClick={handleGenerarIA}
            disabled={generando}
            className="w-full rounded-xl bg-yapo-blue py-3 text-sm font-semibold text-white transition-[opacity] disabled:opacity-60"
          >
            {generando ? "Preparando…" : "Generar currículum con YAPÓ IA"}
          </button>

          {mensaje && (
            <p className="rounded-xl border border-yapo-blue/20 bg-yapo-blue-light/20 px-3 py-2 text-sm text-yapo-blue">
              {mensaje}
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-foreground/60">
          Los datos de Mi perfil (educación, certificaciones, territorio) se usarán para enriquecer el CV cuando la IA esté conectada.
        </p>
      </section>
    </main>
  );
}
