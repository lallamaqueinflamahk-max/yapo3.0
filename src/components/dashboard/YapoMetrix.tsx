"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

/**
 * YAPÓ-METRIX — Panel de métricas para Pymes y Enterprise.
 * Censo en tiempo real, mapa de calor de necesidad, segmentación de intereses.
 */
interface CensoItem {
  rubro: string;
  barrio: string;
  activos: number;
  label?: string;
}

interface HeatItem {
  barrio: string;
  demanda: string;
  oferta: number;
  brecha: string;
}

interface SegmentacionItem {
  barrio: string;
  interes: string;
  porcentaje: number;
  periodo: string;
}

export default function YapoMetrix() {
  const [censo, setCenso] = useState<CensoItem[]>([]);
  const [heat, setHeat] = useState<HeatItem[]>([]);
  const [segmentacion, setSegmentacion] = useState<SegmentacionItem[]>([]);
  const [rubroDemo, setRubroDemo] = useState("Plomeros");
  const [barrioDemo, setBarrioDemo] = useState("Barrio Sajonia");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setCenso([
        { rubro: "Plomeros", barrio: "Sajonia", activos: 45, label: "activos" },
        { rubro: "Electricistas", barrio: "Sajonia", activos: 28 },
        { rubro: "Limpieza", barrio: "Sajonia", activos: 12 },
      ]);
      setHeat([
        { barrio: "Cañada", demanda: "Limpieza", oferta: 0, brecha: "Alta demanda, sin oferta — oportunidad" },
        { barrio: "Sajonia", demanda: "Refrigeración", oferta: 3, brecha: "Demanda media" },
      ]);
      setSegmentacion([
        { barrio: "Cañada", interes: "Seguro Médico", porcentaje: 40, periodo: "esta semana" },
        { barrio: "Sajonia", interes: "Reparación heladeras", porcentaje: 25, periodo: "esta semana" },
      ]);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="rounded-2xl border-2 border-yapo-blue/25 bg-yapo-white p-4 shadow-md"
      aria-label="YAPÓ-METRIX"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-yapo-blue">YAPÓ-METRIX</h2>
        <span className="rounded-full bg-yapo-blue/15 px-2.5 py-1 text-xs font-semibold text-yapo-blue">
          PyME / Enterprise
        </span>
      </div>
      <p className="mb-4 text-sm text-foreground/80">
        Métricas distintivas: censo en tiempo real, mapa de calor de necesidad y segmentación de intereses (estilo Facebook Ads).
      </p>

      {loading ? (
        <p className="text-sm text-foreground/60">Cargando métricas…</p>
      ) : (
        <div className="space-y-5">
          {/* Censo en tiempo real */}
          <div className="rounded-xl border border-yapo-blue/15 bg-yapo-blue-light/10 p-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/90">
              Censo en tiempo real
            </h3>
            <p className="mt-1 text-xs text-foreground/70">
              Cuántos <strong>[{rubroDemo}]</strong> están activos en <strong>[{barrioDemo}]</strong>.
            </p>
            <ul className="mt-2 space-y-1.5">
              {censo.map((c, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-foreground/90">{c.rubro} · {c.barrio}</span>
                  <span className="font-semibold text-yapo-blue">{c.activos} activos</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mapa de calor de necesidad */}
          <div className="rounded-xl border border-yapo-amber/20 bg-yapo-amber/5 p-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-amber-dark/90">
              Mapa de calor de necesidad
            </h3>
            <p className="mt-1 text-xs text-foreground/70">
              ¿Dónde hay más gente buscando trabajo de X pero no hay oferta? (Oportunidad de negocio.)
            </p>
            <ul className="mt-2 space-y-2">
              {heat.map((h, i) => (
                <li key={i} className="rounded-lg border border-yapo-amber/20 bg-yapo-white px-2.5 py-2 text-sm">
                  <span className="font-medium text-yapo-blue">{h.barrio}</span>
                  <span className="text-foreground/80"> · demanda </span>
                  <span className="font-medium">{h.demanda}</span>
                  <span className="text-foreground/80">, oferta </span>
                  <span className="font-medium">{h.oferta}</span>
                  <p className="mt-1 text-xs text-yapo-amber-dark">{h.brecha}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Segmentación de intereses */}
          <div className="rounded-xl border border-yapo-emerald/20 bg-yapo-emerald/5 p-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yapo-emerald-dark/90">
              Segmentación de intereses
            </h3>
            <p className="mt-1 text-xs text-foreground/70">
              Similar a Facebook Ads: qué % de usuarios en un barrio buscó X esta semana.
            </p>
            <ul className="mt-2 space-y-1.5">
              {segmentacion.map((s, i) => (
                <li key={i} className="text-sm">
                  En <strong>{s.barrio}</strong>, el <strong>{s.porcentaje}%</strong> buscó «{s.interes}» {s.periodo}.
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-foreground/60">
            Recomendación Enterprise: cruce rubro_demanda vs barrio_oferta. Ej: «Existen 45 albañiles, 0 Mbaretés líderes. Brecha: falta de coordinación. Iniciar programa de fidelización en la zona».
          </p>
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/mapa"
          className="inline-flex min-h-[40px] items-center justify-center rounded-xl border-2 border-yapo-blue/25 bg-yapo-blue-light/30 px-4 py-2 text-sm font-semibold text-yapo-blue"
        >
          Ir al mapa y búsqueda
        </Link>
      </div>
    </section>
  );
}
