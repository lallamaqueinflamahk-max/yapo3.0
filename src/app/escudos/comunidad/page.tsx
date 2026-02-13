"use client";

import Link from "next/link";

/**
 * Escudo Comunidad — Manual Maestro de Comunidad YAPÓ.
 * Muro Gremial segmentado, Bolsa de Changas, Botón SOS, Mbareté como administrador.
 */
const NUCLEOS = [
  {
    id: "muro",
    name: "El Muro Gremial (segmentado)",
    description: "No es un muro caótico: si sos motoqueiro ves el Feed de Movilidad; albañil, ofertas de construcción. Contenido: ofertas urgentes («Necesito un relevo YA»), noticias del sector (combustible, materiales), denuncias de clientes morosos (lista negra informal).",
  },
  {
    id: "changas",
    name: "La Bolsa de Changas (sub-contratación)",
    description: "Mercado interno entre trabajadores: un Maestro de Obra publica «Busco 2 ayudantes zona Luque. Pago al día». Liquidez laboral inmediata sin intermediarios.",
  },
  {
    id: "sos",
    name: "Botón SOS (seguridad enjambre)",
    description: "Para deliverys y choferes: botón de pánico en pantalla flotante. Envía alerta silenciosa con GPS a Capetos y Mbaretés en 2 km. Con Escudo Activo, dispara alerta a aseguradora/ambulancia. «En YAPÓ nos cuidamos entre todos».",
  },
];

const MBARETE_PODER = [
  "Los grupos no los crea cualquiera: los gestionan los Líderes Nivel 3 (Mbareté).",
  "Puede fijar mensajes importantes (Pin) y eliminar usuarios tóxicos de su grupo.",
  "Es el encargado de difundir noticias oficiales (Gobierno o App).",
  "YAPÓ le paga o le da estatus por mantener su grupo ordenado y activo.",
];

const BADGES = [
  { name: "El Solucionador", desc: "Responde dudas técnicas de otros; premio: visibilidad en búsquedas." },
  { name: "El Guardián", desc: "Acude a alertas SOS; premio: puntos de reputación extra." },
];

export default function EscudoComunidadPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>👥</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Escudo Comunidad</h1>
          <p className="text-sm text-yapo-blue/80">La Plaza Digital del trabajador — muro gremial, changas y SOS</p>
        </div>
      </header>

      <p className="mb-6 text-sm text-foreground/85">
        Comunidad es el <strong>Tereré Rupa</strong> del trabajador: noticias por rubro, bolsa de changas, seguridad enjambre y grupos moderados por Mbaretés.
      </p>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Qué es">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">¿Qué es?</h2>
        <p className="text-sm text-foreground/90">
          Es la herramienta de <strong>retención y voz</strong>: entrás a buscar trabajo una vez por semana, pero a la Comunidad entrás varias veces al día (noticias, alertas, changas). Red laboral, validación de desempeño, ranking y referidos.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Estructura">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Estructura (los 4 núcleos)</h2>
        <ul className="space-y-4">
          {NUCLEOS.map((n) => (
            <li key={n.id} className="rounded-xl border border-yapo-blue/15 p-4">
              <h3 className="font-semibold text-yapo-blue">{n.name}</h3>
              <p className="mt-2 text-sm text-foreground/80">{n.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Mbareté">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">El Mbareté como administrador</h2>
        <p className="mb-2 text-sm text-foreground/80">Las redes son moderadas. El Mbareté es el «Presidente de Seccional Digital» de su grupo (ej: Motos Luque Centro).</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
          {MBARETE_PODER.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Badges">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Badges de Comunidad</h2>
        <ul className="space-y-2">
          {BADGES.map((b) => (
            <li key={b.name} className="flex gap-2">
              <span className="font-semibold text-yapo-blue shrink-0">{b.name}:</span>
              <span className="text-sm text-foreground/80">{b.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 flex flex-col gap-3" aria-label="Accesos">
        <Link
          href="/comunidad"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/50 px-4 py-3 font-semibold text-yapo-blue"
        >
          Ir a Comunidad
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
