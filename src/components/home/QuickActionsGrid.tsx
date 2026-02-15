"use client";

import Link from "next/link";

const ITEMS = [
  { id: "empleo-cerca", href: "/mapa", label: "Buscar empleo cerca", image: "/images/icon-buscar.png" },
  { id: "top-ofertas", href: "/home#profesionales", label: "Top ofertas hoy", icon: "⭐" },
  { id: "postulaciones", href: "/profile#curriculum", label: "Mis postulaciones", icon: "📄" },
  { id: "mensajes", href: "/chat", label: "Mensajes", icon: "💬" },
  { id: "billetera", href: "/wallet", label: "Mi billetera", image: "/images/icon-billetera.png" },
  { id: "escudo", href: "/escudos", label: "Activar escudo", image: "/images/icon-escudo.png" },
];

export default function QuickActionsGrid() {
  return (
    <section className="mx-auto w-full max-w-[390px] px-4 mt-5 sm:max-w-7xl" aria-label="Accesos rápidos">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {ITEMS.map(({ id, href, label, icon, image }) => (
          <Link
            key={id}
            href={href}
            title={label}
            className="group relative inline-flex shrink-0 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
            aria-label={label}
          >
            {(image ?? icon) ? (
              <>
                {image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt=""
                      className="h-16 w-auto max-w-[80px] object-contain drop-shadow-md transition-shadow duration-200 group-hover:drop-shadow-xl sm:h-20 sm:max-w-[100px] md:h-24 md:max-w-[120px]"
                    />
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-yapo-petroleo px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl drop-shadow-md transition-all duration-200 group-hover:scale-110 sm:text-5xl md:text-6xl" aria-hidden>
                      {icon}
                    </span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-yapo-petroleo px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                      {label}
                    </span>
                  </>
                )}
              </>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
