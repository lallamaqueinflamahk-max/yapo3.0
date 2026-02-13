/**
 * GET /api/contrato/pdf/[id]
 * Cuando exista generación de PDF, aquí se servirá el archivo.
 * Por ahora devuelve un mensaje en texto plano.
 */
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id?.trim();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/contrato/pdf/[id]:GET',message:'pdf requested',data:{id:id||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  if (!id) {
    return NextResponse.json({ error: "Falta id de acuerdo" }, { status: 400 });
  }

  // TODO: recuperar contrato de DB, generar PDF (ej. con jsPDF o servicio externo), devolver application/pdf
  const message = `Contrato YAPÓ — Acuerdo ${id}\n\nEl PDF estará disponible próximamente. Tu contrato se generó correctamente al aceptar la propuesta y tiene validez legal según la Ley de Firma Digital vigente en Paraguay.\n\nPodés ver el detalle en la Billetera.`;
  return new NextResponse(message, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `inline; filename="contrato-${id}.txt"`,
    },
  });
}
