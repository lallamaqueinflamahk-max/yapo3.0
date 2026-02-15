"use client";

import Link from "next/link";
import { IconBuscar } from "@/components/icons";
import type { DashboardConfig } from "@/lib/adaptive-ui";

interface CerebroBarCompactProps {
  /** Placeholder: "Buscar con YAPÓ" o "Buscar trabajadores con YAPÓ" según rol */
  placeholder?: string;
  /** Si se pasa config, usa config.search_placeholder */
  config?: DashboardConfig | null;
}

/**
 * Buscador YAPÓ global: siempre arriba.
 * PYME → busca trabajadores; Trabajador → busca empleos/sponsors.
 * Placeholder inteligente desde dashboard_config.
 */
export default function CerebroBarCompact({ placeholder, config }: CerebroBarCompactProps) {
  const text = config?.search_placeholder ?? placeholder ?? "Buscar con YAPÓ";

  return (
    <Link
      href="/cerebro"
      className="nav-card-interactive flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 border-yapo-blue/30 bg-yapo-white px-4 py-2.5 shadow-md hover:border-yapo-cta/40 hover:bg-yapo-cta/5 hover:shadow-lg"
      aria-label={text}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">
        <IconBuscar className="h-14 w-14" />
      </span>
      <span className="flex-1 text-left text-sm text-foreground/70">{text}</span>
      <span className="text-yapo-blue/60" aria-hidden>
        →
      </span>
    </Link>
  );
}
