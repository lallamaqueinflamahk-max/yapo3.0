"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import {
  TOP_PROFESSIONALS_BY_CATEGORY,
  CATEGORY_AREA_LABELS,
  CATEGORY_AREA_ORDER,
  type CategoryArea,
  type TopProfessionalEntry,
} from "@/data/top-professionals-mock";

const CATEGORY_ICONS: Record<CategoryArea, string> = {
  oficios: "🛠️",
  movilidad: "🚗",
  cuidados: "❤️",
  profesional: "💼",
};

/** Estrellas visibles por profesional (individual). */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-yapo-amber-dark" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: full }, (_, i) => <span key={`f-${i}`} className="text-lg" aria-hidden>★</span>)}
      {half ? <span className="text-lg text-yapo-amber-dark/70" aria-hidden>★</span> : null}
      {Array.from({ length: empty }, (_, i) => <span key={`e-${i}`} className="text-lg text-yapo-amber-dark/30" aria-hidden>★</span>)}
    </span>
  );
}

/** Agrupar por oficio (role) y contar — para chips clicables "Electricista (3)" */
function groupByRole(list: TopProfessionalEntry[]): { role: string; count: number; entries: TopProfessionalEntry[] }[] {
  const byRole = new Map<string, TopProfessionalEntry[]>();
  for (const e of list) {
    const arr = byRole.get(e.role) ?? [];
    arr.push(e);
    byRole.set(e.role, arr);
  }
  return Array.from(byRole.entries()).map(([role, entries]) => ({ role, count: entries.length, entries }));
}

/** Ordenar por proximidad */
function sortByProximity(list: TopProfessionalEntry[]): TopProfessionalEntry[] {
  return [...list].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
}

const SORTED: Record<CategoryArea, TopProfessionalEntry[]> = Object.fromEntries(
  CATEGORY_AREA_ORDER.map((cat) => [cat, sortByProximity(TOP_PROFESSIONALS_BY_CATEGORY[cat])])
) as Record<CategoryArea, TopProfessionalEntry[]>;

export default function TopProfessionalsByCategory() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryArea | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const list = selectedCategory ? SORTED[selectedCategory] : [];
  const roleGroups = useMemo(() => groupByRole(list), [list]);
  const filtered = useMemo(() => {
    if (!selectedRole) return list;
    return list.filter((e) => e.role === selectedRole);
  }, [list, selectedRole]);

  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Profesionales por área: oficios, movilidad, cuidados, profesional"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-yapo-blue">
        Profesionales por área
      </h2>

      {/* 1. Cuatro tarjetas visuales de categoría — clicables para entrar */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_AREA_ORDER.map((cat) => {
          const count = TOP_PROFESSIONALS_BY_CATEGORY[cat].length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(isSelected ? null : cat);
                setSelectedRole(null);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-150 ${
                isSelected
                  ? "border-yapo-blue bg-yapo-blue-light/30 shadow-md"
                  : "border-yapo-blue/20 bg-yapo-white hover:border-yapo-blue/40 hover:bg-yapo-blue-light/15"
              }`}
            >
              <span className="text-3xl" aria-hidden>{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-bold text-yapo-blue">{CATEGORY_AREA_LABELS[cat]}</span>
              <span className="text-xs font-medium text-yapo-blue/70">{count} profesionales</span>
            </button>
          );
        })}
      </div>

      {/* 2. Si hay categoría elegida: oficios con cantidad (chips) y grid de profesionales */}
      {selectedCategory && (
        <>
          {/* Chips por oficio — tappable para filtrar y ver quiénes son */}
          <div>
            <p className="mb-2 text-xs font-medium text-yapo-blue/70">Filtrar por oficio</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedRole === null
                    ? "bg-yapo-blue text-white"
                    : "bg-yapo-blue-light/30 text-yapo-blue"
                }`}
              >
                Todos ({list.length})
              </button>
              {roleGroups.map(({ role, count }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? "bg-yapo-blue text-white"
                      : "bg-yapo-blue-light/30 text-yapo-blue"
                  }`}
                >
                  {role} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Grid visual de profesionales: avatar, nombre, oficio, estrellas, distancia, Ver perfil */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((pro) => (
              <TopProfessionalCard key={pro.id} entry={pro} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="mt-2 text-sm font-medium text-yapo-blue underline"
          >
            ← Cerrar y elegir otra área
          </button>
        </>
      )}
    </section>
  );
}

/** Tarjeta visual: avatar, nombre, oficio, estrellas, distancia, un botón Ver perfil que lleva a la acción. */
function TopProfessionalCard({ entry }: { entry: TopProfessionalEntry }) {
  const profileHref = `/profesionales/${entry.id}`;

  return (
    <Link
      href={profileHref}
      className="flex flex-col items-center rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white p-4 shadow-sm transition-[transform,box-shadow] duration-100 hover:shadow-md active:scale-[0.98]"
    >
      <Avatar name={entry.name} size="md" className="h-14 w-14 shrink-0 border-2 border-yapo-blue/20" />
      <p className="mt-2 truncate w-full text-center text-sm font-bold text-yapo-blue">{entry.role}</p>
      <p className="truncate w-full text-center text-xs text-yapo-blue/70">{entry.name}</p>
      {entry.rating != null && (
        <div className="mt-1 flex items-center justify-center">
          <Stars rating={entry.rating} />
        </div>
      )}
      {entry.distanceKm != null && (
        <span className="mt-1 text-xs text-yapo-blue/70">A {entry.distanceKm} km</span>
      )}
      <span className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-xl bg-yapo-red px-4 py-2 text-sm font-bold text-white">
        Ver perfil
      </span>
    </Link>
  );
}
