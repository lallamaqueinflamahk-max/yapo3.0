"use client";

import Link from "next/link";

/**
 * Mis Escudos — Hub que lista los 4 escudos con lo que realmente ofrece cada uno.
 * Insurtech: accidentes + daños materiales (Obra, Carga). Fintech: acceso a ruedas.
 */
const ESCUDOS = [
  {
    id: "insurtech",
    name: "Insurtech",
    icon: "🛡️",
    summary: "Accidentes (Moto), daños materiales (Obra), transporte (Carga). No solo accidentes: responsabilidad civil y vouchers para materiales.",
    href: "/escudos/insurtech",
  },
  {
    id: "fintech",
    name: "Fintech · Rueda YAPÓ",
    icon: "💰",
    summary: "Acceso a ruedas: Rueda Chica, Rueda Pro, Rueda de Herramientas. Comisiones 4–8%, niveles Kavaju/Capeto/Mbareté.",
    href: "/escudos/fintech",
  },
  {
    id: "regalos",
    name: "Regalos",
    icon: "🎁",
    summary: "Beneficios, premios por desempeño, referidos, sorteos y eventos.",
    href: "/escudos/regalos",
  },
  {
    id: "comunidad",
    name: "Comunidad",
    icon: "👥",
    summary: "Muro gremial segmentado, Bolsa de Changas, Botón SOS, grupos moderados por Mbareté.",
    href: "/escudos/comunidad",
  },
];

export default function EscudosHubPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>🛡️</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Mis Escudos</h1>
          <p className="text-sm text-yapo-blue/80">Todo lo que ofrece cada escudo en YAPÓ</p>
        </div>
      </header>

      <p className="mb-6 text-sm text-foreground/85">
        Tu suscripción PRO incluye <strong>YAPÓ Vale</strong> (QR en súper/nafta/farmacia), <strong>Escudo Insurtech</strong> (daños y accidentes) y <strong>Club de descuentos</strong>. Acá ves los cuatro escudos: Insurtech, Fintech (ruedas), Regalos y Comunidad. Tocá uno para ver precios, reglas y cómo activarlo.
      </p>

      <section className="flex flex-col gap-4" aria-label="Listado de escudos">
        {ESCUDOS.map((e) => (
          <Link
            key={e.id}
            href={e.href}
            className="flex gap-4 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm transition-[border-color,background] active:border-yapo-blue/40 active:bg-yapo-blue-light/20"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue/15 text-2xl" aria-hidden>{e.icon}</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-yapo-blue">{e.name}</h2>
              <p className="mt-1 text-sm text-foreground/80">{e.summary}</p>
            </div>
            <span className="shrink-0 text-yapo-blue" aria-hidden>→</span>
          </Link>
        ))}
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <Link
          href="/demo/oferta-demanda"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-amber/40 bg-yapo-amber-light/50 px-4 py-3 font-semibold text-yapo-amber-dark"
        >
          Demo: Oferta y Demanda (ver cómo se activan los escudos)
        </Link>
        <Link
          href="/wallet"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/50 px-4 py-3 font-semibold text-yapo-blue"
        >
          Ir a Billetera (activar escudos)
        </Link>
      </section>

      <section className="mt-3">
        <Link
          href="/home"
          className="flex min-h-[48px] items-center justify-center rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-2.5 font-medium text-yapo-blue"
        >
          Volver al Inicio
        </Link>
      </section>
    </main>
  );
}
