/**
 * Escudo de Pago Intermediado — dinero en custodia, liberación por hitos.
 * Ver docs/product/MODULOS-GARANTIA-REPUTACION-Y-PAGO.md §2.
 */

export const ESCROW_ORDER_STATES = [
  "creado",
  "en_custodia",
  "iniciado",
  "finalizado",
  "disputa",
  "cancelado",
] as const;
export type EscrowOrderState = (typeof ESCROW_ORDER_STATES)[number];

/** Tipo de hito: inicio (QR/check-in), materiales (factura), finalización (24h post-servicio). */
export type EscrowHitoTipo = "inicio" | "materiales" | "finalizacion";

export interface EscrowHito {
  porcentaje: number;
  liberadoAt?: string;
  destinatario: "profesional" | "cliente";
  /** Tipo de hito; si es "materiales", se libera al verificar factura. */
  tipo?: EscrowHitoTipo;
  /** Para tipo materiales: URL de la factura subida; verificación por mediador o OCR. */
  evidenciaFacturaUrl?: string;
  evidenciaVerificadaAt?: string;
}

export interface EscrowOrder {
  id: string;
  clienteId: string;
  profesionalId: string;
  montoTotal: number;
  moneda: string;
  estado: EscrowOrderState;
  hitos: EscrowHito[];
  walletHoldId?: string;
  createdAt: string;
  updatedAt: string;
  finalizadoAt?: string;
}

/** Hitos por defecto: 50% al iniciar (QR), 50% al finalizar (tras 24h retención). */
export const DEFAULT_HITOS: EscrowHito[] = [
  { porcentaje: 50, destinatario: "profesional", tipo: "inicio" },
  { porcentaje: 50, destinatario: "profesional", tipo: "finalizacion" },
];

/** Retención de seguridad post-servicio: 24 h antes de liberar el último hito (ms). */
export const RETENCION_SEGURIDAD_POST_SERVICIO_MS = 24 * 60 * 60 * 1000;
