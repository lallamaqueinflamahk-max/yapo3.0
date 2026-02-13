/**
 * Módulo de control territorial y semáforo (Escudo Territorial).
 * Verde = permitido | Amarillo = biometría | Rojo = bloqueo.
 * Integrado con wallet.guard; datos mock estructurados; extensible.
 */

export type {
  TerritorySemaphoreState,
  TerritoryZone,
  Territory,
  TerritorySemaphoreResult,
} from "./types";
export {
  SEMAPHORE_STATE_LABELS,
  isSemaphoreBlocked,
  isSemaphoreRequiresBiometric,
  isSemaphoreAllowed,
} from "./types";
export {
  getMockTerritories,
  MOCK_TERRITORIES,
  setMockSemaphoreState,
  clearMockSemaphoreOverrides,
} from "./mock";
export { getTerritorySemaphore, getSemaphoreStateByTerritoryId } from "./semaphore";
