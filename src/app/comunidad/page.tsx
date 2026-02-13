"use client";

import Link from "next/link";
import IconChat from "@/components/icons/IconChat";
import IconProfile from "@/components/icons/IconProfile";
import IconWallet from "@/components/icons/IconWallet";
import IconHome from "@/components/icons/IconHome";

/**
 * Apartado especial de Comunidad (escudo Comunidad).
 * Funciones: interacciones, validación de desempeño, ranking y referidos.
 */
const COMUNIDAD_FUNCIONES = [
  { id: "interacciones", label: "Interacciones", description: "Conectá con otros en la red laboral, mensajes y grupos.", icon: "💬" },
  { id: "validacion", label: "Validación de desempeño", description: "Tu trabajo validado por la comunidad y empleadores.", icon: "✅" },
  { id: "ranking", label: "Ranking", description: "Posición según reputación y actividad en la plataforma.", icon: "📊" },
  { id: "referidos", label: "Referidos", description: "Invitá a otros y sumá beneficios cuando se registren.", icon: "👥" },
] as const;

const QUICK_LINKS = [
  { href: "/chat", label: "Chat / Mensajes", Icon: IconChat },
  { href: "/profile", label: "Mi perfil", Icon: IconProfile },
  { href: "/wallet", label: "Billetera", Icon: IconWallet },
  { href: "/home", label: "Inicio", Icon: IconHome },
] as const;

export default function ComunidadPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yapo-blue text-2xl text-yapo-white" aria-hidden>👥</span>
        <div>
          <h1 className="text-xl font-bold text-yapo-blue">Comunidad</h1>
          <p className="text-sm text-yapo-blue/80">Apartado especial: red laboral, validación y referidos</p>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-4 shadow-sm" aria-label="Qué es Comunidad">
        <p className="text-sm text-foreground/90">
          La comunidad en YAPÓ es un espacio para conectar con la red laboral, validar desempeño, ver tu ranking y gestionar referidos. Acá están las funciones disponibles en este apartado.
        </p>
      </section>

      <section className="mb-6" aria-label="Funciones de Comunidad">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue">
          Funciones de Comunidad
        </h2>
        <ul className="grid gap-3">
          {COMUNIDAD_FUNCIONES.map(({ id, label, description, icon }) => (
            <li
              key={id}
              className="flex gap-4 rounded-xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm"
            >
              <span className="text-2xl" aria-hidden>{icon}</span>
              <div>
                <h3 className="font-semibold text-yapo-blue">{label}</h3>
                <p className="mt-1 text-sm text-foreground/80">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Accesos rápidos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Accesos rápidos
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-[56px] items-center gap-4 rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 text-left font-semibold text-yapo-blue shadow-sm transition-[transform,background,border-color] active:scale-[0.98] active:border-yapo-blue/40 active:bg-yapo-blue/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yapo-red/10 text-yapo-red">
                  <Icon className="h-6 w-6" />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
