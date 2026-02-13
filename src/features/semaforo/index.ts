/**
 * Feature Semáforo: Verde / Amarillo / Rojo.
 * Basado en uso, fraude y rol. Visible en UI. Afecta acciones permitidas.
 */

export type {
  SemaphoreState,
  SemaphoreFactors,
  SemaphoreResult,
} from "./types";
export {
  SEMAPHORE_STATE_LABELS,
  isSemaphoreBlocked,
  isSemaphoreRequiresValidation,
  isSemaphoreAllowed,
} from "./types";

export { getSemaphoreState } from "./compute";
export {
  isActionAllowedBySemaphore,
  getAllowedActionIdsBySemaphore,
} from "./allowedActions";

export { default as SemaphoreUI } from "./SemaphoreUI";
export { SemaphoreFromResult } from "./SemaphoreUI";
export type { SemaphoreUIProps, SemaphoreFromResultProps } from "./SemaphoreUI";

export { useSemaphore, getSemaphoreResult } from "./useSemaphore";
export type { UseSemaphoreInput, UseSemaphoreReturn } from "./useSemaphore";
