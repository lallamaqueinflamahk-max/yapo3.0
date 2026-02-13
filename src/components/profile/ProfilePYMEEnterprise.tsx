"use client";

interface ProfilePYMEEnterpriseProps {
  role: string;
  ruc?: string | null;
  contactoRRHH?: string | null;
  telefono?: string | null;
  planillaMinisterioSubida?: boolean;
}

export default function ProfilePYMEEnterprise({
  role,
  ruc,
  contactoRRHH,
  telefono,
  planillaMinisterioSubida,
}: ProfilePYMEEnterpriseProps) {
  const isPymeOrEnterprise = role === "pyme" || role === "enterprise";
  if (!isPymeOrEnterprise) return null;

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Datos de empresa">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Datos verificados {role === "enterprise" ? "Enterprise" : "PyME"}
      </h2>
      <dl className="grid gap-2">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="text-xs font-medium text-foreground/60 min-w-[140px]">RUC</dt>
          <dd className="text-sm text-foreground/90">{ruc ?? "No cargado"}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="text-xs font-medium text-foreground/60 min-w-[140px]">Contacto RRHH</dt>
          <dd className="text-sm text-foreground/90">{contactoRRHH ?? "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="text-xs font-medium text-foreground/60 min-w-[140px]">Teléfono</dt>
          <dd className="text-sm text-foreground/90">{telefono ?? "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="text-xs font-medium text-foreground/60 min-w-[140px]">Planilla Ministerio (obrero patronal)</dt>
          <dd className="text-sm text-foreground/90">
            {planillaMinisterioSubida ? "Cargada" : "Pendiente de cargar"}
          </dd>
        </div>
      </dl>
      {!planillaMinisterioSubida && (
        <button
          type="button"
          className="mt-3 rounded-lg bg-yapo-blue px-3 py-2 text-sm font-medium text-yapo-white"
        >
          Cargar planillas al sistema
        </button>
      )}
    </section>
  );
}
