"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth";
import { getRoleName } from "@/lib/auth";
import type { RoleId } from "@/lib/auth";
import {
  BarraBusquedaYapo,
  ChipsIntencion,
  EscudosIndicator,
  DashboardQuadrants,
  QuickActionBar,
} from "@/components/adaptive-ui";
import type { AdaptiveConfigPayload, DashboardConfig } from "@/lib/adaptive-ui";
import { getDashboardConfig, planSlugToTier } from "@/lib/adaptive-ui";
import MapaRealYapoDynamic from "@/components/dashboard/MapaRealYapoDynamic";
import TopProfessionalsByCategory from "@/components/home/TopProfessionalsByCategory";
import YapoReels from "@/components/home/YapoReels";
import { YapoCardFeed } from "@/components/yapo-card";
import { YAPO_PERFILES_MOCK } from "@/data/yapo-perfiles-mock";

export default function HomePage() {
  const { identity } = useSession();
  const roles = identity?.roles ?? [];
  const primaryRole: RoleId | null = (roles[0] ?? null) as RoleId | null;
  const roleName = primaryRole ? getRoleName(primaryRole) : "Usuario";

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:render',message:'Home render',data:{primaryRole,rolesLen:roles.length,hasIdentity:!!identity},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:useEffect',message:'config fetch start',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    fetch("/api/adaptive-ui/config")
      .then((r) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:fetchResponse',message:'config response',data:{ok:r.ok,status:r.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        return r.ok ? r.json() : null;
      })
      .then((data: AdaptiveConfigPayload | null) => {
        if (!cancelled && data?.dashboard_config) {
          setConfig(data.dashboard_config);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:setConfig',message:'config set from API',data:{role:data?.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
        }
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:fetchCatch',message:'config fetch error',data:{err:String(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:loadingFalse',message:'loading set false',data:{cancelled},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardConfig = config ?? (primaryRole ? getDashboardConfig(primaryRole, planSlugToTier(null)) : null);
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:computed',message:'dashboardConfig computed',data:{hasConfig:!!config,hasFallback:!!dashboardConfig,primaryRole,loading},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  return (
    <main className="flex min-h-full flex-col gap-3 bg-yapo-blue-light/30 pt-0 px-4 pb-28">
      {/* Logo centrado en la página + barra pegada abajo; bloque más arriba */}
      <div className="flex flex-col items-center justify-center w-full max-w-full gap-0 -mt-6 sm:-mt-8 [&_img]:block [&_img]:leading-[0]">
        <section className="w-full pt-0 pb-0 leading-[0] flex justify-center" aria-label="YAPÓ">
          <Image
            src="/images/logo.png"
            alt="YAPÓ"
            width={1600}
            height={600}
            className="mx-auto w-full max-w-[min(90vw,480px)] h-auto object-contain object-center block align-bottom"
            priority
          />
        </section>
        <section className="w-full max-w-[min(90vw,520px)] mx-auto -mt-8 sm:-mt-10" aria-label="Barra de Búsqueda IA">
          <BarraBusquedaYapo config={dashboardConfig ?? undefined} />
        </section>
        {/* Chips de Intención (Layout Maestro): Mi Billetera, Transferir, Activar Escudo, Mensajes */}
        <section className="w-full max-w-[min(90vw,520px)] mx-auto mt-2" aria-label="Accesos rápidos">
          <ChipsIntencion />
        </section>
        {/* CTA hero arriba (prioridad alta UX): un solo siguiente paso visible sin scroll) */}
        <section className="mx-auto w-full max-w-[min(90vw,520px)] py-3" aria-label="Tu siguiente paso">
          <Link
            href={
              primaryRole && ["pyme", "enterprise"].includes(primaryRole)
                ? "/mapa"
                : "/home#profesionales"
            }
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-yapo-red px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
          >
            {primaryRole && ["pyme", "enterprise"].includes(primaryRole)
              ? "Publicá tu oferta y recibí propuestas"
              : "Encontrá tu próximo trabajo hoy"}
          </Link>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-foreground/60">
            <span>O</span>
            <Link href="/mapa" className="font-medium text-yapo-blue underline underline-offset-1">explorá el mapa</Link>
            <span>·</span>
            <Link href="/wallet" className="font-medium text-yapo-blue underline underline-offset-1">Ver mi billetera</Link>
          </p>
        </section>
      </div>

      {/* Bloque principal: Tu día — Reels + Panel + Zona (agrupado, jerarquía clara, auditoría UX) */}
      <div className="rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white/95 p-4 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-yapo-blue">
          Para vos hoy
        </h2>
        <section className="w-full max-w-[min(90vw,520px)] mx-auto" aria-label="Para vos hoy">
          <YapoReels
            role={primaryRole}
            city={(identity as { city?: string; location?: string })?.city ?? (identity as { location?: string })?.location}
          />
        </section>
        {dashboardConfig && (
          <section className="mt-4" aria-label="Tu panel">
            <h3 className="mb-2 text-sm font-semibold text-yapo-blue/90">
              Tu panel
            </h3>
            <DashboardQuadrants config={dashboardConfig} />
          </section>
        )}
        {loading && primaryRole && !dashboardConfig && (
          <section className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-yapo-blue/90">
              Tu panel
            </h3>
            <DashboardQuadrants
              config={getDashboardConfig(primaryRole, planSlugToTier(null))}
            />
          </section>
        )}
        {/* Mapa territorial real (OpenStreetMap) — reemplaza semáforo territorial */}
        {primaryRole && ["vale", "capeto", "kavaju", "mbarete"].includes(primaryRole) && (
          <section className="mt-4" aria-label="Mapa territorial">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-yapo-blue/90">
                Mapa territorial
              </h3>
              <Link href="/mapa" className="text-xs font-medium text-yapo-blue underline underline-offset-2">
                Ver buscador por zona →
              </Link>
            </div>
            <MapaRealYapoDynamic height="240px" showLegend />
          </section>
        )}
      </div>

      {/* Indicador de escudos (estatus) */}
      {dashboardConfig && (
        <section className="flex justify-center" aria-label="Estado de protección">
          <EscudosIndicator config={dashboardConfig} />
        </section>
      )}

      {/* Barra de acción rápida (roles) */}
      {dashboardConfig && (
        <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white/90 px-3 py-2 shadow-sm">
          <QuickActionBar config={dashboardConfig} />
        </section>
      )}

      {/* Feed YAPÓ-Card: tarjetas por tipificación (Oro/Azul/Verde) */}
      <section
        aria-label="Profesionales recomendados"
        className="rounded-xl border border-yapo-blue/10 bg-yapo-white/90 p-3 shadow-sm"
      >
        <h2 className="mb-3 text-sm font-semibold text-yapo-blue">
          Contratar con confianza
        </h2>
        {/* #region agent log */}
        {(() => {
          const len = YAPO_PERFILES_MOCK?.length ?? -1;
          fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'home/page.tsx:YapoCardFeedSection',message:'Rendering feed section',data:{perfilesLength:len,hasMock:!!YAPO_PERFILES_MOCK},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H3'})}).catch(()=>{});
          return null;
        })()}
        {/* #endregion */}
        <YapoCardFeed
          perfiles={YAPO_PERFILES_MOCK}
          scrollHorizontal
          onContratar={(perfilId) => {
            const url = `/trabajo/aceptar?profesionalId=${encodeURIComponent(perfilId)}`;
            if (typeof window !== "undefined") window.location.href = url;
          }}
        />
      </section>

      {/* Top profesionales por área — visual: categorías y oficios clicables, Ver perfil lleva a la acción */}
      <section
        id="profesionales"
        aria-label="Profesionales por área: oficios, movilidad, cuidados, profesional"
        className="rounded-xl border border-yapo-blue/10 bg-yapo-white/90 p-3 shadow-sm"
      >
        <p className="mb-2 text-xs text-yapo-blue/70">
          Tocá un área, filtrá por oficio y entrá al perfil
        </p>
        <TopProfessionalsByCategory />
      </section>

      {/* Sponsors/Beneficios solo si el config lo permite */}
      {dashboardConfig?.show_sponsors && (
        <section
          aria-label="Beneficios y sponsors"
          className="rounded-xl border border-yapo-blue/10 bg-yapo-white/90 p-3 shadow-sm"
        >
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
            Beneficios
          </h2>
          <Link
            href="/comunidad"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/20 bg-yapo-blue-light/30 px-4 py-2.5 font-medium text-yapo-blue"
          >
            👥 Comunidad · promos y referidos
          </Link>
        </section>
      )}

      {/* Atajos: altura táctil ≥ 44px (accesibilidad y UX móvil) */}
      <section className="rounded-xl border border-yapo-blue/10 bg-yapo-white/90 p-3 shadow-sm" aria-label="Atajos">
        <p className="mb-2 text-xs text-foreground/70">
          Explorar: Buscar, Buscador YAPÓ, escudos, planes
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/mapa"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-yapo-blue/20 px-4 py-3 text-sm font-semibold text-yapo-blue transition-[transform,opacity] duration-75 active:scale-[0.98]"
          >
            Buscar
          </Link>
          <Link
            href="/cerebro"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-yapo-blue/15 px-4 py-3 text-sm font-medium text-yapo-blue transition-[transform,opacity] duration-75 active:scale-[0.98]"
          >
            Buscador YAPÓ
          </Link>
          <Link
            href="/escudos"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-yapo-blue/15 px-4 py-3 text-sm font-medium text-yapo-blue transition-[transform,opacity] duration-75 active:scale-[0.98]"
          >
            Mis Escudos
          </Link>
          <Link
            href="/planes"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-yapo-red/15 px-4 py-3 text-sm font-medium text-yapo-red transition-[transform,opacity] duration-75 active:scale-[0.98]"
          >
            Planes
          </Link>
        </div>
      </section>

      <footer className="mt-auto pt-2 text-center">
        <Link
          href="/wallet"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-yapo-blue-light/40 px-4 py-2.5 text-sm font-semibold text-yapo-blue transition-[transform,opacity] duration-75 active:scale-[0.98]"
          aria-label="Ver saldo y pagos"
        >
          Ver saldo y pagos
        </Link>
      </footer>
    </main>
  );
}
