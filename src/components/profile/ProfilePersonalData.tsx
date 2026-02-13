"use client";

interface ProfilePersonalDataProps {
  country?: string | null;
  territory?: string | null;
  workStatus?: string | null;
  workType?: string | null;
  education?: string | null;
  certifications?: string | null;
  telefono?: string | null;
  titulo?: string | null;
}

const LABELS: Record<string, string> = {
  country: "País",
  territory: "Territorio / Zona",
  workStatus: "Estado laboral",
  workType: "Tipo de trabajo / Profesión",
  education: "Educación",
  certifications: "Capacitaciones / Certificaciones",
  telefono: "Teléfono",
  titulo: "Título",
};

export default function ProfilePersonalData(props: ProfilePersonalDataProps) {
  const entries = [
    ["country", props.country],
    ["territory", props.territory],
    ["workStatus", props.workStatus],
    ["workType", props.workType],
    ["education", props.education],
    ["certifications", props.certifications],
    ["telefono", props.telefono],
    ["titulo", props.titulo],
  ].filter(([, v]) => v != null && String(v).trim() !== "");

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Datos personales">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Datos personales
        </h2>
        <p className="text-sm text-foreground/70">Completá tu perfil para que se muestren aquí.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Datos personales">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Datos personales
      </h2>
      <dl className="grid gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <dt className="text-xs font-medium text-foreground/60 min-w-[140px]">
              {LABELS[key as keyof typeof LABELS] ?? key}
            </dt>
            <dd className="text-sm text-foreground/90">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
