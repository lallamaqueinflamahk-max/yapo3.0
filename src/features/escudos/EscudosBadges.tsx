"use client";

/**
 * Lista de badges de escudos (Insurtech, Fintech, Regalos, Comunidad).
 * Filtrados por rol y zona; activables; UI tipo badge.
 */

import { useMemo } from "react";
import { useSession } from "@/lib/auth";
import { getTerritorySemaphore } from "@/lib/territory";
import { getEscudosForRoleAndZone } from "./getEscudosForRoleAndZone";
import type { EscudoId, ZoneState } from "./types";
import type { CerebroRole } from "@/lib/ai/cerebro";
import EscudoBadge from "./EscudoBadge";

export interface EscudosBadgesProps {
  /** Escudos activos (IDs). Si no se pasa, se usa estado local o vacío. */
  activeEscudoIds?: EscudoId[];
  /** Zona actual (green/yellow/red). Si no se pasa, se resuelve por ubicación mock o default green. */
  zoneState?: ZoneState;
  /** Callback al hacer click en un badge (activar/desactivar o navegar). */
  onEscudoClick?: (escudoId: EscudoId) => void;
  /** Tamaño de cada badge. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badges de escudos disponibles para el rol y zona actuales.
 * Mobile-first; cada badge es un botón que puede activar el escudo o navegar.
 */
export default function EscudosBadges({
  activeEscudoIds = [],
  zoneState: zoneStateProp,
  onEscudoClick,
  size = "md",
  className = "",
}: EscudosBadgesProps) {
  const { identity } = useSession();
  const role = (identity?.roles?.[0] ?? "vale") as CerebroRole;

  const zoneState: ZoneState = useMemo(() => {
    if (zoneStateProp) return zoneStateProp;
    const location = typeof window !== "undefined" ? { lat: -25.2637, lng: -57.5759 } : null;
    if (!location) return "green";
    const result = getTerritorySemaphore(location);
    return result.state;
  }, [zoneStateProp]);

  const { available, activeIds } = useMemo(
    () => getEscudosForRoleAndZone(role, zoneState, activeEscudoIds),
    [role, zoneState, activeEscudoIds]
  );

  if (available.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white/80 p-4 ${className}`}
      aria-label="Escudos"
    >
      <h2 className="mb-3 text-sm font-semibold text-yapo-blue">Escudos</h2>
      <ul className="flex flex-wrap gap-2">
        {available.map((escudo) => (
          <li key={escudo.id}>
            <EscudoBadge
              escudoId={escudo.id}
              active={activeIds.includes(escudo.id)}
              onClick={onEscudoClick}
              size={size}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
