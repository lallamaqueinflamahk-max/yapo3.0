/**
 * Flujo Garantía YAPÓ (Smart-Contract / Escrow).
 * 1. Cliente acepta presupuesto → se genera contrato y orden en custodia.
 * 2. YAPÓ genera QR de pago de seña (50%).
 * 3. Fondos quedan en Escrow (cuenta retenida).
 * 4. Profesional sube "Prueba de Trabajo" (foto/video) al finalizar.
 * 5. Cliente libera el pago (o no hay acuerdo → ticket de mediación Mbareté).
 */

export type EtapaEscrow =
  | "pendiente_sena"      // QR generado, esperando pago 50%
  | "sena_pagada"         // 50% en custodia
  | "trabajo_en_curso"
  | "prueba_subida"       // Profesional subió foto/video
  | "liberado"            // Cliente liberó; pago al profesional
  | "disputa";            // Sin acuerdo → mediación Mbareté

export interface PruebaTrabajo {
  tipo: "foto" | "video";
  url: string;
  subidoAt: string;
  subidoPor: string;
}

export interface TicketMediacion {
  id: string;
  escrowOrderId: string;
  motivo: string;
  mbareteLiderId: string | null;
  zona: string;
  estado: "abierto" | "en_curso" | "resuelto";
  createdAt: string;
}
