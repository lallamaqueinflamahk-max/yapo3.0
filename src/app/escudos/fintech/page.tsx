"use client";

import Link from "next/link";

/**
 * Escudo Fintech — Manual Maestro Fintech: Rueda YAPÓ.
 * Rueda Chica, Rueda Pro, Rueda de Herramientas; acceso por nivel (Kavaju, Capeto, Mbareté); comisiones; Garrote Digital.
 */
const RUEDAS = [
  {
    id: "chica",
    name: "Rueda Chica",
    tag: "Economía de barrio",
    description: "Para gastos diarios, motoqueiros, despenseras. Turnos fijos (sorteo al inicio).",
    pozo: "Hasta 2.000.000 PYG",
    frecuencia: "Semanal o quincenal",
    comision: "8% sobre el pozo total (descontado al ganador de cada turno).",
  },
  {
    id: "pro",
    name: "Rueda Pro",
    tag: "Pymes y gremios",
    description: "Capital de trabajo, compra de insumos, mejoras. Licitación o turno fijo.",
    pozo: "5.000.000 a 20.000.000 PYG",
    frecuencia: "Mensual",
    comision: "4% sobre el pozo total.",
  },
  {
    id: "herramientas",
    name: "Rueda de Herramientas",
    tag: "Sponsoreada",
    description: "El pozo se paga en vouchers para retirar equipos de un sponsor (ferretería, casa de motos). El sponsor puede subsidiar la comisión. Ideal para que los Mbaretés equipen a sus cuadrillas.",
    pozo: "Según sponsor",
    frecuencia: "Según acuerdo",
    comision: "Fee de gestión (cobrado al sponsor) + posible bonificación al organizador.",
  },
];

const NIVELES_ACCESO = [
  { nivel: "Kavaju", rol: "Participante", beneficio: "Genera su primer Score Crediticio YAPÓ para mostrar a futuros patrones." },
  { nivel: "Capeto", rol: "Organizador Jr.", beneficio: "Puede crear ruedas con sus amigos y elegir quién entra. Gana reputación." },
  { nivel: "Mbareté", rol: "El Banquero del Barrio", beneficio: "Gestiona Ruedas de Herramientas subsidiadas; en Ruedas Pro que organice, YAPÓ puede bonificar su cuota de administración. Prioridad B2B." },
];

const REGLAS_GARROTE = [
  "Si fallás en la Rueda, bloqueo total: no podés recibir trabajos ni ofertas en la app.",
  "Lista Negra Gremial: tu perfil aparece con marca de «Deudor» visible para otros contratistas.",
  "Si entraste por referido, tu Padrino pierde puntos de Score (presión social para que pagues).",
  "En Ruedas PRO se puede contratar Seguro de Rueda (Insurtech) para cubrir cuota si uno falla.",
];

export default function FintechPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>💰</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Escudo Fintech · Rueda YAPÓ</h1>
          <p className="text-sm text-yapo-blue/80">Acceso a ruedas: ahorro, micro-crédito y scoring social</p>
        </div>
      </header>

      <p className="mb-6 text-sm text-foreground/85">
        Fintech te da <strong>acceso a ruedas</strong> de dinero: Rueda Chica, Rueda Pro y Rueda de Herramientas. Comisiones, montos y beneficios según tu nivel (Kavaju, Capeto, Mbareté).
      </p>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Qué es">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">¿Qué es?</h2>
        <p className="text-sm text-foreground/90">
          Rueda YAPÓ es un <strong>gestor de confianza</strong>: ahorro en grupo y acceso a liquidez sin papeleo bancario. El dinero circula en la app; YAPÓ administra y cobra comisión. No somos banco: plataforma de mandato entre particulares.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Tipos de ruedas">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Tipos de ruedas (catálogo completo)</h2>
        <ul className="space-y-4">
          {RUEDAS.map((r) => (
            <li key={r.id} className="rounded-xl border border-yapo-blue/15 p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-yapo-blue">{r.name}</h3>
                <span className="rounded-full bg-yapo-blue/15 px-2 py-0.5 text-xs font-medium text-yapo-blue">{r.tag}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{r.description}</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>Pozo:</strong> {r.pozo}</li>
                <li><strong>Frecuencia:</strong> {r.frecuencia}</li>
                <li><strong>Comisión YAPÓ:</strong> {r.comision}</li>
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Acceso por nivel">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Acceso por nivel (qué tenés según tu rol)</h2>
        <ul className="space-y-3">
          {NIVELES_ACCESO.map((n) => (
            <li key={n.nivel} className="flex flex-col gap-1 rounded-xl border border-yapo-blue/10 p-3">
              <span className="font-semibold text-yapo-blue">{n.nivel} · {n.rol}</span>
              <span className="text-sm text-foreground/80">{n.beneficio}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-red/15 bg-yapo-white p-4 shadow-sm" aria-label="Consecuencias de no pago">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-red/90">Si no pagás tu cuota (Garrote Digital)</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
          {REGLAS_GARROTE.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Cómo entrar">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Cómo entrar</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90">
          <li>Entrá a Billetera y buscá la sección <strong>Ruedas</strong> o <strong>Fintech</strong></li>
          <li>Elegí tipo (Chica, Pro o Herramientas) y unite a una existente o creá una (según tu nivel)</li>
          <li>Aceptá las reglas y pagá tu cuota en fecha; cuando te toque, recibís el pozo menos comisión</li>
        </ol>
      </section>

      <section className="mt-6 flex flex-col gap-3" aria-label="Accesos">
        <Link
          href="/wallet"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/50 px-4 py-3 font-semibold text-yapo-blue"
        >
          Ir a Billetera (ruedas y pagos)
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
