"use client";

interface ProfileAntecedentesProps {
  requeridos: boolean;
  completados: boolean;
}

export default function ProfileAntecedentes({ requeridos, completados }: ProfileAntecedentesProps) {
  return (
    <section className="rounded-2xl border border-yapo-validacion/25 bg-gradient-to-br from-yapo-white to-yapo-validacion/10 p-4" aria-label="Antecedentes">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Antecedentes policiales y judiciales
      </h2>
      <p className={`rounded-xl px-4 py-3 text-sm font-medium ${completados ? "bg-yapo-validacion/20 text-yapo-validacion-dark" : requeridos ? "bg-yapo-cta/10 text-yapo-petroleo" : "bg-yapo-blue-light/20 text-gris-texto"}`}>
        {requeridos
          ? completados
            ? "Requerimiento cumplido: antecedentes presentados y verificados."
            : "Este perfil requiere antecedentes policiales y judiciales. Completalos en la sección de verificación."
          : "No se requiere presentación de antecedentes para tu perfil actual."}
      </p>
      {requeridos && !completados && (
        <button
          type="button"
          className="btn-interactive mt-3 rounded-xl bg-yapo-cta px-4 py-2.5 text-sm font-semibold text-yapo-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover"
        >
          Completar antecedentes
        </button>
      )}
    </section>
  );
}
