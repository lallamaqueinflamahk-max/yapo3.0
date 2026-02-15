"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import type { RoleId } from "@/lib/auth";
import type { AdaptiveConfigPayload, DashboardConfig } from "@/lib/adaptive-ui";
import { getDashboardConfig, planSlugToTier } from "@/lib/adaptive-ui";
import HeroSection from "@/components/home/HeroSection";
import CerebroBarHomeSection from "@/components/home/CerebroBarHomeSection";
import QuickActionsGrid from "@/components/home/QuickActionsGrid";
import RecommendationsCards from "@/components/home/RecommendationsCards";
import SponsorsCarousel from "@/components/home/SponsorsCarousel";
import CategoriesBlock from "@/components/home/CategoriesBlock";
import BenefitsBlock from "@/components/home/BenefitsBlock";
import { YapoCardFeed } from "@/components/yapo-card";
import { YAPO_PERFILES_MOCK } from "@/data/yapo-perfiles-mock";

/**
 * Home según AppLayout:
 * Navbar (sticky) → HeroSection → Barra de IA (Buscador YAPÓ) → QuickActionsGrid →
 * Recommendations → SponsorsCarousel → TrustedProfessionals → Categories → Benefits → Footer.
 */
export default function HomePage() {
  const { identity } = useSession();
  const roles = identity?.roles ?? [];
  const primaryRole: RoleId | null = (roles[0] ?? null) as RoleId | null;

  const [config, setConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/adaptive-ui/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AdaptiveConfigPayload | null) => {
        if (!cancelled && data?.dashboard_config) setConfig(data.dashboard_config);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardConfig =
    config ??
    (primaryRole ? getDashboardConfig(primaryRole, planSlugToTier(null)) : null);

  return (
    <main className="flex min-h-full flex-col bg-gris-ui pb-24">
      <HeroSection />

      <CerebroBarHomeSection config={dashboardConfig} />

      <QuickActionsGrid />

      <RecommendationsCards />

      <SponsorsCarousel />

      <section id="profesionales" className="w-full py-5" aria-label="Profesionales destacados">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-3 text-lg font-bold text-yapo-petroleo">Profesionales destacados</h2>
          <p className="mb-4 text-xs text-gris-texto-light">Sugerencias según lo que buscás y tu historial de búsquedas</p>
        </div>
        <div className="relative w-full">
          <YapoCardFeed
            perfiles={YAPO_PERFILES_MOCK}
            scrollHorizontal
            onContratar={(perfilId) => {
              const url = `/trabajo/aceptar?profesionalId=${encodeURIComponent(perfilId)}`;
              if (typeof window !== "undefined") window.location.href = url;
            }}
          />
          <p className="mt-2 text-center text-xs text-gris-texto-light">Deslizá para ver más perfiles</p>
        </div>
      </section>

      <CategoriesBlock />

      <BenefitsBlock />
    </main>
  );
}
