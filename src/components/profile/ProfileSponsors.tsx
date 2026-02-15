"use client";

import type { SponsorEntry } from "@/data/profile-mock";

interface ProfileSponsorsProps {
  sponsors: SponsorEntry[];
}

export default function ProfileSponsors({ sponsors }: ProfileSponsorsProps) {
  if (sponsors.length === 0) return null;

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Sponsors">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
        Sponsors y aliados
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sponsors.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-yapo-blue/10 p-3"
          >
            <p className="font-medium text-yapo-blue">{s.name}</p>
            <p className="mt-1 text-sm text-foreground/80">{s.description}</p>
            {s.link && (
              <a
                href={s.link}
                className="mt-2 inline-block text-sm font-medium text-yapo-red"
              >
                Ver más
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
