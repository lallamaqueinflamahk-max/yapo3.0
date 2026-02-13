/**
 * Garantía de Asistencia — estados de cita/orden y penalización por no-show.
 * Ver docs/product/MODULOS-GARANTIA-REPUTACION-Y-PAGO.md §1.
 */

export const CITA_ESTADOS = [
  "programada",
  "confirmada",
  "iniciada",
  "completada",
  "no_show_profesional",
  "no_show_cliente",
  "cancelada",
] as const;
export type CitaEstado = (typeof CITA_ESTADOS)[number];

/** Penalización en componente Cumplimiento del Mbarete Score por no-show. */
export const NO_SHOW_PENALTY = {
  primera: 0,
  segunda: 0.05,
  terceraYPosterior: 0.1,
} as const;

/** Compromiso de Hierro: cancelación con menos de esta antelación (ms) debita Token de Irresponsabilidad. */
export const CANCELACION_TARDE_UMBRAL_MS = 2 * 60 * 60 * 1000; // 2 horas

/** Índice Cumplidor: por debajo de este % (0-1) se ocultan anuncios durante CUMPLIDOR_PENALIDAD_48H_MS. */
export const CUMPLIDOR_UMBRAL_MINIMO = 0.8;

/** Duración del ocultamiento de anuncios cuando Cumplidor < umbral (ms). */
export const CUMPLIDOR_PENALIDAD_48H_MS = 48 * 60 * 60 * 1000; // 48 horas
