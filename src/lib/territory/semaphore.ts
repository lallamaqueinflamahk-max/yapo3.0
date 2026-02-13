/**
 * Semáforo territorial: resuelve estado (Verde / Amarillo / Rojo) para una ubicación.
 * Integrado con wallet.guard (Escudo Territorial):
 * - Verde: permitido.
 * - Amarillo: requiere biometría (requiresValidation + requiresBiometricLevel).
 * - Rojo: bloqueo (allowed: false).
 */

import type { TerritorySemaphoreResult, TerritorySemaphoreState } from "./types";
import { MOCK_TERRITORIES, getMockSemaphoreOverride } from "./mock";

const REASON_RED = "Operaciones bloqueadas en esta zona (semáforo rojo).";
const REASON_YELLOW = "Zona en validación: se requiere confirmación biométrica para operar.";
const REASON_GREEN_DEFAULT = "Fuera de zonas definidas; permitido.";
const REASON_NO_LOCATION = "Sin ubicación; se asume permitido.";

function haversineMeters(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number }
): number {
  const R = 6371e3;
  const φ1 = (point.lat * Math.PI) / 180;
  const φ2 = (center.lat * Math.PI) / 180;
  const Δφ = ((center.lat - point.lat) * Math.PI) / 180;
  const Δλ = ((center.lng - point.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isInZone(
  point: { lat: number; lng: number },
  zone: { lat: number; lng: number; radiusMeters: number }
): boolean {
  return haversineMeters(point, { lat: zone.lat, lng: zone.lng }) <= zone.radiusMeters;
}

/**
 * Resuelve el estado del semáforo territorial para una ubicación.
 * Si la ubicación cae en un territorio mock, devuelve su semaphoreState.
 * Si no cae en ninguno, devuelve green (permitido por defecto).
 */
export function getTerritorySemaphore(location: {
  lat: number;
  lng: number;
}): TerritorySemaphoreResult {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
    return { state: "green", reason: REASON_NO_LOCATION };
  }

  for (const t of MOCK_TERRITORIES) {
    const inTerritory = t.zones.some((z) => isInZone(location, z));
    if (inTerritory) {
      const state: TerritorySemaphoreState =
        getMockSemaphoreOverride(t.id) ?? t.semaphoreState;
      return {
        state,
        territoryId: t.id,
        territoryName: t.name,
        reason:
          state === "red"
            ? REASON_RED
            : state === "yellow"
              ? REASON_YELLOW
              : undefined,
      };
    }
  }

  return { state: "green", reason: REASON_GREEN_DEFAULT };
}

/**
 * Devuelve el estado del semáforo para un territorio por id (sin ubicación).
 * Útil para UI de solo lectura (Valé, Capeto, Kavaju, Mbareté).
 */
export function getSemaphoreStateByTerritoryId(
  territoryId: string
): TerritorySemaphoreState | null {
  const override = getMockSemaphoreOverride(territoryId);
  if (override) return override;
  const t = MOCK_TERRITORIES.find((x) => x.id === territoryId);
  return t ? t.semaphoreState : null;
}
