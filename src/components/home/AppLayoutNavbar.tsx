"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";

const MAIN_LINKS = [
  { id: "trabajos", href: "/mapa", label: "Trabajos" },
  { id: "servicios", href: "/mapa?servicios=1", label: "Servicios" },
  { id: "empresas", href: "/comunidad", label: "Empresas" },
];

/**
 * Navbar según AppLayout: Logo | Trabajos | Servicios | Empresas | Search mini | Iniciar sesión | Publicar anuncio (orange).
 * Sticky. En móvil: Logo + menú + Publicar anuncio.
 */
export default function AppLayoutNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { identity } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchMini, setSearchMini] = useState("");

  const isLoggedIn = Boolean(identity?.userId && identity.userId !== "safe-user");

  useEffect(() => setMenuOpen(false), [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchMini.trim();
    if (q) router.push(`/mapa?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header
        className="sticky top-0 left-0 right-0 z-50 flex h-14 items-center gap-2 border-b border-yapo-petroleo/20 bg-yapo-white px-3 shadow-sm md:gap-4 md:px-4"
        role="banner"
      >
        <Link href="/home" className="flex shrink-0 items-center gap-2" aria-label="YAPO Inicio">
          <Image src="/images/logo.png" alt="YAPO" width={120} height={40} className="h-8 w-auto object-contain md:h-9" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Principal">
          {MAIN_LINKS.map(({ id, href, label }) => (
            <Link
              key={id}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gris-texto hover:bg-gris-ui hover:text-yapo-petroleo"
            >
              {label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xs md:block">
          <div className="flex h-9 items-center gap-1 rounded-lg border border-gris-ui-border bg-gris-ui px-2">
            <span className="text-gris-texto-light text-sm" aria-hidden>🔍</span>
            <input
              type="search"
              placeholder="Buscar…"
              value={searchMini}
              onChange={(e) => setSearchMini(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-gris-texto outline-none placeholder:text-gris-texto-light"
              aria-label="Búsqueda rápida"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {!isLoggedIn && (
            <Link
              href="/login"
              className="hidden rounded-lg border-2 border-yapo-blue px-3 py-2 text-sm font-semibold text-yapo-blue hover:bg-yapo-blue/10 md:inline-block"
            >
              Iniciar sesión
            </Link>
          )}
          <Link
            href="/mapa"
            className="flex h-9 min-w-[100px] items-center justify-center rounded-lg bg-yapo-cta px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-yapo-cta-hover active:scale-[0.98]"
          >
            Publicar anuncio
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gris-texto hover:bg-gris-ui md:hidden"
            aria-label="Menú"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" aria-hidden onClick={() => setMenuOpen(false)} />
          <aside
            className="fixed top-0 right-0 z-[61] h-full w-72 max-w-[90vw] border-l border-gris-ui-border bg-yapo-white p-4 shadow-xl md:hidden"
            role="navigation"
            aria-label="Menú"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-yapo-petroleo">Menú</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-gris-ui" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"> <path d="M18 6L6 18M6 6l12 12" /> </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {MAIN_LINKS.map(({ id, href, label }) => (
                <Link key={id} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-medium text-yapo-petroleo hover:bg-gris-ui">
                  {label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-medium text-yapo-blue hover:bg-yapo-blue/10">
                  Iniciar sesión
                </Link>
              )}
              <Link href="/mapa" onClick={() => setMenuOpen(false)} className="rounded-lg px-4 py-3 font-bold text-yapo-cta hover:bg-yapo-cta/10">
                Publicar anuncio
              </Link>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
