"use client";

/**
 * Pantalla "Aceptar Trabajo": el cliente revisa la propuesta, acepta términos
 * y confirma. Se genera el Contrato Flash y se muestra; link a descarga PDF cuando exista.
 * Ver docs/product/CONTRATO-FLASH-Y-MODULO-CONTRATACION.md
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TRANSACCION_LEGAL } from "@/lib/compliance/transaccion-legal-texts";
import type { Acuerdo } from "@/features/contrato";

const MONEDA = "PYG";

interface MeData {
  user: { id: string; name: string | null };
}

interface PublicProfileData {
  name: string;
  userId: string;
}

const DEFAULT_PROPUESTA = {
  descripcion: "Reparación de aire acondicionado split 12.000 BTU, incluye mano de obra y diagnóstico",
  montoTotal: 350000,
  garantiaDias: 30,
  penalidadDescripcion: "50.000 PYG",
};

function AceptarTrabajoContent() {
  const { identity } = useSession();
  const searchParams = useSearchParams();
  const [me, setMe] = useState<MeData | null>(null);
  const [profesional, setProfesional] = useState<PublicProfileData | null>(null);
  const [descripcion, setDescripcion] = useState(DEFAULT_PROPUESTA.descripcion);
  const [montoTotal, setMontoTotal] = useState(DEFAULT_PROPUESTA.montoTotal);
  const [garantiaDias, setGarantiaDias] = useState(DEFAULT_PROPUESTA.garantiaDias);
  const [penalidadDescripcion, setPenalidadDescripcion] = useState(DEFAULT_PROPUESTA.penalidadDescripcion);
  const [nombreProfesional, setNombreProfesional] = useState("");
  const [ciProfesional, setCiProfesional] = useState("");
  const [ciCliente, setCiCliente] = useState("");
  const [aceptado, setAceptado] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contratoTitulo, setContratoTitulo] = useState("");
  const [contratoTexto, setContratoTexto] = useState("");
  const [acuerdo, setAcuerdo] = useState<Acuerdo | null>(null);
  const [contratoPdfUrl, setContratoPdfUrl] = useState<string | null>(null);

  const clienteId = identity?.userId ?? null;
  const profesionalId = searchParams.get("profesionalId") || "prof-1";

  const loadMe = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:loadMe',message:'loadMe entry',data:{clienteId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const r = await fetch("/api/auth/me");
      if (r.ok) {
        const data = await r.json();
        const name = data.user?.name ?? null;
        setMe({ user: { id: data.user?.id ?? "", name } });
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:loadMe',message:'me loaded',data:{hasName:!!name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    } catch {
      setMe(null);
    }
  }, []);

  const loadProfesional = useCallback(async (id: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:loadProfesional',message:'loadProfesional entry',data:{profesionalId:id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const r = await fetch(`/api/profile/public/${encodeURIComponent(id)}`);
      if (r.ok) {
        const data = await r.json();
        const name = data.name ?? "Profesional";
        setProfesional({ userId: data.userId ?? id, name });
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:loadProfesional',message:'profesional loaded',data:{name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } else {
        setProfesional({ userId: id, name: "Profesional" });
      }
    } catch {
      setProfesional({ userId: id, name: "Profesional" });
    }
  }, []);

  useEffect(() => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadMe().finally(() => setLoading(false));
  }, [clienteId, loadMe]);

  useEffect(() => {
    if (!profesionalId) return;
    loadProfesional(profesionalId);
  }, [profesionalId, loadProfesional]);

  useEffect(() => {
    if (profesional?.name && !searchParams.get("nombreProfesional")) {
      setNombreProfesional((prev) => prev || profesional.name);
    }
  }, [profesional?.name, searchParams]);

  useEffect(() => {
    const d = searchParams.get("descripcion");
    const m = searchParams.get("montoTotal");
    const g = searchParams.get("garantiaDias");
    const p = searchParams.get("penalidadDescripcion");
    const n = searchParams.get("nombreProfesional");
    const ci = searchParams.get("ciProfesional");
    if (d != null) setDescripcion(d);
    if (m != null) setMontoTotal(Number(m) || DEFAULT_PROPUESTA.montoTotal);
    if (g != null) setGarantiaDias(Number(g) || DEFAULT_PROPUESTA.garantiaDias);
    if (p != null) setPenalidadDescripcion(p);
    if (n != null) setNombreProfesional(n);
    if (ci != null) setCiProfesional(ci);
  }, [searchParams]);

  const nombreCliente = me?.user?.name ?? "Cliente";

  const handleAceptar = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:handleAceptar',message:'click Aceptar Trabajo',data:{checkbox,hasClienteId:!!clienteId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!clienteId || !checkbox) {
      setError(checkbox ? "Faltan datos del cliente." : "Debés aceptar el contrato digital y las condiciones.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contrato/aceptar-propuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          profesionalId,
          descripcion,
          montoTotal,
          moneda: MONEDA,
          garantiaDias,
          penalidadDescripcion,
          nombreProfesional: nombreProfesional || profesional?.name || "Profesional",
          ciProfesional: ciProfesional || "—",
          nombreCliente,
          ciCliente: ciCliente || "—",
          conEscudoPago: true,
        }),
      });
      const data = await res.json();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:handleAceptar',message:'api response',data:{ok:res.ok,status:res.status,hasContratoTexto:!!(data.contratoTexto),contratoTextoLen:(data.contratoTexto||'').length,acuerdoId:data.acuerdo?.id,error:data.error},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
      // #endregion
      if (!res.ok) {
        setError(data.error ?? "No se pudo generar el contrato.");
        return;
      }
      setContratoTitulo(data.contratoTitulo ?? "");
      setContratoTexto(data.contratoTexto ?? "");
      setAcuerdo(data.acuerdo ?? null);
      setContratoPdfUrl(data.acuerdo?.contratoPdfUrl ?? null);
      setAceptado(true);
    } catch (e) {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yapo-white p-4 flex items-center justify-center">
        <p className="text-foreground/70">Cargando...</p>
      </div>
    );
  }

  if (!clienteId) {
    return (
      <div className="min-h-screen bg-yapo-white p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/80">Tenés que iniciar sesión para aceptar un trabajo.</p>
        <Link href="/login" className="text-yapo-blue font-medium underline">Ir a iniciar sesión</Link>
      </div>
    );
  }

  if (aceptado) {
    // #region agent log
    if (typeof window !== 'undefined') fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trabajo/aceptar:successView',message:'showing contract',data:{contratoTitulo:!!contratoTitulo,contratoTextoLen:contratoTexto.length,contratoPdfUrl,acuerdoId:acuerdo?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D,E'})}).catch(()=>{});
    // #endregion
    return (
      <div className="min-h-screen bg-yapo-white p-4 pb-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-yapo-blue">Contrato generado</h1>
          <p className="text-sm text-foreground/70 mt-1">
            Ambas partes dan por firmado este contrato con validez legal según la Ley de Firma Digital vigente en Paraguay.
          </p>
        </div>
        <div className="rounded-xl border border-yapo-blue-soft bg-yapo-blue-soft/20 p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-2">{contratoTitulo}</h2>
          <div className="text-sm text-foreground whitespace-pre-wrap font-sans">{contratoTexto}</div>
        </div>
        <div className="flex flex-col gap-3">
          {contratoPdfUrl && (
            <a
              href={contratoPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-yapo-blue text-yapo-white py-3 px-4 font-medium"
            >
              Descargar PDF
            </a>
          )}
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center rounded-lg border border-yapo-blue text-yapo-blue py-3 px-4 font-medium"
          >
            Ver en Billetera
          </Link>
          {acuerdo && (
            <p className="text-xs text-foreground/60">
              Acuerdo: {acuerdo.id}
              {acuerdo.escrowOrderId ? ` · Escudo YAPÓ activo` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yapo-white p-4 pb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-yapo-blue">Aceptar Trabajo</h1>
        <p className="text-sm text-foreground/70 mt-1">
          Revisá la propuesta y las condiciones. Al aceptar, se generará el contrato digital y el monto quedará en custodia (Escudo YAPÓ).
        </p>
      </div>

      <section className="rounded-xl border border-yapo-blue-soft/60 bg-yapo-blue-soft/10 p-4 mb-6" aria-label="Resumen de la propuesta">
        <h2 className="font-semibold text-foreground mb-3">Resumen de la propuesta</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-foreground/70">Profesional</dt>
            <dd className="font-medium">{nombreProfesional || profesional?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-foreground/70">Descripción del trabajo</dt>
            <dd>{descripcion}</dd>
          </div>
          <div>
            <dt className="text-foreground/70">Monto</dt>
            <dd className="font-medium">Gs. {montoTotal.toLocaleString("es-PY")}</dd>
          </div>
          <div>
            <dt className="text-foreground/70">Garantía</dt>
            <dd>{garantiaDias} días sobre la mano de obra</dd>
          </div>
          <div>
            <dt className="text-foreground/70">Penalidad (incumplimiento / abandono)</dt>
            <dd>{penalidadDescripcion}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6" aria-label="Condiciones de aceptación">
        <h2 className="font-semibold text-foreground mb-2">{TRANSACCION_LEGAL.tituloAceptarTrabajo}</h2>
        <ul className="space-y-2 text-sm text-foreground/90 mb-4">
          {TRANSACCION_LEGAL.aceptarTrabajo.map((text, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-yapo-blue shrink-0" aria-hidden>•</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={checkbox}
            onChange={(e) => setCheckbox(e.target.checked)}
            className="mt-1 rounded border-yapo-blue text-yapo-blue"
            aria-describedby="checkbox-desc"
          />
          <span id="checkbox-desc" className="text-sm">{TRANSACCION_LEGAL.checkboxAceptarTrabajo}</span>
        </label>
      </section>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm p-3" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAceptar}
          disabled={submitting || !checkbox}
          className="rounded-lg bg-yapo-blue text-yapo-white py-3 px-4 font-medium disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Generando contrato..." : "Aceptar Trabajo"}
        </button>
        <Link href="/mapa" className="text-center text-sm text-yapo-blue underline">
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}

export default function AceptarTrabajoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-yapo-white p-4 flex items-center justify-center"><p className="text-foreground/70">Cargando...</p></div>}>
      <AceptarTrabajoContent />
    </Suspense>
  );
}
