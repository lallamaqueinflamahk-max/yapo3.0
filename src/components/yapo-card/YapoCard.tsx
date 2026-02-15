"use client";

import Link from "next/link";
import type { YapoPerfil, YapoCardVariant } from "@/types/yapo-perfil";
import { tipificacionToVariant } from "@/types/yapo-perfil";
import Button from "@/components/ui/Button";

const VARIANT_STYLES: Record<
  YapoCardVariant,
  { border: string; bg: string; badge: string; label: string }
> = {
  mbarete: {
    border: "border-2 border-yapo-amber shadow-[0_0_12px_rgba(232,163,23,0.35)]",
    bg: "bg-gradient-to-br from-yapo-amber-light/40 to-yapo-amber/20",
    badge: "bg-yapo-amber text-yapo-white",
    label: "Líder · Alta reputación",
  },
  profesional: {
    border: "border-2 border-yapo-blue shadow-md",
    bg: "bg-gradient-to-br from-yapo-blue-light/50 to-yapo-blue/10",
    badge: "bg-yapo-blue text-yapo-white",
    label: "Certificado (IPS, Títulos, Matrícula)",
  },
  kavaju: {
    border: "border-2 border-yapo-emerald shadow-md",
    bg: "bg-gradient-to-br from-yapo-emerald-light/50 to-yapo-emerald/20",
    badge: "bg-yapo-emerald text-yapo-white",
    label: "Servicios rápidos · Mañas verificadas",
  },
};

const INSIGNIA_CONFIG: Record<
  string,
  { icon: string; label: string }
> = {
  insurtech: {
    icon: "🛡️",
    label: "Trabajo asegurado contra accidentes",
  },
  sello_mec_snpp: {
    icon: "📜",
    label: "Certificado por institución oficial",
  },
  referido_mbareté: {
    icon: "🤝",
    label: "Avalado por líder",
  },
};

interface YapoCardProps {
  perfil: YapoPerfil;
  href?: string;
  onContratar?: (perfilId: string) => void;
  compact?: boolean;
}

export default function YapoCard({
  perfil,
  href = `/profile/${perfil.perfil_id}`,
  onContratar,
  compact = false,
}: YapoCardProps) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'yapo-card/YapoCard.tsx:render',message:'YapoCard render',data:{perfilId:perfil?.perfil_id,tipificacion:perfil?.tipificacion},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  const variant = tipificacionToVariant(perfil.tipificacion);
  const styles = VARIANT_STYLES[variant];
  const nombre = perfil.nombre ?? `Profesional ${perfil.perfil_id.slice(-6)}`;
  const storyItems = perfil.story_trabajos?.slice(0, 3) ?? [];
  const insignias = perfil.insignias ?? [];

  const cardContent = (
    <article
      className={`nav-card-interactive rounded-2xl overflow-hidden ${styles.bg} ${styles.border} ${compact ? "max-w-[320px] flex flex-col" : "w-full"}`}
      aria-label={`Perfil de ${nombre}, ${perfil.especialidad}`}
    >
      {compact ? (
        <>
          {/* Foto grande rectangular: ocupa casi todo el recuadro arriba */}
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-yapo-blue/10">
            {perfil.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.avatar_url}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-yapo-blue">
                {nombre.slice(0, 2).toUpperCase()}
              </span>
            )}
            {perfil.biometria === "Verificado_FaceID" && (
              <span
                className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-yapo-emerald text-xs text-white shadow"
                title="Verificado biométricamente"
                aria-label="Verificado biométricamente"
              >
                ✓
              </span>
            )}
          </div>
          {/* Descripción, puntuación y todo debajo */}
          <div className="flex flex-1 flex-col p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{nombre}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                {perfil.tipificacion}
              </span>
            </div>
            <p className="text-sm text-foreground/80">{perfil.especialidad}</p>
            <p className="text-xs text-foreground/60">
              {perfil.ubicacion.barrio}, {perfil.ubicacion.ciudad}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="font-medium text-yapo-amber" aria-label={`${perfil.reputacion.estrellas} estrellas`}>
                ★ {perfil.reputacion.estrellas}
              </span>
              <span className="text-foreground/60">
                {perfil.reputacion.proyectos_exitosos} trabajos
              </span>
            </div>
            {insignias.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {insignias.map((key) => {
                  const config = INSIGNIA_CONFIG[key];
                  if (!config) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-0.5 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] text-foreground"
                      title={config.label}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  );
                })}
              </div>
            )}
            {/* Banner Contratar más chiquito */}
            <div className="mt-3">
              <Button
                variant="red"
                className="btn-interactive w-full py-1.5 text-xs font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContratar?.(perfil.perfil_id);
                }}
              >
                Contratar con 50% de Seña Protegida
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-3 p-4">
            <div className="relative shrink-0">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-yapo-blue/20 shadow-inner">
                {perfil.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={perfil.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-bold text-yapo-blue">
                    {nombre.slice(0, 2).toUpperCase()}
                  </span>
                )}
                {perfil.biometria === "Verificado_FaceID" && (
                  <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-yapo-emerald text-[10px] text-white shadow" title="Verificado biométricamente" aria-label="Verificado biométricamente">✓</span>
                )}
              </div>
              {storyItems.length > 0 && (
                <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                  {storyItems.map((item, i) => (
                    <div key={i} className="h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-gray-200 ring-1 ring-black/10" title={item.titulo ?? `Trabajo ${i + 1}`}>
                      {item.tipo === "video" ? (
                        <span className="flex h-full w-full items-center justify-center text-[10px]">▶</span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{nombre}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}>{perfil.tipificacion}</span>
              </div>
              <p className="text-sm text-foreground/80">{perfil.especialidad}</p>
              <p className="text-xs text-foreground/60">{perfil.ubicacion.barrio}, {perfil.ubicacion.ciudad}</p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-medium text-yapo-amber" aria-label={`${perfil.reputacion.estrellas} estrellas`}>★ {perfil.reputacion.estrellas}</span>
                <span className="text-foreground/60">{perfil.reputacion.proyectos_exitosos} trabajos</span>
              </div>
            </div>
          </div>
          {insignias.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {insignias.map((key) => {
                const config = INSIGNIA_CONFIG[key];
                if (!config) return null;
                return (
                  <span key={key} className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-1 text-xs text-foreground" title={config.label}>
                    <span>{config.icon}</span>
                    <span className="hidden sm:inline">{config.label}</span>
                  </span>
                );
              })}
            </div>
          )}
          <div className="px-4 pb-4">
            <Button variant="red" className="w-full text-sm py-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onContratar?.(perfil.perfil_id); }}>
              Contratar con 50% de Seña Protegida
            </Button>
          </div>
        </>
      )}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-yapo-blue rounded-2xl">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
}
