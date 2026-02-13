/**
 * Contenido base del Contrato Flash de YAPÓ.
 * Se genera automáticamente en PDF cuando el cliente presiona "Aceptar Trabajo".
 * Placeholders: [Nombre del Profesional], [Nombre del Cliente], [Descripción], [Monto], [X] días, [Monto/Puntos].
 * Ver docs/product/CONTRATO-FLASH-Y-MODULO-CONTRATACION.md
 */

export const CONTRATO_FLASH_TITULO = "ACUERDO DE EJECUCIÓN LABORAL - YAPÓ";

/** Plantilla con placeholders para rellenar al generar el PDF. */
export const CONTRATO_FLASH_CUERPO = `1. LAS PARTES: [Nombre del Profesional] (C.I. verificado) y [Nombre del Cliente] (C.I. verificado).

2. EL TRABAJO: [Descripción del servicio, ej: Reparación de AA].

3. EL MONTO: Gs. [Monto acordado]. Este monto es final e inmutable una vez aceptado.

4. EL ESCUDO YAPÓ: El pago se encuentra en custodia de la plataforma. Se liberará al confirmar la finalización mediante código QR o validación mutua en la App.

5. GARANTÍA: El profesional otorga una garantía de cumplimiento de [X] días sobre la mano de obra.

6. PENALIDAD: El incumplimiento de horario o abandono de obra genera una penalidad de [Monto/Puntos] en el sistema de reputación Mbareté.

Al aceptar en la App, ambas partes dan por firmado este contrato con validez legal según la Ley de Firma Digital vigente en Paraguay.`;

export const CONTRATO_FLASH_PIE =
  "Al aceptar en la App, ambas partes dan por firmado este contrato con validez legal según la Ley de Firma Digital vigente en Paraguay.";

/** Variables que el sistema debe reemplazar al generar el contrato (trigger: Aceptar Propuesta). */
export type ContratoFlashVariables = {
  nombreProfesional: string;
  ciProfesional: string;
  nombreCliente: string;
  ciCliente: string;
  descripcionTrabajo: string;
  montoAcordado: number;
  moneda: string;
  garantiaDias: number;
  penalidadDescripcion: string; // ej. "50.000 PYG" o "puntos Mbareté"
};

/** Genera el texto del contrato reemplazando placeholders. */
export function renderContratoFlash(v: ContratoFlashVariables): string {
  const montoStr = v.montoAcordado.toLocaleString("es-PY", { maximumFractionDigits: 0 });
  return CONTRATO_FLASH_CUERPO.replace("[Nombre del Profesional]", v.nombreProfesional)
    .replace("[Nombre del Cliente]", v.nombreCliente)
    .replace("[Descripción del servicio, ej: Reparación de AA]", v.descripcionTrabajo)
    .replace("[Monto acordado]", montoStr)
    .replace("[X]", String(v.garantiaDias))
    .replace("[Monto/Puntos]", v.penalidadDescripcion);
}
