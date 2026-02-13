/**
 * Datos mock de territorios y semáforos.
 * Estructurados para extensión; sin mapas complejos.
 */

import type { Territory, TerritorySemaphoreState } from "./types";

/** Territorios mock: centro Asunción y alrededores. Estructurados para extensión. */
export const MOCK_TERRITORIES: Territory[] = [
  {
    id: "territory-asu",
    name: "Asunción",
    description: "Zona central Asunción",
    zones: [{ lat: -25.2637, lng: -57.5759, radiusMeters: 15_000 }],
    semaphoreState: "green",
  },
  {
    id: "territory-lambare",
    name: "Lambaré",
    description: "Zona Lambaré",
    zones: [{ lat: -25.3462, lng: -57.6069, radiusMeters: 8_000 }],
    semaphoreState: "yellow",
  },
  {
    id: "territory-fraude",
    name: "Zona restringida",
    description: "Zona de alto riesgo (mock)",
    zones: [{ lat: -25.3, lng: -57.65, radiusMeters: 5_000 }],
    semaphoreState: "red",
  },
];

/** Devuelve territorios mock (solo lectura). */
export function getMockTerritories(): readonly Territory[] {
  return MOCK_TERRITORIES;
}

/** Actualiza estado del semáforo de un territorio (mock en memoria; para pruebas). */
let mockSemaphoreOverrides: Record<string, TerritorySemaphoreState> = {};

export function setMockSemaphoreState(
  territoryId: string,
  state: TerritorySemaphoreState
): void {
  mockSemaphoreOverrides[territoryId] = state;
}

export function getMockSemaphoreOverride(
  territoryId: string
): TerritorySemaphoreState | undefined {
  return mockSemaphoreOverrides[territoryId];
}

export function clearMockSemaphoreOverrides(): void {
  mockSemaphoreOverrides = {};
}
