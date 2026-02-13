/**
 * POST /api/contrato/aceptar-propuesta
 *
 * Trigger de Contrato Flash: al "Aceptar Propuesta" el cliente dispara la generación
 * del contrato digital y, si aplica, la creación de la orden en custodia (Escudo YAPÓ).
 *
 * Flujo: Usuario → Contrato → Garantía (Escudo) → Liberación de Pago.
 * Ver docs/product/CONTRATO-FLASH-Y-MODULO-CONTRATACION.md
 */
import { NextResponse } from "next/server";
import { validateWalletAccess } from "@/lib/wallet-db/guard";
import { renderContratoFlash, CONTRATO_FLASH_TITULO } from "@/lib/compliance/contrato-flash-template";
import type { ContratoFlashVariables } from "@/lib/compliance/contrato-flash-template";
import type { Acuerdo } from "@/features/contrato";
import {
  DEFAULT_HITOS,
  RETENCION_SEGURIDAD_POST_SERVICIO_MS,
  type EscrowOrder,
  type EscrowOrderState,
} from "@/features/escudo-pago";

const MONEDA_DEFAULT = "PYG";

/** Body esperado: datos de la propuesta y de las partes (perfil + propuesta). */
export type AceptarPropuestaBody = {
  /** ID del cliente (debe coincidir con el usuario autenticado). */
  clienteId: string;
  /** ID del profesional. */
  profesionalId: string;
  /** Descripción técnica del trabajo (inmutable tras aceptar). */
  descripcion: string;
  /** Monto acordado en PYG. */
  montoTotal: number;
  moneda?: string;
  /** Garantía de mano de obra en días. */
  garantiaDias: number;
  /** Ej: "50.000 PYG" o "puntos Mbareté". */
  penalidadDescripcion: string;
  /** Nombre del profesional (C.I. verificada). */
  nombreProfesional: string;
  /** C.I. del profesional. */
  ciProfesional: string;
  /** Nombre del cliente. */
  nombreCliente: string;
  /** C.I. del cliente. */
  ciCliente: string;
  /** Dirección/lugar del trabajo (opcional). */
  direccion?: string;
  /** Fecha/hora acordada ISO (opcional). */
  fechaHoraAcordada?: string;
  /** Si true, se crea orden en custodia (Escudo YAPÓ) y se vincula al acuerdo. */
  conEscudoPago?: boolean;
};

function generateOrderId(): string {
  const n = Math.floor(Math.random() * 9999) + 1;
  return `YAPO-ORD-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  const access = await validateWalletAccess();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/contrato/aceptar-propuesta:POST',message:'entry',data:{allowed:access.allowed,userId:access.userId?.slice(0,8)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!access.allowed || !access.userId) {
    return NextResponse.json(
      { error: access.reason ?? "Acceso denegado" },
      { status: 403 }
    );
  }

  let body: AceptarPropuestaBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  if (body.clienteId !== access.userId) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/contrato/aceptar-propuesta:POST',message:'clienteId mismatch',data:{bodyClienteId:body.clienteId?.slice(0,8),accessUserId:access.userId?.slice(0,8)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: "Solo el cliente puede aceptar la propuesta" },
      { status: 403 }
    );
  }

  const {
    clienteId,
    profesionalId,
    descripcion,
    montoTotal,
    moneda = MONEDA_DEFAULT,
    garantiaDias,
    penalidadDescripcion,
    nombreProfesional,
    ciProfesional,
    nombreCliente,
    ciCliente,
    direccion,
    fechaHoraAcordada,
    conEscudoPago = true,
  } = body;

  if (
    !clienteId ||
    !profesionalId ||
    !descripcion ||
    montoTotal == null ||
    montoTotal < 0 ||
    !nombreProfesional ||
    !nombreCliente ||
    garantiaDias == null ||
    garantiaDias < 0
  ) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: clienteId, profesionalId, descripcion, montoTotal, nombreProfesional, nombreCliente, garantiaDias" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const acuerdoId = generateOrderId();

  const variables: ContratoFlashVariables = {
    nombreProfesional,
    ciProfesional: ciProfesional ?? "",
    nombreCliente,
    ciCliente: ciCliente ?? "",
    descripcionTrabajo: descripcion,
    montoAcordado: montoTotal,
    moneda,
    garantiaDias,
    penalidadDescripcion: penalidadDescripcion ?? "puntos Mbareté",
  };

  const contratoTexto = renderContratoFlash(variables);

  let escrowOrderId: string | undefined;
  let escrowOrder: EscrowOrder | undefined;

  if (conEscudoPago) {
    escrowOrderId = `esc-${acuerdoId}`;
    escrowOrder = {
      id: escrowOrderId,
      clienteId,
      profesionalId,
      montoTotal,
      moneda,
      estado: "en_custodia" as EscrowOrderState,
      hitos: [...DEFAULT_HITOS],
      createdAt: now,
      updatedAt: now,
    };
    // En producción: persistir EscrowOrder, debitar cliente (wallet hold), vincular walletHoldId.
  }

  const acuerdo: Acuerdo = {
    id: acuerdoId,
    clienteId,
    profesionalId,
    descripcion,
    montoTotal,
    moneda,
    fechaHoraAcordada,
    direccion,
    garantiaDias,
    penalidadDescripcion: penalidadDescripcion ?? "puntos Mbareté",
    conEscudoPago: !!conEscudoPago,
    estado: "aceptado",
    createdAt: now,
    updatedAt: now,
    escrowOrderId,
    contratoPdfUrl: `/api/contrato/pdf/${acuerdoId}`,
  };

  // En producción: persistir Acuerdo en DB; generar PDF y subir a storage; persistir EscrowOrder; debitar billetera.
  // Retención 24h: RETENCION_SEGURIDAD_POST_SERVICIO_MS se aplica al liberar el último hito tras "Trabajo finalizado".

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/contrato/aceptar-propuesta:POST',message:'success',data:{acuerdoId:acuerdo.id,contratoTextoLen:contratoTexto.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
  // #endregion
  return NextResponse.json({
    acuerdo,
    contratoTitulo: CONTRATO_FLASH_TITULO,
    contratoTexto,
    escrowOrderId,
    escrowOrder,
    retencionPostServicioMs: RETENCION_SEGURIDAD_POST_SERVICIO_MS,
  });
}
