"use client";

import Link from "next/link";

/**
 * Escudo Insurtech — Manual Maestro Insurtech.
 * Productos: Escudo Moto (accidentes), Escudo Obra (daños materiales / RC), Escudo Carga (transporte).
 * No es solo accidentes: incluye responsabilidad civil y daños a terceros.
 */
const PRODUCTOS = [
  {
    id: "moto",
    name: "Escudo Moto",
    tag: "Accidentes personales",
    description: "Gastos médicos en sanatorios privados (no IPS), farmacia y renta diaria por internación. Pay-as-you-go: activalo solo los días que trabajás.",
    price: "5.000 PYG / día",
    priceNote: "Se descuenta del saldo de la Billetera. Si te caés, te atendemos rápido para que vuelvas a trabajar.",
  },
  {
    id: "obra",
    name: "Escudo Obra",
    tag: "Responsabilidad civil · Daños materiales",
    description: "Daños a terceros: si el plomero rompe un caño o el pintor mancha un sofá. En siniestro, la aseguradora emite voucher digital para canjear materiales en ferreterías partners (el dinero se queda en el ecosistema).",
    price: "15.000 PYG / trabajo",
    priceNote: "Se puede cargar al cliente final como «Tasa de Garantía». Ideal para ganar confianza en casas y obras.",
  },
  {
    id: "carga",
    name: "Escudo Carga",
    tag: "Transporte de cosas",
    description: "Daños a la mercadería transportada (muebles, electrodomésticos). El chofer sube 4 fotos obligatorias en origen; el sistema estampa fecha, hora y GPS (prueba pericial en reclamos).",
    price: "Variable según baremo (ej. heladera 2M, sofá 1M PYG)",
    priceNote: "Cobertura anti-fraude con certificación de existencia.",
  },
];

const BENEFICIOS_NIVEL = [
  { nivel: "Kavaju", beneficio: "Por cada amigo que traés, 3 días de Escudo Moto bonificados." },
  { nivel: "Capeto", beneficio: "Franquicia reducida: si tenés accidente, pagás menos deducible por buena reputación." },
  { nivel: "Mbareté", beneficio: "Panel para activar/desactivar el seguro de toda tu cuadrilla con un clic. Acceso a paquetes Gobierno para regalar seguro a tu gente." },
];

export default function InsurtechPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>🛡️</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Escudo Insurtech</h1>
          <p className="text-sm text-yapo-blue/80">Accidentes, daños materiales y transporte — todo lo que ofrece</p>
        </div>
      </header>

      <p className="mb-6 text-sm text-foreground/85">
        No es solo contra accidentes: incluye <strong>responsabilidad civil y daños a terceros</strong> (obra, carga). Acá ves los tres productos, precios y cómo activarlos desde Mis Escudos.
      </p>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Qué es Insurtech">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">¿Qué es?</h2>
        <p className="text-sm text-foreground/90">
          Escudo YAPÓ vende <strong>continuidad laboral</strong>: micro-seguros digitales por día o por trabajo. Salud en accidentes, protección por daños en obra y por daños a la mercadería en transporte.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Productos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Productos (todo lo que ofrece Insurtech)</h2>
        <ul className="space-y-4">
          {PRODUCTOS.map((p) => (
            <li key={p.id} className="rounded-xl border border-yapo-blue/15 p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-yapo-blue">{p.name}</h3>
                <span className="rounded-full bg-yapo-blue/15 px-2 py-0.5 text-xs font-medium text-yapo-blue">{p.tag}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/80">{p.description}</p>
              <p className="mt-2 text-sm font-medium text-yapo-blue">{p.price}</p>
              <p className="mt-1 text-xs text-foreground/70">{p.priceNote}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Beneficios por nivel">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Beneficios por nivel</h2>
        <ul className="space-y-2 text-sm text-foreground/90">
          {BENEFICIOS_NIVEL.map((b) => (
            <li key={b.nivel} className="flex gap-2">
              <span className="font-semibold text-yapo-blue shrink-0">{b.nivel}:</span>
              <span>{b.beneficio}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Cómo usar">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Cómo usar</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90">
          <li>Entrá a <strong>Mis Escudos</strong> (botón en el header o desde Inicio) y elegí Insurtech</li>
          <li>Activá Escudo Moto por día desde Billetera; Escudo Obra/Carga por trabajo según tu rubro</li>
          <li>En siniestro, seguí el flujo en la app (fotos, voucher según producto)</li>
        </ol>
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
