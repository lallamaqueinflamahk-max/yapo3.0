/**
 * Contrato digital rápido — acuerdo generado al aceptar un presupuesto.
 * Ver docs/product/VERIFICACION-MODULOS-Y-CONTRATO.md.
 */

export interface AcuerdoParte {
  userId: string;
  name: string;
  role: "cliente" | "profesional";
  profession?: string;
  contact?: string;
}

export interface Acuerdo {
  id: string;
  clienteId: string;
  profesionalId: string;
  descripcion: string;
  montoTotal: number;
  moneda: string;
  fechaHoraAcordada?: string;
  direccion?: string;
  /** Garantía de cumplimiento en días (mano de obra). */
  garantiaDias?: number;
  /** Descripción de la penalidad (monto PYG o "puntos Mbareté"). */
  penalidadDescripcion?: string;
  /** Si el pago es con Escudo (custodia por hitos). */
  conEscudoPago: boolean;
  estado: "borrador" | "aceptado" | "en_curso" | "completado" | "cancelado" | "disputa";
  createdAt: string;
  updatedAt: string;
  /** Referencia a orden en custodia si conEscudoPago. */
  escrowOrderId?: string;
  /** URL o id del PDF del Contrato Flash generado. */
  contratoPdfUrl?: string;
}
