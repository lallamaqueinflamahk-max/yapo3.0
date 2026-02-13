"use client";

import Link from "next/link";
import type { DashboardConfig, QuadrantItem } from "@/lib/adaptive-ui";

interface DashboardQuadrantsProps {
  config: DashboardConfig;
  className?: string;
}

/**
 * Dashboard de 4 cuadrantes dinámicos según rol/tier.
 * Las opciones más importantes bien ordenadas y visibles.
 */
export default function DashboardQuadrants({ config, className = "" }: DashboardQuadrantsProps) {
  const { quadrants, primary_color } = config;

  return (
    <section
      className={`grid grid-cols-2 gap-3 ${className}`}
      aria-label="Acciones principales por rol"
    >
      {quadrants.map((q: QuadrantItem, i: number) => (
        <Link
          key={q.id}
          href={q.href}
          className="flex min-h-[88px] flex-col justify-center rounded-xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm transition-[transform,border-color,background,box-shadow] active:scale-[0.98] active:border-yapo-blue/40 active:bg-yapo-blue-light/20 active:shadow-inner"
        >
          <span className="mb-1 text-2xl leading-none" aria-hidden>
            {q.icon}
          </span>
          <span className="font-semibold text-yapo-blue" style={{ color: primary_color }}>
            {q.label}
          </span>
          {q.description && (
            <span className="mt-0.5 text-xs text-foreground/60">{q.description}</span>
          )}
        </Link>
      ))}
    </section>
  );
}
