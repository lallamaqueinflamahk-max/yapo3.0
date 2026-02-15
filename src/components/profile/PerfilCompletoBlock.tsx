"use client";

import type { PerfilCompletoYapo, GrupoPreclasificacion } from "@/types/perfil-completo-yapo";

const GRUPO_LABELS: Record<GrupoPreclasificacion, string> = {
  A: "GRUPO A (Oficio Certificado): Posee título oficial. Validación Rápida.",
  B: "GRUPO B (Oficio por Historial): Sin título, experiencia comprobable. Comité de Validación.",
  C: "GRUPO C (Declarado sin Respaldo): Sin referencias ni historial. Deriva a capacitación.",
};

const GRUPO_STYLE: Record<GrupoPreclasificacion, string> = {
  A: "bg-yapo-emerald/20 text-yapo-emerald-dark border-yapo-emerald/40",
  B: "bg-yapo-amber/20 text-yapo-amber-dark border-yapo-amber/40",
  C: "bg-yapo-red/15 text-yapo-red border-yapo-red/30",
};

export default function PerfilCompletoBlock({ data }: { data: PerfilCompletoYapo }) {
  const { identidad, conectividad, perfilLaboral, nivelEstudios, seguroPrevisionSocial, situacionLaboral, respaldoConfianza, promotorYapo, gestorZona, cedulaOperadorYapo, grupoPreclasificacion } = data;

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-yapo-blue/15 bg-yapo-blue-light/5 p-4">
      <h2 className="text-base font-bold text-yapo-petroleo">Perfil completo (censo YAPÓ)</h2>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Identidad</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>Nombre completo:</strong> {identidad.nombreCompleto}</li>
          <li><strong>Nro. de Cédula (OCR):</strong> {identidad.cedulaOcr}</li>
          <li><strong>Biometría Facial / Huella digital:</strong> {identidad.biometriaFacialHuella}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Conectividad social</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>WhatsApp (OTP):</strong> {conectividad.whatsappOtp ?? "—"}</li>
          <li><strong>Correo electrónico:</strong> {conectividad.email ?? "—"}</li>
          <li><strong>Facebook:</strong> {conectividad.facebook ? `@${conectividad.facebook}` : "—"}</li>
          <li><strong>Instagram:</strong> {conectividad.instagram ? `@${conectividad.instagram}` : "—"}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Perfil laboral</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>Oficio principal:</strong> {perfilLaboral.oficioPrincipal}</li>
          {perfilLaboral.oficioSecundario && <li><strong>Oficio secundario:</strong> {perfilLaboral.oficioSecundario}</li>}
          <li><strong>Años de experiencia:</strong> {perfilLaboral.anosExperiencia}</li>
          <li><strong>Ubicación real de residencia (GPS):</strong> {perfilLaboral.ubicacionGpsResidencia}</li>
          <li><strong>Certificado de Vida y Residencia:</strong> {perfilLaboral.certificadoVidaResidencia}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Nivel de estudios</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>¿Posee título SNPP / SINAFOCAL / otro o es Empírico?</strong> {nivelEstudios.tipo}</li>
          {nivelEstudios.fotoTituloUrl && <li><strong>Foto de título:</strong> <a href={nivelEstudios.fotoTituloUrl} className="text-yapo-blue underline">Ver</a></li>}
        </ul>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Seguro y situación laboral</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>¿Posee seguro de previsión social u otro?</strong> {seguroPrevisionSocial ? "Sí" : "No"}</li>
          <li><strong>Situación actual:</strong> {situacionLaboral === "desempleado" ? "Desempleado" : situacionLaboral === "contratado" ? "Contratado" : "Trabajador independiente"}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Respaldo de confianza (referidos)</h3>
        <p className="mt-2 text-sm text-foreground/90">Quienes te recomendaron a YAPÓ: {respaldoConfianza.length ? respaldoConfianza.join(", ") : "—"}</p>
      </section>

      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Operador YAPÓ</h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          <li><strong>Promotor YAPÓ:</strong> {promotorYapo}</li>
          <li><strong>Gestor de tu zona:</strong> {gestorZona}</li>
          <li><strong>Cédula del Operador YAPÓ (Agente de Validación):</strong> {cedulaOperadorYapo}</li>
        </ul>
      </section>

      <section className="rounded-xl border-2 border-yapo-blue/20 bg-yapo-white p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Matriz de preclasificación automática (Dashboard)</h3>
        <div className={`mt-2 rounded-lg border p-3 text-sm ${GRUPO_STYLE[grupoPreclasificacion]}`}>
          <strong>Grupo {grupoPreclasificacion}:</strong> {GRUPO_LABELS[grupoPreclasificacion]}
        </div>
      </section>
    </div>
  );
}
