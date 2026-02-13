/**
 * Filtro Mbareté — Profesional Matriculado (ANDE, MOPC, etc.).
 * Ver docs/product/NUCLEO-OPERATIVO-ECOSISTEMA-EJECUCION.md §4.
 */

export const MATRICULA_ENTIDADES = ["ANDE", "MOPC"] as const;
export type MatriculaEntidad = (typeof MATRICULA_ENTIDADES)[number];

export interface MatriculaVerificada {
  userId: string;
  entidad: MatriculaEntidad;
  numeroMatricula: string;
  vigenciaHasta: string; // ISO date
  verificadoAt: string; // ISO datetime
}
