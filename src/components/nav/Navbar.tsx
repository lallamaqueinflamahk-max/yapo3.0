"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { EscudosIndicator } from "@/components/adaptive-ui";
import { getDashboardConfig, planSlugToTier } from "@/lib/adaptive-ui";
import type { RoleId } from "@/lib/auth";
import IconHome from "@/components/icons/IconHome";
import IconWallet from "@/components/icons/IconWallet";
import IconBuscar from "@/components/icons/IconBuscar";
import IconChat from "@/components/icons/IconChat";
import IconProfile from "@/components/icons/IconProfile";

const NAV_LINKS = [
  { id: "inicio", href: "/home", label: "Inicio", Icon: IconHome },
  { id: "trabajos", href: "/mapa", label: "Trabajos", Icon: IconHome },
  { id: "servicios", href: "/mapa?servicios=1", label: "Servicios", Icon: IconHome },
  { id: "empresas", href: "/comunidad", label: "Empresas", Icon: IconHome },
  { id: "buscar", href: "/mapa", label: "Buscar", Icon: IconBuscar },
  { id: "billetera", href: "/wallet", label: "Billetera", Icon: IconWallet },
  { id: "cerebro", href: "/cerebro", label: "Buscador YAPÓ", Icon: IconBuscar },
  { id: "chat", href: "/chat", label: "Chat", Icon: IconChat },
  { id: "panel", href: "/dashboard", label: "Panel", Icon: IconHome },
  { id: "perfil", href: "/profile", label: "Perfil", Icon: IconProfile },
  { id: "planes", href: "/profile#planes", label: "Suscripción y planes", Icon: IconProfile },
];

interface NavbarProps {
  /** Foto de usuario (desde sesión o seed) */
  userImage?: string | null;
  userName?: string | null;
  /** Si true, muestra flecha atrás en lugar de menú hamburguesa */
  showBack?: boolean;
  /** Título centrado */
  title?: string;
  /** Rol actual para UI adaptativa (indicador Escudos) */
  role?: RoleId | null;
  /** Nombre del plan de suscripción (ej. Valé, Capeto) */
  planName?: string | null;
  /** Badges verificados / reconocimientos (ej. Verificado, Certificado) */
  badges?: string[];
  /** Si el perfil está verificado (perfil completo, documento, etc.) */
  verified?: boolean;
}

function getRoleLabel(role: RoleId | null | undefined): string {
  if (!role) return "";
  const names: Record<string, string> = {
    vale: "Valé", capeto: "Capeto", kavaju: "Kavaju", mbarete: "Mbareté",
    cliente: "Cliente", pyme: "PyME", enterprise: "Enterprise",
  };
  return names[role] ?? role;
}

export default function Navbar({ userImage, userName, showBack, title: _title = "YAPÓ", role, planName, badges = [], verified }: NavbarProps) {
  const escudoConfig = useMemo(
    () => (role ? getDashboardConfig(role, planSlugToTier(null)) : null),
    [role]
  );
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Navbar.tsx:render',message:'Navbar role and escudo',data:{role,escudoLabel:escudoConfig?.escudo_label??null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/home");
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-gris-ui-border bg-yapo-white px-3 pt-[env(safe-area-inset-top)] shadow-sm"
        role="banner"
      >
        <div className="flex min-w-[44px] items-center justify-start">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-yapo-petroleo active:scale-95 active:bg-gris-ui"
              aria-label="Volver atrás"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-yapo-petroleo active:scale-95 active:bg-gris-ui"
              aria-label="Menú"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-9 w-9">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-1 min-h-[44px] items-center justify-center" aria-hidden />
        <div className="flex min-w-[44px] shrink-0 justify-end items-center gap-2">
          {escudoConfig && (
            <EscudosIndicator
              config={escudoConfig}
              className="!border-yapo-cta/30 !bg-yapo-cta/10 !text-yapo-cta shrink-0"
            />
          )}
          <Link
            href="/profile"
            className="flex min-w-0 items-center gap-2 rounded-full border border-gris-ui-border bg-gris-ui pl-1.5 pr-2 py-1 active:bg-yapo-blue-light/30"
          >
            <Avatar src={userImage} name={userName} size="sm" className="shrink-0 h-8 w-8 border-2 border-yapo-petroleo/20 bg-yapo-blue-light/50 text-yapo-petroleo shadow-sm" />
            <div className="hidden sm:flex flex-col items-end min-w-0 max-w-[120px]">
              {role != null && (
                <span className="text-[10px] font-semibold text-yapo-petroleo truncate w-full text-right" title={getRoleLabel(role)}>
                  {getRoleLabel(role)}
                </span>
              )}
              {planName && (
                <span className="text-[10px] text-gris-texto truncate w-full text-right" title={planName}>
                  {planName}
                </span>
              )}
              {(verified || badges.length > 0) && (
                <span className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-end">
                  {verified && (
                    <span className="inline-flex items-center rounded bg-yapo-validacion/20 px-1 py-0.5 text-[9px] font-medium text-yapo-validacion-dark" title="Perfil verificado">
                      ✓
                    </span>
                  )}
                  {badges.slice(0, 2).map((b) => (
                    <span key={b} className="rounded bg-yapo-cta/15 px-1 py-0.5 text-[9px] text-yapo-cta truncate max-w-[52px]" title={b}>
                      {b}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div className="flex sm:hidden items-center gap-0.5">
              {verified && <span className="text-yapo-validacion text-xs" title="Verificado">✓</span>}
              {badges.length > 0 && badges.length <= 2 && !verified && (
                <span className="text-yapo-petroleo text-[10px] truncate max-w-[40px]" title={badges.join(", ")}>{badges[0]}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Panel lateral menú */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50"
          aria-hidden
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-[61] h-full w-72 max-w-[85vw] transform bg-yapo-white shadow-xl transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="flex h-20 items-center justify-between border-b border-gris-ui-border bg-gradient-to-r from-yapo-petroleo to-yapo-petroleo-light px-4 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3">
            <Image src="/images/icon.png" alt="" width={64} height={64} className="h-16 w-16 object-contain drop-shadow-md" />
            <span className="text-xl font-bold text-yapo-white">Menú</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-yapo-white active:bg-white/20"
            aria-label="Cerrar menú"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map(({ id, href, label, Icon }) => {
            const isInicio = id === "inicio";
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={
                  isInicio
                    ? "flex items-center gap-3 py-2 font-medium text-yapo-petroleo hover:text-yapo-cta"
                    : `nav-card-interactive flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${
                        pathname === href
                          ? "bg-yapo-cta text-yapo-white shadow-md ring-2 ring-yapo-cta/50"
                          : "text-yapo-petroleo hover:bg-yapo-cta/15 hover:text-yapo-cta hover:shadow-sm"
                      }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
