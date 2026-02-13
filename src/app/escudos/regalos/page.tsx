"use client";

import Link from "next/link";

/**
 * Escudo Regalos: explicación completa, beneficios, premios, modo de uso.
 */
const BENEFICIOS = [
  { id: "premios", label: "Premios por desempeño", description: "Reconocimientos por buena calificación y cumplimiento en trabajos." },
  { id: "bonos", label: "Bonos y descuentos", description: "Descuentos en productos o servicios de partners YAPÓ." },
  { id: "referidos", label: "Beneficios por referidos", description: "Invitá a otros y sumá créditos o beneficios cuando se registren." },
  { id: "eventos", label: "Eventos y sorteos", description: "Participación en sorteos y eventos exclusivos para usuarios activos." },
];

export default function RegalosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-red/20 text-2xl text-yapo-red" aria-hidden>🎁</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Escudo Regalos</h1>
          <p className="text-sm text-yapo-blue/80">Beneficios, premios y reconocimientos laborales</p>
        </div>
      </header>

      <p className="mb-6 text-sm text-foreground/85">
        Acá ves para qué sirve el escudo Regalos, qué servicios ofrece (premios, bonos, referidos, sorteos) y cómo usarlo. Los botones al final te llevan a Billetera para activarlo o al Inicio.
      </p>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Qué es Regalos">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80 mb-2">¿Qué es?</h2>
        <p className="text-sm text-foreground/90">
          Regalos es el escudo de <strong>beneficios e incentivos</strong>. Incluye premios por desempeño, bonos, descuentos con partners y beneficios por referir a otros usuarios.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Servicios que ofrece">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80 mb-2">Servicios que ofrece</h2>
        <ul className="space-y-3">
          {BENEFICIOS.map((b) => (
            <li key={b.id} className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3">
              <span className="text-xl" aria-hidden>🎁</span>
              <div>
                <h3 className="font-semibold text-yapo-blue">{b.label}</h3>
                <p className="text-sm text-foreground/80">{b.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Cómo usar">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80 mb-2">Cómo usar este escudo</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90">
          <li>Activá el escudo Regalos desde Billetera o desde el chip en Inicio</li>
          <li>Completá trabajos y mantené buena calificación para sumar puntos o premios</li>
          <li>Revisá en Perfil o Billetera las ofertas de descuentos y bonos disponibles</li>
          <li>Referí contactos: cuando se registren y cumplan condiciones, podés recibir beneficios</li>
        </ol>
      </section>

      <section className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm" aria-label="Qué hace cada botón">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Qué hace cada botón</h2>
        <ul className="space-y-2 text-sm text-foreground/90">
          <li><strong>Ir a Billetera (activar escudo):</strong> abre tu billetera para activar el escudo Regalos y ver ofertas de bonos o premios.</li>
          <li><strong>Volver al Inicio:</strong> regresa a la pantalla principal de YAPÓ.</li>
        </ul>
      </section>

      <section className="mt-6 flex flex-col gap-3" aria-label="Accesos">
        <Link
          href="/wallet"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/50 px-4 py-3 font-semibold text-yapo-blue"
        >
          Ir a Billetera (activar escudo)
        </Link>
        <Link
          href="/home"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 font-medium text-yapo-blue"
        >
          Volver al Inicio
        </Link>
      </section>
    </main>
  );
}
