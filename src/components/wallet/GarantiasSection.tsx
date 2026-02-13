"use client";

import type { EscrowOrder, EscrowOrderState } from "@/features/escudo-pago";

const ESTADO_LABEL: Record<EscrowOrderState, string> = {
  creado: "Creado",
  en_custodia: "En custodia",
  iniciado: "Iniciado",
  finalizado: "Finalizado",
  disputa: "En disputa",
  cancelado: "Cancelado",
};

function formatAmount(value: number): string {
  return value.toLocaleString("es-PY", { maximumFractionDigits: 0 });
}

interface GarantiasSectionProps {
  garantias: EscrowOrder[];
  currentUserId: string;
  loading?: boolean;
}

export default function GarantiasSection({
  garantias,
  currentUserId,
  loading,
}: GarantiasSectionProps) {
  if (loading) {
    return (
      <section
        className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4"
        aria-label="Garantías de pago"
      >
        <h2 className="text-lg font-semibold text-yapo-blue">Garantías de pago</h2>
        <p className="mt-2 text-sm text-foreground/60">Cargando…</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4"
      aria-label="Garantías de pago"
    >
      <h2 className="text-lg font-semibold text-yapo-blue">Garantías de pago (Escudo YAPÓ)</h2>
      <p className="mt-1 text-xs text-foreground/70">
        Dinero en custodia: 50% al inicio (QR), 50% al finalizar. <strong>En disputa</strong>: YAPÓ retiene el fondo hasta que un mediador revise la evidencia (contrato, fotos). Los pagos liberados aparecen en el historial abajo. Es obligatorio al menos el 50%; si no cumple, se sanciona en YAPÓ y tenés opción de elegir otro trabajo más bonificaciones por ética profesional.
      </p>
      {garantias.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Aún no tenés garantías activas.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {garantias.map((g) => {
            const soyCliente = g.clienteId === currentUserId;
            const liberados = g.hitos.filter((h) => h.liberadoAt).length;
            const totalHitos = g.hitos.length;
            return (
              <li
                key={g.id}
                className="flex flex-col gap-1.5 rounded-xl border border-yapo-blue/10 bg-yapo-blue-light/5 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-yapo-blue/90">{g.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      g.estado === "finalizado"
                        ? "bg-yapo-emerald/20 text-yapo-emerald-dark"
                        : g.estado === "iniciado" || g.estado === "en_custodia"
                          ? "bg-yapo-blue/15 text-yapo-blue"
                          : g.estado === "disputa" || g.estado === "cancelado"
                            ? "bg-yapo-red/15 text-yapo-red-dark"
                            : "bg-foreground/10 text-foreground/80"
                    }`}
                  >
                    {ESTADO_LABEL[g.estado]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-yapo-blue">
                    {formatAmount(g.montoTotal)} {g.moneda}
                  </span>
                  <span className="text-foreground/70">
                    · Hitos {liberados}/{totalHitos} liberados
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.hitos.map((h, i) => (
                    <span
                      key={i}
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        h.liberadoAt ? "bg-yapo-emerald/20 text-yapo-emerald-dark" : "bg-foreground/10 text-foreground/70"
                      }`}
                    >
                      {h.porcentaje}% {h.liberadoAt ? "✓" : "pend."}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-foreground/60">
                  {soyCliente ? "Sos quien depositó" : "Sos quien recibe por hitos"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
