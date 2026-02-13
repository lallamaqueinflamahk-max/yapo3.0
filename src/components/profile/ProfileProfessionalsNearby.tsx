"use client";

import type { ProfessionalNearby } from "@/data/profile-mock";

interface ProfileProfessionalsNearbyProps {
  professionals: ProfessionalNearby[];
}

export default function ProfileProfessionalsNearby({ professionals }: ProfileProfessionalsNearbyProps) {
  if (professionals.length === 0) return null;

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Profesionales cerca">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Profesionales cerca de mí (GPS)
      </h2>
      <p className="mb-3 text-sm text-foreground/80">
        Personas de la red laboral cerca de tu ubicación.
      </p>
      <ul className="space-y-3">
        {professionals.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-yapo-blue/10 p-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yapo-blue/20 text-lg font-bold text-yapo-blue">
              {p.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-yapo-blue">{p.name}</p>
              <p className="text-sm text-foreground/80">{p.profession}</p>
              <p className="text-xs text-foreground/60">
                {p.role} · {p.distance} · ★ {p.rating}
                {p.verified && " · Verificado"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-yapo-blue/20 px-3 py-1.5 text-sm font-medium text-yapo-blue"
            >
              Contactar
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-foreground/60">
        La ubicación se usa solo para mostrar distancia aproximada. Activá GPS para ver más resultados.
      </p>
    </section>
  );
}
