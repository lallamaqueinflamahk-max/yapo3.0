"use client";

import Link from "next/link";

/**
 * Planes YAPÓ — Tabla de Cliente PRO, Trabajador PRO y Plan DUAL.
 * Los 3 pilares: YAPÓ Vale, Escudo Insurtech, Club de Descuentos.
 * Mbarete Score (biometría, posicionamiento IA, peritos PRO).
 */

const PLANES = [
  {
    id: "cliente-pro",
    name: "Cliente PRO",
    costo: "Gs. 15.000",
    yapo: "Gs. 5.000",
    insurtech: "Gs. 5.000 (Hogar)",
    vale: "Gs. 5.000",
    beneficioFinal: "Vale Gs. 20.000",
  },
  {
    id: "trabajador-pro",
    name: "Trabajador PRO",
    costo: "Gs. 20.000",
    yapo: "Gs. 8.000",
    insurtech: "Gs. 7.000 (AP)",
    vale: "Gs. 5.000",
    beneficioFinal: "Vale Gs. 20.000",
  },
  {
    id: "dual",
    name: "Plan DUAL",
    costo: "Gs. 30.000",
    yapo: "Gs. 10.000",
    insurtech: "Gs. 10.000 (Mix)",
    vale: "Gs. 10.000",
    beneficioFinal: "Vale Gs. 40.000",
  },
];

const PILARES = [
  {
    id: "vale",
    title: "YAPÓ Vale",
    icon: "🛒",
    summary: "QR único mensual para súper, nafta y farmacia. Convenios con Stock/Superseis, Petropar/Shell y farmacias aliadas. El vale supera el costo de la suscripción.",
  },
  {
    id: "insurtech",
    title: "Escudo Insurtech",
    icon: "🛡️",
    summary: "Fondo de compensación rápida con IA: hasta Gs. 5.000.000 para daños (cliente), seguro AP para trabajadores. Resolución en menos de 3 días con fotos Antes/Después.",
  },
  {
    id: "club",
    title: "Club de Descuentos",
    icon: "🏷️",
    summary: "Descuentos permanentes: 20% en ferreterías y repuestos (trabajadores), 30–50% en medicamentos críticos en farmacias aliadas (clientes).",
  },
];

export default function PlanesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>📋</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Planes y beneficios</h1>
          <p className="text-sm text-yapo-blue/80">Cliente PRO, Trabajador PRO y Plan DUAL</p>
        </div>
      </header>

      {/* Tabla de planes */}
      <section className="mb-8" aria-label="Tabla de planes">
        <h2 className="mb-3 text-base font-semibold text-yapo-blue">Distribución mensual por plan</h2>
        <div className="overflow-x-auto rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white shadow-sm">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-yapo-blue/20 bg-yapo-blue/10">
                <th className="p-3 font-semibold text-yapo-blue">Plan</th>
                <th className="p-3 font-semibold text-yapo-blue">Costo/mes</th>
                <th className="p-3 font-semibold text-yapo-blue">YAPÓ</th>
                <th className="p-3 font-semibold text-yapo-blue">Insurtech</th>
                <th className="p-3 font-semibold text-yapo-blue">Vale</th>
                <th className="p-3 font-semibold text-yapo-blue">Beneficio final</th>
              </tr>
            </thead>
            <tbody>
              {PLANES.map((p) => (
                <tr key={p.id} className="border-b border-yapo-blue/10 last:border-0">
                  <td className="p-3 font-medium text-yapo-blue">{p.name}</td>
                  <td className="p-3 text-foreground/90">{p.costo}</td>
                  <td className="p-3 text-foreground/80">{p.yapo}</td>
                  <td className="p-3 text-foreground/80">{p.insurtech}</td>
                  <td className="p-3 text-foreground/80">{p.vale}</td>
                  <td className="p-3 font-medium text-yapo-emerald">{p.beneficioFinal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Los 3 pilares */}
      <section className="mb-8" aria-label="Los tres pilares">
        <h2 className="mb-3 text-base font-semibold text-yapo-blue">Los tres pilares de beneficio real</h2>
        <div className="flex flex-col gap-4">
          {PILARES.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-semibold text-yapo-blue">
                <span aria-hidden>{p.icon}</span>
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/85">{p.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Mbarete Score */}
      <section className="mb-8 rounded-2xl border-2 border-yapo-amber/30 bg-yapo-amber-light/30 p-4" aria-label="Mbarete Score">
        <h2 className="mb-2 text-base font-semibold text-yapo-amber-dark">Mbarete Score</h2>
        <p className="text-sm text-foreground/90">
          La IA ordena la oferta con <strong>biometría</strong> (identidad verificada), <strong>posicionamiento por reseñas y zona</strong> (los PRO con mejor puntuación aparecen primero) y <strong>peritos PRO</strong> que validan daños en terreno.
        </p>
      </section>

      <nav className="flex flex-wrap gap-3">
        <Link
          href="/profile#planes"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/40 px-4 py-2 text-sm font-semibold text-yapo-blue"
        >
          Ver planes en mi perfil
        </Link>
        <Link
          href="/escudos"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-2 text-sm font-medium text-yapo-blue"
        >
          Mis Escudos
        </Link>
      </nav>
    </main>
  );
}
