"use client";

import { useState } from "react";
import Link from "next/link";
import { EscudoBadge, ESCUDO_IDS } from "@/features/escudos";
import type { EscudoId } from "@/features/escudos/types";

type Paso = 1 | 2 | 3 | 4 | 5;

const PASOS: { n: Paso; titulo: string; descripcion: string; escudosQueSeActivan: EscudoId[]; detalle: string }[] = [
  {
    n: 1,
    titulo: "Demanda",
    descripcion: "Cliente publica necesidad",
    escudosQueSeActivan: [],
    detalle: "«Necesito electricista en Sajonia, instalación de tablero.» La demanda queda visible en la comunidad y en el mapa por zona.",
  },
  {
    n: 2,
    titulo: "Oferta",
    descripcion: "Profesional responde con presupuesto",
    escudosQueSeActivan: ["insurtech"],
    detalle: "María G. (perfil verificado ✓) responde: 180.000 Gs, incluye mano de obra. Tiene Escudo Insurtech activo: trabajo asegurado contra accidentes y daños a terceros.",
  },
  {
    n: 3,
    titulo: "Aceptación y contrato",
    descripcion: "Cliente acepta → Contrato + custodia (Escrow)",
    escudosQueSeActivan: ["insurtech", "fintech"],
    detalle: "Se genera el Contrato Flash. YAPÓ genera QR de pago de seña (50%). Los fondos quedan en custodia (Fintech/Escrow). Seguridad transaccional activada.",
  },
  {
    n: 4,
    titulo: "Trabajo realizado",
    descripcion: "Profesional sube prueba de trabajo",
    escudosQueSeActivan: ["insurtech", "fintech"],
    detalle: "María sube foto del tablero instalado. La prueba queda registrada con fecha y hora. El cliente puede revisar antes de liberar el pago.",
  },
  {
    n: 5,
    titulo: "Liberación de pago",
    descripcion: "Cliente libera → Profesional recibe el saldo",
    escudosQueSeActivan: ["insurtech", "fintech"],
    detalle: "Cliente confirma que el trabajo está bien. El 50% restante se libera a María. Todo el flujo quedó protegido por Insurtech (riesgos) y Fintech (dinero en custodia).",
  },
];

/** Escudos de verificación/seguridad que mostramos en la demo (no solo los 4 oficiales: añadimos "Verificación" como concepto). */
const ESCUDOS_DEMO: { id: string; label: string; icon: string; cuandoSeActiva: string }[] = [
  { id: "verificacion", label: "Verificación", icon: "✓", cuandoSeActiva: "Cuando el profesional tiene perfil verificado (documento, biometría)." },
  { id: "insurtech", label: "Insurtech", icon: "🛡️", cuandoSeActiva: "Cuando el profesional tiene seguro activo (accidentes, daños obra/carga)." },
  { id: "fintech", label: "Seguridad transaccional", icon: "💰", cuandoSeActiva: "Cuando hay contrato y dinero en custodia (Escrow 50% seña, liberación por hitos)." },
];

export default function DemoOfertaDemandaPage() {
  const [paso, setPaso] = useState<Paso>(1);
  const pasoActual = PASOS.find((p) => p.n === paso)!;
  const escudosActivosEnEstePaso = new Set<EscudoId>(pasoActual.escudosQueSeActivan);

  return (
    <main className="min-h-screen bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6">
        <Link href="/escudos" className="text-sm font-medium text-yapo-blue hover:underline">
          ← Escudos
        </Link>
        <h1 className="mt-2 text-xl font-bold text-yapo-blue">
          Demo: Oferta y Demanda
        </h1>
        <p className="mt-1 text-sm text-foreground/80">
          Interacción ficticia para ver cómo se activan los escudos de verificación y seguridad transaccional.
        </p>
      </header>

      {/* Indicador de paso */}
      <section className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(PASOS as typeof PASOS).map((p) => (
          <button
            key={p.n}
            type="button"
            onClick={() => setPaso(p.n)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              paso === p.n
                ? "bg-yapo-blue text-yapo-white"
                : "bg-yapo-white border-2 border-yapo-blue/20 text-yapo-blue"
            }`}
          >
            {p.n}. {p.titulo}
          </button>
        ))}
      </section>

      {/* Contenido del paso actual */}
      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-yapo-blue">
          Paso {paso}: {pasoActual.titulo}
        </h2>
        <p className="mt-1 text-sm text-foreground/70">{pasoActual.descripcion}</p>
        <p className="mt-3 text-sm text-foreground/90">{pasoActual.detalle}</p>
      </section>

      {/* Escudos que se activan en este paso */}
      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Escudos activados en este paso
        </h3>
        {paso === 1 ? (
          <p className="mt-2 text-sm text-foreground/70">
            En la demanda aún no hay match; los escudos se activan cuando aparece la oferta y el acuerdo.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {ESCUDOS_DEMO.map((e) => {
              const activo = e.id === "verificacion" ? paso >= 2 : escudosActivosEnEstePaso.has(e.id as EscudoId);
              return (
                <span
                  key={e.id}
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-medium ${
                    activo
                      ? "border-yapo-blue bg-yapo-blue/15 text-yapo-blue"
                      : "border-black/15 bg-black/5 text-black/60"
                  }`}
                  title={e.cuandoSeActiva}
                >
                  <span aria-hidden>{e.icon}</span>
                  <span>{e.label}</span>
                  {activo && <span className="text-xs">✓</span>}
                </span>
              );
            })}
          </div>
        )}
        <ul className="mt-3 space-y-1.5 text-xs text-foreground/70">
          {ESCUDOS_DEMO.map((e) => (
            <li key={e.id}>
              <strong>{e.label}:</strong> {e.cuandoSeActiva}
            </li>
          ))}
        </ul>
      </section>

      {/* Badges oficiales (Insurtech, Fintech, etc.) */}
      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Escudos YAPÓ (oficiales)
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ESCUDO_IDS.map((id) => (
            <EscudoBadge
              key={id}
              escudoId={id}
              active={escudosActivosEnEstePaso.has(id)}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Navegación */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPaso((p) => Math.max(1, p - 1) as Paso)}
          disabled={paso === 1}
          className="flex-1 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white py-3 font-medium text-yapo-blue disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setPaso((p) => Math.min(5, p + 1) as Paso)}
          disabled={paso === 5}
          className="flex-1 rounded-xl bg-yapo-blue py-3 font-medium text-yapo-white disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-foreground/60">
        Esta es una simulación. En la app real, los escudos se activan según contrato, billetera y estado del profesional.
      </p>
    </main>
  );
}
