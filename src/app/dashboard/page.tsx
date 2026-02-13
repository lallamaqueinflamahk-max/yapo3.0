"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import type { RoleId } from "@/lib/auth";
import MapaRealYapoDynamic from "@/components/dashboard/MapaRealYapoDynamic";
import MetricsCard from "@/components/dashboard/MetricsCard";
import PlanCard from "@/components/dashboard/PlanCard";
import SubscriptionUpgrade from "@/components/dashboard/SubscriptionUpgrade";
import YapoMetrix from "@/components/dashboard/YapoMetrix";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const PANEL_LINKS = [
  { href: "/home", label: "Inicio", description: "Pantalla principal" },
  { href: "/wallet", label: "Billetera", description: "Pagos y saldo" },
  { href: "/chat", label: "Chat", description: "Mensajes y contacto" },
  { href: "/profile", label: "Perfil", description: "Tu perfil y rol" },
  { href: "/cerebro", label: "Buscador YAPÓ", description: "Consultas y acciones" },
] as const;

interface DashboardMetrics {
  offersActive: number;
  transactionsCount: number;
  ratingAvg: number;
  chipsUsage: number;
}

interface DashboardPlan {
  slug: string;
  name: string;
  pricePyG: number;
  period: string;
  maxOffers?: number;
  maxTransfers?: number;
  benefits: string[];
}

interface RatingItem {
  score: number;
  type: string;
  comment?: string | null;
  fromUserId?: string;
  toUserId?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const { identity } = useSession();
  const primaryRole: RoleId | null = (identity?.roles?.[0] ?? null) as RoleId | null;
  const showMetrix = primaryRole === "pyme" || primaryRole === "enterprise";
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:render',message:'Dashboard role and METRIX',data:{primaryRole,showMetrix,rolesLen:identity?.roles?.length??0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [plan, setPlan] = useState<DashboardPlan | null>(null);
  const [ratings, setRatings] = useState<{ received: RatingItem[]; sent: RatingItem[]; avgReceived: number } | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((r) => r.ok && r.json())
      .then(setMetrics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/plan")
      .then((r) => r.ok && r.json())
      .then(setPlan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/ratings")
      .then((r) => r.ok && r.json())
      .then(setRatings)
      .catch(() => {});
  }, []);

  const priceLabel = plan?.pricePyG === 0 ? "Gratis" : `${(plan?.pricePyG ?? 0).toLocaleString("es-PY")} PYG/mes`;

  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-yapo-blue">YAPÓ Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Métricas de uso, mapa territorial y calificaciones empleado ↔ empleador.
        </p>
      </header>

      {/* YAPÓ-METRIX y YAPÓ-SENSE: solo para PyME y Enterprise */}
      {showMetrix && (
        <section className="mb-6 flex flex-wrap gap-3" aria-label="YAPÓ-METRIX y métricas">
          <YapoMetrix />
          <Link
            href="/yapo-sense"
            className="flex min-h-[64px] flex-1 min-w-[200px] flex-col justify-center rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 shadow-sm"
          >
            <span className="font-semibold text-yapo-blue">YAPÓ-SENSE</span>
            <span className="text-xs text-foreground/60">Métricas por zona, desempleo, huecos de mercado</span>
          </Link>
        </section>
      )}

      {plan && (
        <section className="mb-6" aria-label="Tu plan">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Tu plan</h2>
          <PlanCard
            name={plan.name}
            price={priceLabel}
            period={plan.period === "month" ? "por mes" : plan.period}
            benefits={plan.benefits}
            action={
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="w-full rounded-xl border-2 border-yapo-blue/30 py-2 text-sm font-medium text-yapo-blue"
              >
                Mejorar plan
              </button>
            }
          />
        </section>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Métricas">
        <MetricsCard title="Ofertas activas" value={metrics?.offersActive ?? "—"} subtitle="Este mes" trend="up" />
        <MetricsCard title="Transacciones" value={metrics?.transactionsCount ?? "—"} subtitle="Últimos 30 días" trend="neutral" />
        <MetricsCard title="Calificación" value={metrics?.ratingAvg ?? "—"} subtitle="Promedio recibido" trend="up" />
        <MetricsCard title="Uso de chips" value={metrics?.chipsUsage ?? "—"} subtitle="Buscador YAPÓ / búsquedas" trend="up" />
      </section>

      <section className="mb-6" aria-label="Mapa territorial">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Mapa territorial</h2>
          <Link href="/mapa" className="text-xs font-medium text-yapo-blue underline underline-offset-2">Ver buscador por zona →</Link>
        </div>
        <MapaRealYapoDynamic height="280px" showLegend />
      </section>

      <section className="mb-6 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Calificaciones">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Calificaciones empleado ↔ empleador
        </h2>
        <p className="text-sm text-foreground/80">
          Calificaciones entre trabajadores y contratantes. Promedio recibido: <strong>{ratings?.avgReceived ?? "—"} ★</strong>
        </p>
        <div className="mt-3 space-y-2">
          {(ratings?.received?.length ?? 0) > 0 ? (
            ratings!.received.slice(0, 5).map((r, i) => (
              <div key={i} className="rounded-xl border border-yapo-blue/10 bg-yapo-blue-light/10 px-3 py-2 text-sm">
                <span className="font-medium text-yapo-blue">★ {r.score}</span>
                <span className="ml-2 text-foreground/80">{r.type === "employer_to_employee" ? "Empleador → vos" : "Vos → empleador"}</span>
                {r.comment && <p className="mt-1 text-foreground/70">{r.comment}</p>}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-yapo-blue/10 bg-yapo-blue-light/20 p-4 text-center text-sm text-foreground/70">
              Aún no tenés calificaciones. Aparecerán acá cuando empleadores o empleados te califiquen.
            </div>
          )}
        </div>
      </section>

      <section className="mb-6">
        <WhatsAppButton label="Soporte YAPÓ por WhatsApp" className="w-full sm:w-auto" />
      </section>

      <section aria-label="Navegación del panel">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">Ir a</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href="/mapa"
              className="flex min-h-[64px] flex-col justify-center rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 shadow-sm transition-[transform,background,border-color] active:scale-[0.98] active:border-yapo-blue/40 active:bg-yapo-blue/5"
            >
              <span className="font-semibold text-yapo-blue">Mapa GPS</span>
              <span className="text-xs text-foreground/60">Zonas por depto, ciudad y barrio; profesiones en la zona</span>
            </Link>
          </li>
          {PANEL_LINKS.map(({ href, label, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-[64px] flex-col justify-center rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 shadow-sm transition-[transform,background,border-color] active:scale-[0.98] active:border-yapo-blue/40 active:bg-yapo-blue/5"
              >
                <span className="font-semibold text-yapo-blue">{label}</span>
                <span className="text-xs text-foreground/60">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SubscriptionUpgrade open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </main>
  );
}
