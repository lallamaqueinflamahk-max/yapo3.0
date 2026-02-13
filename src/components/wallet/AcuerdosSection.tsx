"use client";

import Link from "next/link";
import type { Acuerdo } from "@/features/contrato";

const ESTADO_LABEL: Record<Acuerdo["estado"], string> = {
  borrador: "Borrador",
  aceptado: "Aceptado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
  disputa: "En disputa",
};

function formatAmount(value: number): string {
  return value.toLocaleString("es-PY", { maximumFractionDigits: 0 });
}

interface AcuerdosSectionProps {
  acuerdos: Acuerdo[];
  currentUserId: string;
  loading?: boolean;
}

export default function AcuerdosSection({
  acuerdos,
  currentUserId,
  loading,
}: AcuerdosSectionProps) {
  if (loading) {
    return (
      <section
        className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4"
        aria-label="Acuerdos de trabajo"
      >
        <h2 className="text-lg font-semibold text-yapo-blue">Acuerdos de trabajo</h2>
        <p className="mt-2 text-sm text-foreground/60">Cargando…</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4"
      aria-label="Acuerdos de trabajo"
    >
      <h2 className="text-lg font-semibold text-yapo-blue">Acuerdos de trabajo (Contrato Digital Flash)</h2>
      <p className="mt-1 text-xs text-foreground/70">
        Reglas claras antes del trabajo: C.I. de ambas partes, descripción técnica y monto inmutable. Vinculados a garantía de pago cuando aplique.
      </p>
      {acuerdos.length === 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-foreground/60">Aún no tenés acuerdos.</p>
          <Link
            href="/trabajo/aceptar"
            className="inline-block rounded-lg bg-yapo-blue/15 px-3 py-2 text-sm font-medium text-yapo-blue"
          >
            Aceptar un trabajo (generar contrato)
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {acuerdos.map((a) => {
            const soyCliente = a.clienteId === currentUserId;
            return (
              <li
                key={a.id}
                className="flex flex-col gap-1.5 rounded-xl border border-yapo-blue/10 bg-yapo-blue-light/5 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-yapo-blue/90">{a.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.estado === "completado"
                        ? "bg-yapo-emerald/20 text-yapo-emerald-dark"
                        : a.estado === "en_curso" || a.estado === "aceptado"
                          ? "bg-yapo-blue/15 text-yapo-blue"
                          : a.estado === "disputa" || a.estado === "cancelado"
                            ? "bg-yapo-red/15 text-yapo-red-dark"
                            : "bg-foreground/10 text-foreground/80"
                    }`}
                  >
                    {ESTADO_LABEL[a.estado]}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground/90">{a.descripcion}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                  <span>
                    {formatAmount(a.montoTotal)} {a.moneda}
                  </span>
                  <span>·</span>
                  <span>{soyCliente ? "Sos cliente" : "Sos profesional"}</span>
                  {a.conEscudoPago && (
                    <>
                      <span>·</span>
                      <span className="text-yapo-blue font-medium">Con garantía de pago</span>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
