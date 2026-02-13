"use client";

import { useMemo } from "react";
import {
  getTerritorySemaphore,
  getMockTerritories,
  getSemaphoreStateByTerritoryId,
  SEMAPHORE_STATE_LABELS,
} from "@/lib/territory";
import type { RoleId } from "@/lib/auth";
import type { TerritorySemaphoreState } from "@/lib/territory";

/** Visible solo para Capeto, Kavaju, Mbareté. Valé = solo lectura. */
const ROLES_VISIBLE: RoleId[] = ["capeto", "kavaju", "mbarete", "vale"];

const DESCRIPTIONS: Record<TerritorySemaphoreState, string> = {
  green: "Operaciones permitidas",
  yellow: "Requiere biometría",
  red: "Operaciones bloqueadas",
};

const STYLES: Record<
  TerritorySemaphoreState,
  { dot: string; card: string; label: string }
> = {
  green: {
    dot: "bg-emerald-500",
    card: "bg-emerald-50 border-emerald-200",
    label: "text-emerald-800",
  },
  yellow: {
    dot: "bg-amber-500",
    card: "bg-amber-50 border-amber-200",
    label: "text-amber-800",
  },
  red: {
    dot: "bg-yapo-red",
    card: "bg-yapo-red/5 border-yapo-red/30",
    label: "text-yapo-red-dark",
  },
};

export interface TerritorySemaphoreProps {
  /** Ubicación actual. Si no se pasa, se puede mostrar lista de territorios con showAllTerritories. */
  location?: { lat: number; lng: number } | null;
  /** Rol: Capeto/Kavaju/Mbareté ven el semáforo; Valé solo lectura. */
  role: RoleId;
  /** Si true, mostrar lista de territorios (útil sin GPS). */
  showAllTerritories?: boolean;
  className?: string;
}

/**
 * Semáforo territorial tipo app.
 * Visible para Capeto, Kavaju, Mbareté. Solo lectura para Valé.
 * UI clara, sin ruido: estado principal + etiqueta + descripción breve.
 */
export default function TerritorySemaphore({
  location,
  role,
  showAllTerritories = false,
  className = "",
}: TerritorySemaphoreProps) {
  const canSee = ROLES_VISIBLE.includes(role);
  const isReadOnly = role === "vale";

  const current = useMemo(() => {
    if (!location) return null;
    return getTerritorySemaphore(location);
  }, [location?.lat, location?.lng]);

  const list = useMemo(() => {
    if (!showAllTerritories) return null;
    return getMockTerritories().map((t) => ({
      ...t,
      state: getSemaphoreStateByTerritoryId(t.id) ?? t.semaphoreState,
    }));
  }, [showAllTerritories]);

  if (!canSee) return null;

  return (
    <section
      className={`rounded-2xl border border-yapo-blue/10 bg-yapo-white p-5 shadow-sm ${className}`}
      aria-label="Semáforo territorial"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-yapo-blue">
          Semáforo territorial
        </h2>
        {isReadOnly && (
          <span
            className="shrink-0 rounded-full bg-foreground/10 px-2.5 py-1 text-xs font-medium text-foreground/70"
            aria-label="Solo lectura"
          >
            Solo lectura
          </span>
        )}
      </div>

      {location && current && (
        <div
          className={`mt-4 flex items-center gap-4 rounded-xl border p-4 ${STYLES[current.state].card}`}
        >
          <span
            className={`h-12 w-12 shrink-0 rounded-full ${STYLES[current.state].dot}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className={`font-semibold ${STYLES[current.state].label}`}>
              {SEMAPHORE_STATE_LABELS[current.state]}
            </p>
            <p className="mt-0.5 text-sm text-foreground/70">
              {DESCRIPTIONS[current.state]}
              {current.territoryName && ` · ${current.territoryName}`}
            </p>
          </div>
        </div>
      )}

      {showAllTerritories && list && list.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-foreground/60">Territorios</p>
          <ul className="mt-2 space-y-2">
            {list.map((t) => (
              <li
                key={t.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${STYLES[t.state].card}`}
              >
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${STYLES[t.state].dot}`}
                  aria-hidden
                />
                <span className={`flex-1 text-sm font-medium ${STYLES[t.state].label}`}>
                  {t.name}
                </span>
                <span className="text-xs text-foreground/60">
                  {SEMAPHORE_STATE_LABELS[t.state]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!location && !showAllTerritories && (
        <p className="mt-4 text-sm text-foreground/60">
          Activá GPS para ver el estado en tu zona.
        </p>
      )}
    </section>
  );
}
