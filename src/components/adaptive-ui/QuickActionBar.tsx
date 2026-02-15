"use client";

import React from "react";
import Link from "next/link";
import type { DashboardConfig, MainActionId } from "@/lib/adaptive-ui";
import IconHome from "@/components/icons/IconHome";
import IconWallet from "@/components/icons/IconWallet";
import IconEscudo from "@/components/icons/IconEscudo";
import IconCerebro from "@/components/icons/IconCerebro";
import IconChat from "@/components/icons/IconChat";
import IconProfile from "@/components/icons/IconProfile";

const ACTION_ID_TO_ROUTE: Record<MainActionId, string> = {
  Buscar_Trabajo: "/mapa",
  Mi_Calificacion: "/profile",
  Mis_Escudos: "/escudos",
  Beneficios_Sponsors: "/comunidad",
  Mis_Ruedas: "/dashboard",
  Mi_Territorio: "/mapa",
  Panel_Ganancias: "/wallet",
  Reclutamiento: "/mapa",
  Publicar_Vacante: "/mapa",
  Filtro_Talentos: "/mapa",
  Gestion_Pagos: "/wallet",
  Analytics_Marca: "/dashboard",
  Escudo_Lider: "/escudos",
  Gestion_Liquidez: "/wallet",
  Mapa_Territorio: "/mapa",
};

const ACTION_ID_TO_LABEL: Record<MainActionId, string> = {
  Buscar_Trabajo: "Trabajo",
  Mi_Calificacion: "Calificación",
  Mis_Escudos: "Escudos",
  Beneficios_Sponsors: "Beneficios",
  Mis_Ruedas: "Mis Ruedas",
  Mi_Territorio: "Mapa",
  Panel_Ganancias: "Ganancias",
  Reclutamiento: "Reclutar",
  Publicar_Vacante: "Vacante",
  Filtro_Talentos: "Talentos",
  Gestion_Pagos: "Pagos",
  Analytics_Marca: "Analytics",
  Escudo_Lider: "Escudo",
  Gestion_Liquidez: "Liquidez",
  Mapa_Territorio: "Territorio",
};

const ACTION_ID_TO_ICON: Record<MainActionId, React.ComponentType<{ className?: string }>> = {
  Buscar_Trabajo: IconHome,
  Mi_Calificacion: IconProfile,
  Mis_Escudos: IconEscudo,
  Beneficios_Sponsors: IconChat,
  Mis_Ruedas: IconHome,
  Mi_Territorio: IconHome,
  Panel_Ganancias: IconWallet,
  Reclutamiento: IconProfile,
  Publicar_Vacante: IconHome,
  Filtro_Talentos: IconProfile,
  Gestion_Pagos: IconWallet,
  Analytics_Marca: IconHome,
  Escudo_Lider: IconEscudo,
  Gestion_Liquidez: IconWallet,
  Mapa_Territorio: IconHome,
};

interface QuickActionBarProps {
  config: DashboardConfig;
  className?: string;
}

/**
 * Barra de acción rápida con iconos limpios.
 * Sustituye los 15-20 chips por pocos botones con textos en "Paraguayo directo".
 */
export default function QuickActionBar({ config, className = "" }: QuickActionBarProps) {
  const { main_actions, primary_color } = config;

  return (
    <nav
      className={`flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide ${className}`}
      aria-label="Acción rápida"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {main_actions.map((id) => {
        const href = ACTION_ID_TO_ROUTE[id] ?? "/home";
        const label = ACTION_ID_TO_LABEL[id] ?? id;
        const Icon = ACTION_ID_TO_ICON[id] ?? IconHome;
        return (
          <Link
            key={id}
            href={href}
            className="flex min-h-[44px] min-w-[72px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-yapo-blue/20 bg-yapo-white px-3 py-2 text-center transition-[transform,background] active:scale-95 active:bg-yapo-blue-light/30"
          >
            <Icon className="h-6 w-6 shrink-0 text-yapo-blue" style={{ color: primary_color }} />
            <span className="text-[11px] font-medium text-yapo-blue leading-tight" style={{ color: primary_color }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
