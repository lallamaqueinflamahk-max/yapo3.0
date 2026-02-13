"use client";

/**
 * Calificaciones entre usuarios, clientes y empresas.
 */
export default function ProfileRatingsSection() {
  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Calificaciones">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Calificaciones
      </h2>
      <p className="text-sm text-foreground/80">
        Acá se muestran las calificaciones que recibís de otros usuarios, clientes o empresas, y las que vos das.
      </p>
      <div className="mt-3 rounded-xl border border-yapo-blue/10 p-4 text-center text-sm text-foreground/70">
        Próximamente: historial de calificaciones recibidas y enviadas (usuarios, clientes, empresas).
      </div>
    </section>
  );
}
