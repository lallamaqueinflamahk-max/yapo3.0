"use client";

import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";

export interface HomeHeaderProps {
  userImage?: string | null;
  userName?: string | null;
}

/**
 * App Header mobile-first para la HOME:
 * Status bar (safe area) + Logo YAPO + Icono notificaciones + Icono perfil.
 * Resolución objetivo 390x844; pixel-perfect.
 */
export default function HomeHeader({ userImage, userName }: HomeHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between gap-2 bg-yapo-white px-4 shadow-sm border-b border-gris-ui-border"
      style={{ paddingTop: "env(safe-area-inset-top, 0)" }}
      role="banner"
    >
      <Link
        href="/home"
        className="flex min-h-[44px] min-w-[44px] items-center justify-start"
        aria-label="YAPÓ inicio"
      >
        <Image
          src="/images/logo.png"
          alt="YAPÓ"
          width={160}
          height={52}
          className="h-12 w-auto max-h-14 object-contain sm:h-14"
          priority
        />
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/notificaciones"
          className="flex h-10 w-10 items-center justify-center rounded-full text-yapo-petroleo active:bg-gris-ui"
          aria-label="Notificaciones"
        >
          <NotificationsIcon className="h-6 w-6" />
        </Link>
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gris-ui"
          aria-label="Perfil"
        >
          <Avatar src={userImage} name={userName} size="sm" className="h-9 w-9" />
        </Link>
      </div>
    </header>
  );
}

function NotificationsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
