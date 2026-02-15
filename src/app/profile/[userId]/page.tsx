"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import PerfilCompletoBlock from "@/components/profile/PerfilCompletoBlock";
import { buildWhatsAppUrl, DEFAULT_YAPO_WHATSAPP_MESSAGE } from "@/lib/whatsapp-url";
import type { PerfilCompletoYapo } from "@/types/perfil-completo-yapo";

interface PublicProfile {
  userId: string;
  name: string;
  image?: string | null;
  role: string;
  whatsapp?: string | null;
  profile: {
    country?: string | null;
    territory?: string | null;
    workStatus?: string | null;
    workType?: string | null;
    education?: string | null;
    certifications?: string | null;
  } | null;
  profileStatus?: string | null;
  isEmpresa?: boolean;
  buscan?: string[];
  rating?: number | null;
  verified?: boolean;
  documentVerified?: boolean;
  badges?: string[];
  videoCount?: number;
  workHistory?: string;
  videos?: { id: string; title: string }[];
  perfilCompleto?: PerfilCompletoYapo | null;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-yapo-amber-dark text-lg" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: full }, (_, i) => <span key={`f-${i}`} aria-hidden>★</span>)}
      {half ? <span aria-hidden>★</span> : null}
      {Array.from({ length: empty }, (_, i) => <span key={`e-${i}`} className="text-yapo-amber-dark/40" aria-hidden>★</span>)}
    </span>
  );
}

const ROLE_LABELS: Record<string, string> = {
  vale: "Valé",
  capeto: "Capeto",
  kavaju: "Kavaju",
  mbarete: "Mbareté",
  cliente: "Cliente",
  pyme: "PyME",
  enterprise: "Enterprise",
};

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      const id = p.userId;
      setUserId(id);
      if (!id) {
        setLoading(false);
        return;
      }
      fetch(`/api/profile/public/${encodeURIComponent(id)}`)
        .then((r) => {
          if (!r.ok) throw new Error("No se pudo cargar el perfil");
          return r.json();
        })
        .then((d) => {
          if (!cancelled) setData(d);
        })
        .catch((e) => {
          if (!cancelled) setError(e?.message ?? "Error al cargar");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => { cancelled = true; };
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-yapo-blue-light/30 p-4">
        <p className="text-foreground/70">Cargando perfil...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 p-4 pb-24 pt-6">
        <p className="rounded-xl border border-yapo-amber/30 bg-yapo-amber/10 p-4 text-yapo-amber-dark">
          {error ?? "Perfil no encontrado."}
        </p>
        <Link href="/mapa" className="mt-4 text-yapo-blue underline">Volver al mapa</Link>
      </main>
    );
  }

  const roleLabel = ROLE_LABELS[data.role] ?? data.role;

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/mapa" className="text-yapo-blue underline">← Volver al mapa</Link>
      </div>
      <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar src={data.image} name={data.name} size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-yapo-blue">{data.name}</h1>
            <p className="mt-1 text-sm font-medium text-yapo-blue/80">{roleLabel}</p>
            {data.profile?.workType && (
              <p className="mt-1 text-sm text-foreground/80">Rubro: {data.profile.workType}</p>
            )}
            {data.profile?.territory && (
              <p className="text-xs text-foreground/70">Zona: {data.profile.territory}</p>
            )}
            {/* Rating y verificación (profesionales) */}
            {!data.isEmpresa && data.rating != null && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Stars rating={data.rating} />
                <span className="text-sm text-foreground/70">{data.rating} / 5</span>
                {data.verified && <span className="rounded-full bg-yapo-emerald/20 px-2 py-0.5 text-xs font-medium text-yapo-emerald-dark">✓ Verificado</span>}
                {data.documentVerified && <span className="rounded-full bg-yapo-blue/15 px-2 py-0.5 text-xs text-yapo-blue">🪪 Documento verificado</span>}
              </div>
            )}
            {!data.isEmpresa && data.badges && data.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.badges.map((b) => (
                  <span key={b} className="rounded-full bg-yapo-amber/20 px-2.5 py-1 text-xs font-medium text-yapo-amber-dark">{b}</span>
                ))}
              </div>
            )}
            {!data.isEmpresa && data.workHistory && (
              <p className="mt-2 text-sm text-foreground/80"><strong>Historial:</strong> {data.workHistory}</p>
            )}
          </div>
        </div>
        {data.profile && (
          <div className="mt-6 border-t border-yapo-blue/10 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Datos públicos</h2>
            <ul className="mt-2 space-y-1 text-sm text-foreground/90">
              {data.profile.workStatus && <li><strong>Estado:</strong> {data.profile.workStatus}</li>}
              {data.profile.education && <li><strong>Educación:</strong> {data.profile.education}</li>}
              {data.profile.certifications && <li><strong>Certificaciones:</strong> {data.profile.certifications}</li>}
              {data.profile.country && <li><strong>País:</strong> {data.profile.country}</li>}
            </ul>
          </div>
        )}
        {/* Historial / Videos (profesionales) */}
        {!data.isEmpresa && data.videos && data.videos.length > 0 && (
          <div className="mt-4 rounded-xl border border-yapo-blue/15 bg-yapo-blue-light/10 p-4">
            <h3 className="text-sm font-semibold text-yapo-blue">Videos / Reels ({data.videos.length})</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
              {data.videos.map((v) => (
                <li key={v.id} className="flex items-center gap-2">
                  <span className="text-yapo-blue">▶</span>
                  {v.title}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.isEmpresa && data.buscan && data.buscan.length > 0 && (
          <div className="mt-4 rounded-xl border border-yapo-blue/15 bg-yapo-blue-light/10 p-4">
            <h3 className="text-sm font-semibold text-yapo-blue">Buscan</h3>
            <p className="mt-1 text-sm text-foreground/90">{data.buscan.join(", ")}</p>
          </div>
        )}
        {!data.isEmpresa && data.perfilCompleto && (
          <PerfilCompletoBlock data={data.perfilCompleto} />
        )}
        {data.whatsapp && (
          <div className="mt-4">
            <a
              href={buildWhatsAppUrl(data.whatsapp, DEFAULT_YAPO_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open(buildWhatsAppUrl(data.whatsapp!, DEFAULT_YAPO_WHATSAPP_MESSAGE), "_blank", "noopener,noreferrer");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white"
            >
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
