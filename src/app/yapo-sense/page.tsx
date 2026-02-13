"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { YapoSenseMetrics } from "@/app/api/dashboard/yapo-sense/route";

const DEPARTAMENTOS = ["Central", "Alto Paraná", "Itapúa", "Caaguazú"] as const;
const CIUDADES: Record<string, string[]> = {
  Central: ["Asunción", "Lambaré", "Fernando de la Mora", "Luque", "San Lorenzo"],
  "Alto Paraná": ["Ciudad del Este", "Minga Guazú"],
  Itapúa: ["Encarnación"],
  Caaguazú: ["Coronel Oviedo"],
};

export default function YapoSensePage() {
  const [departamento, setDepartamento] = useState<string | null>(null);
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [data, setData] = useState<YapoSenseMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (departamento) params.set("departamento", departamento);
    if (ciudad) params.set("ciudad", ciudad);
    const url = `/api/dashboard/yapo-sense?${params.toString()}`;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'yapo-sense/page.tsx:useEffect',message:'YAPÓ-SENSE fetch start',data:{url,departamento,ciudad},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    fetch(url)
      .then((r) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'yapo-sense/page.tsx:fetchResponse',message:'YAPÓ-SENSE response',data:{ok:r.ok,status:r.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        setData(d);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'yapo-sense/page.tsx:setData',message:'YAPÓ-SENSE data set',data:{hasData:!!d,huecosLen:d?.huecosDeMercado?.length??0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [departamento, ciudad]);

  const ciudadesOpciones = departamento ? CIUDADES[departamento] ?? [] : [];

  return (
    <main className="min-h-screen bg-yapo-blue-light/30 p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-yapo-blue hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-yapo-blue">
            YAPÓ-SENSE
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            Métricas en tiempo real para Gobierno/Enterprise: desempleo, rubros buscados, certificación y huecos de mercado.
          </p>
        </header>

        {/* Filtros */}
        <section className="mb-6 rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
            Filtrar por zona
          </h2>
          <div className="flex flex-wrap gap-3">
            <div>
              <label htmlFor="depto" className="block text-xs text-foreground/70">
                Departamento
              </label>
              <select
                id="depto"
                value={departamento ?? ""}
                onChange={(e) => {
                  setDepartamento(e.target.value || null);
                  setCiudad(null);
                }}
                className="mt-1 rounded-lg border border-yapo-blue/30 bg-yapo-white px-3 py-2 text-sm text-foreground"
              >
                <option value="">Todos</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ciudad" className="block text-xs text-foreground/70">
                Ciudad
              </label>
              <select
                id="ciudad"
                value={ciudad ?? ""}
                onChange={(e) => setCiudad(e.target.value || null)}
                className="mt-1 rounded-lg border border-yapo-blue/30 bg-yapo-white px-3 py-2 text-sm text-foreground"
                disabled={!departamento}
              >
                <option value="">Todas</option>
                {ciudadesOpciones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading && (
          <p className="py-8 text-center text-sm text-foreground/60">
            Cargando métricas...
          </p>
        )}

        {!loading && data && (
          <>
            {/* KPIs */}
            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase text-foreground/60">
                  Desempleo real (app)
                </p>
                <p className="mt-1 text-2xl font-bold text-yapo-blue">
                  {data.desempleoPorcentaje}%
                </p>
              </div>
              <div className="rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase text-foreground/60">
                  Profesionales con certificación
                </p>
                <p className="mt-1 text-2xl font-bold text-yapo-emerald">
                  {data.profesionalesConCertificacion}
                </p>
              </div>
              <div className="rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase text-foreground/60">
                  Sin certificación
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {data.profesionalesSinCertificacion}
                </p>
              </div>
              <div className="rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase text-foreground/60">
                  Total profesionales (zona)
                </p>
                <p className="mt-1 text-2xl font-bold text-yapo-blue">
                  {data.totalProfesionales}
                </p>
              </div>
            </section>

            {/* Rubros más buscados */}
            <section className="mb-6 rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
                Rubros más buscados
              </h2>
              <ul className="space-y-2">
                {data.rubrosMasBuscados.slice(0, 7).map((r) => (
                  <li
                    key={r.rubro}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-medium text-foreground">{r.rubro}</span>
                    <span className="text-foreground/70">{r.pedidos} pedidos</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Gráfico Huecos de Mercado */}
            <section className="rounded-xl border border-yapo-blue/20 bg-yapo-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
                Huecos de mercado
              </h2>
              <p className="mb-4 text-xs text-foreground/70">
                Barrios/rubros donde no hay suficientes profesionales para la cantidad de pedidos.
              </p>
              <div className="space-y-3">
                {data.huecosDeMercado.map((h) => (
                  <div
                    key={`${h.barrio}-${h.ciudad}-${h.rubro}`}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border-l-4 py-2 px-3 ${
                      h.nivel === "alto"
                        ? "border-yapo-red bg-yapo-red-light/30"
                        : h.nivel === "medio"
                          ? "border-yapo-amber bg-yapo-amber-light/30"
                          : "border-yapo-emerald bg-yapo-emerald-light/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {h.barrio}, {h.ciudad} · {h.rubro}
                      </p>
                      <p className="text-xs text-foreground/70">
                        Demanda: {h.demandaActiva} · Profesionales: {h.profesionales} · Déficit: {h.deficit}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        h.nivel === "alto"
                          ? "bg-yapo-red text-yapo-white"
                          : h.nivel === "medio"
                            ? "bg-yapo-amber text-yapo-white"
                            : "bg-yapo-emerald text-yapo-white"
                      }`}
                    >
                      {h.nivel}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
