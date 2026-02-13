/**
 * Tipos para control territorial y semáforo.
 * Escudo Territorial: Verde = permitido, Amarillo = biometría, Rojo = bloqueo.
 * Sin mapas complejos; datos estructurados y extensibles.
 */

/** Estado del semáforo territorial: Verde = permitido, Amarillo = requiere biometría, Rojo = bloqueado. */
export type TerritorySemaphoreState = "green" | "yellow" | "red";

/** Etiquetas en español para UI y auditoría. */
export const SEMAPHORE_STATE_LABELS: Record<TerritorySemaphoreState, string> = {
  green: "Verde",
  yellow: "Amarillo",
  red: "Rojo",
};

/** Rojo → bloqueo total de operaciones en la zona. */
export function isSemaphoreBlocked(state: TerritorySemaphoreState): boolean {
  return state === "red";
}

/** Amarillo → operaciones permitidas solo con validación biométrica. */
export function isSemaphoreRequiresBiometric(state: TerritorySemaphoreState): boolean {
  return state === "yellow";
}

/** Verde → operaciones permitidas sin validación adicional. */
export function isSemaphoreAllowed(state: TerritorySemaphoreState): boolean {
  return state === "green";
}

/** Zona circular (lat, lng, radio en metros). */
export interface TerritoryZone {
  lat: number;
  lng: number;
  radiusMeters: number;
}

/** Territorio asignable: id, nombre, zona(s), estado actual del semáforo. */
export interface Territory {
  id: string;
  name: string;
  /** Zonas que definen el territorio (círculos). */
  zones: TerritoryZone[];
  /** Estado actual del semáforo (mock o integración futura). */
  semaphoreState: TerritorySemaphoreState;
  /** Descripción opcional para UI. */
  description?: string;
}

/** Resultado de consultar el semáforo para una ubicación. */
export interface TerritorySemaphoreResult {
  state: TerritorySemaphoreState;
  /** Territorio que contiene la ubicación (si aplica). */
  territoryId?: string;
  territoryName?: string;
  /** Mensaje para UI o CerebroResult. */
  reason?: string;
}
