"use client";

import SafeModeRoleSelector from "@/components/auth/SafeModeRoleSelector";

export default function Header() {
  const handleMenu = () => {
    console.log("[Header] Menú tocado");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-center gap-2 bg-yapo-red px-4 pt-[env(safe-area-inset-top)] text-yapo-white shadow-md"
      role="banner"
    >
      <button
        type="button"
        onClick={handleMenu}
        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full active:scale-95 active:bg-white/20"
        aria-label="Menú"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-bold tracking-wide">YAPÓ</span>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <SafeModeRoleSelector variant="compact" className="[&_select]:border-white/30 [&_select]:bg-white/10 [&_select]:text-white [&_select]:min-h-[36px]" />
      </div>
    </header>
  );
}
