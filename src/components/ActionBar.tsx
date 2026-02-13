"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCerebro,
  IconWallet,
  IconProfile,
} from "@/components/icons";

/** ActionBar: 4 iconos — Inicio, Buscar (mapa), Billetera, Perfil. Etiqueta unificada "Buscar" (auditoría UX). */
const actions = [
  { href: "/home", label: "Inicio", Icon: IconHome, id: "home" },
  { href: "/mapa", label: "Buscar", Icon: IconCerebro, id: "buscar" },
  { href: "/wallet", label: "Billetera", Icon: IconWallet, id: "billetera" },
  { href: "/profile", label: "Perfil", Icon: IconProfile, id: "perfil" },
] as const;

export default function ActionBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-yapo-blue/20 bg-yapo-white pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-2px_10px_rgba(0,35,149,0.08)]"
      role="navigation"
      aria-label="Acciones principales"
    >
      {actions.map(({ href, label, Icon, id }) => {
        const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={id}
            href={href}
            className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition-[transform,background] duration-75 active:scale-95 ${
              isActive
                ? "bg-yapo-blue/15 font-semibold text-yapo-blue"
                : "text-yapo-blue active:bg-yapo-blue/10"
            }`}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-7 w-7 shrink-0" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
