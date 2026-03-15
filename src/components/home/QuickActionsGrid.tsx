"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS_COLLAPSED = [
  { id: "publicar", href: "/mapa?servicios=1", label: "Ofrecer mis servicios", icon: "📤" },
  { id: "mensajes", href: "/chat", label: "Ver mis conversaciones", icon: "💬" },
  { id: "billetera", href: "/wallet", label: "Ver mis pagos", icon: "💰" },
];

/**
 * Nivel 2: acciones secundarias colapsables en "Más opciones".
 * Un único CTA principal por viewport (CerebroBar).
 */
export default function QuickActionsGrid() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mx-auto w-full max-w-[390px] px-4 mt-6 sm:max-w-7xl" aria-label="Más opciones">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-xl border-2 border-yapo-blue/15 bg-yapo-white px-4 py-3 text-left text-sm font-medium text-yapo-petroleo transition-colors hover:border-yapo-blue/30 hover:bg-yapo-blue-light/10 focus:outline-none focus:ring-2 focus:ring-yapo-blue/20"
        aria-expanded={expanded}
        aria-controls="mas-opciones-content"
        id="mas-opciones-trigger"
      >
        <span>Más opciones</span>
        <span
          className={`inline-block transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        >
          ˅
        </span>
      </button>
      <div
        id="mas-opciones-content"
        role="region"
        aria-labelledby="mas-opciones-trigger"
        className={`overflow-hidden transition-all duration-200 ${expanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mt-2 flex flex-col gap-2 rounded-xl border-2 border-yapo-blue/10 bg-yapo-blue-light/5 p-3">
          {ITEMS_COLLAPSED.map(({ id, href, label, icon }) => (
            <Link
              key={id}
              href={href}
              className="nav-card-interactive flex items-center gap-3 rounded-xl border border-yapo-blue/10 bg-yapo-white px-4 py-3 text-sm font-medium text-yapo-petroleo transition-colors hover:border-yapo-blue/30 hover:bg-yapo-blue-light/10"
            >
              <span className="text-lg" aria-hidden>
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
