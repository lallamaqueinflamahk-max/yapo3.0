"use client";

import Link from "next/link";
import {
  IconHome,
  IconCerebro,
  IconChat,
  IconWallet,
  IconProfile,
} from "@/components/icons";

const actions = [
  { href: "/home", label: "Inicio", Icon: IconHome, id: "home" },
  { href: "/cerebro", label: "Cerebro", Icon: IconCerebro, id: "cerebro" },
  { href: "/chat", label: "Chat", Icon: IconChat, id: "chat" },
  { href: "/wallet", label: "Billetera", Icon: IconWallet, id: "wallet" },
  { href: "/profile", label: "Perfil", Icon: IconProfile, id: "profile" },
] as const;

export default function ActionBar() {
  const handleAction = (id: string) => {
    console.log(`[ActionBar] Navegar: ${id}`);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-yapo-blue/20 bg-yapo-white pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-2px_10px_rgba(0,35,149,0.08)]"
      role="navigation"
      aria-label="Acciones principales"
    >
      {actions.map(({ href, label, Icon, id }) => (
        <Link
          key={id}
          href={href}
          onClick={() => handleAction(id)}
          className="flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-yapo-blue transition-[transform,background] active:scale-95 active:bg-yapo-blue/10"
          aria-label={label}
        >
          <Icon className="h-7 w-7 shrink-0" />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
