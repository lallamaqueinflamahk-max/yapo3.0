/**
 * Reputación "Cultura Paraguaya" — Mbarete Score.
 * Ver docs/product/MODULOS-GARANTIA-REPUTACION-Y-PAGO.md §3.
 *
 * Dimensiones: Velocidad, Certificación, Cumplimiento.
 * El score afecta la visibilidad en el feed de búsqueda de profesionales.
 */

export const MBARETE_DIMENSIONS = ["velocidad", "certificacion", "cumplimiento"] as const;
export type MbareteDimension = (typeof MBARETE_DIMENSIONS)[number];

/** Pesos por dimensión (suma 1). */
export const MBARETE_WEIGHTS: Record<MbareteDimension, number> = {
  velocidad: 0.25,
  certificacion: 0.35,
  cumplimiento: 0.4,
};

export interface MbareteScore {
  userId: string;
  velocidad: number;
  certificacion: number;
  cumplimiento: number;
  scoreGlobal: number;
  updatedAt: string;
}

/** Umbrales para badges de visibilidad. */
export const MBARETE_BADGE_THRESHOLDS = {
  mbarete: 0.8,
  enCrecimiento: 0.5,
} as const;
