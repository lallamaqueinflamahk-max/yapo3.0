"use client";

interface ProfileAntecedentesProps {
  requeridos: boolean;
  completados: boolean;
}

export default function ProfileAntecedentes({ requeridos, completados }: ProfileAntecedentesProps) {
  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Antecedentes">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Antecedentes policiales y judiciales
      </h2>
      <p className="text-sm text-foreground/80">
        {requeridos
          ? completados
            ? "Requerimiento cumplido: antecedentes presentados y verificados."
            : "Este perfil requiere antecedentes policiales y judiciales. Completalos en la sección de verificación."
          : "No se requiere presentación de antecedentes para tu perfil actual."}
      </p>
      {requeridos && !completados && (
        <button
          type="button"
          className="mt-3 rounded-lg bg-yapo-blue px-3 py-2 text-sm font-medium text-yapo-white"
        >
          Completar antecedentes
        </button>
      )}
    </section>
  );
}
