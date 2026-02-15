"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconBuscar,
  IconWallet,
  IconProfile,
} from "@/components/icons";

/** ActionBar: 4 iconos — Inicio, Buscar (mapa), Billetera, Perfil. */
const actions = [
  { href: "/home", label: "Inicio", Icon: IconHome, id: "home" },
  { href: "/mapa", label: "Buscar", Icon: IconBuscar, id: "buscar" },
  { href: "/wallet", label: "Billetera", Icon: IconWallet, id: "billetera" },
  { href: "/profile", label: "Perfil", Icon: IconProfile, id: "perfil" },
] as const;

export default function ActionBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t-2 border-yapo-cta/20 bg-yapo-white pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(245,124,42,0.12)]"
      role="navigation"
      aria-label="Acciones principales"
    >
      {actions.map(({ href, label, Icon, id }) => {
        const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href));
        const isInicio = id === "home";
        return (
          <Link
            key={id}
            href={href}
            className={
              isInicio
                ? "nav-card-interactive flex min-h-[64px] min-w-[64px] flex-col items-center justify-center gap-1 py-2.5 text-yapo-petroleo hover:text-yapo-cta hover:shadow-md active:scale-[0.98] aria-[current=page]:font-semibold aria-[current=page]:text-yapo-cta"
                : `nav-card-interactive flex min-h-[64px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2.5 ${
                    isActive
                      ? "bg-yapo-cta/20 font-semibold text-yapo-cta shadow-md ring-2 ring-yapo-cta/40"
                      : "text-yapo-petroleo hover:bg-yapo-cta/10 hover:text-yapo-cta hover:shadow-md"
                  }`
            }
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
            <span className="text-[10px] font-medium leading-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
