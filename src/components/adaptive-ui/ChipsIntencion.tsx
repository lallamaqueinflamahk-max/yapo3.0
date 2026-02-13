"use client";

import Link from "next/link";
import { IconWallet, IconChat } from "@/components/icons";

/** Icono transferir (flecha) */
function IconTransfer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 17L17 7M17 7h-10M17 7v10" />
    </svg>
  );
}

/** Icono escudo */
function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const CHIPS = [
  { href: "/wallet", label: "Mi Billetera", Icon: IconWallet, id: "billetera" },
  { href: "/wallet#transferir", label: "Transferir", Icon: IconTransfer, id: "transferir" },
  { href: "/escudos", label: "Activar Escudo", Icon: IconShield, id: "escudo" },
  { href: "/chat", label: "Mensajes", Icon: IconChat, id: "mensajes" },
] as const;

const TOUCH_CLASS =
  "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-yapo-blue/25 bg-yapo-white/90 px-4 py-2.5 text-sm font-medium text-yapo-blue shadow-sm transition-[transform,opacity] duration-75 hover:bg-yapo-blue-light/30 hover:opacity-90 active:scale-[0.98] active:opacity-100";

/**
 * Chips de Intención del Header Inteligente (Layout Maestro).
 * Debajo de la Barra de Búsqueda IA: Mi Billetera, Transferir, Activar Escudo, Mensajes.
 */
export default function ChipsIntencion() {
  return (
    <nav
      className="flex flex-wrap gap-2"
      role="navigation"
      aria-label="Accesos rápidos: Billetera, Transferir, Escudo, Mensajes"
    >
      {CHIPS.map(({ href, label, Icon, id }) => (
        <Link key={id} href={href} className={TOUCH_CLASS} aria-label={label}>
          <Icon className="h-5 w-5 shrink-0 text-yapo-blue" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
