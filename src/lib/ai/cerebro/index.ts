/**
 * Cerebro: punto único de entrada con intent + contexto.
 * lib/ai/cerebro/ → types, decide, runCerebroWithIntent, processInputWithIntent.
 */

export type {
  CerebroIntent,
  CerebroIntentSource,
  CerebroContext,
  CerebroResult,
  CerebroRole,
  CerebroAction,
  CerebroActionType,
  CerebroSeverity,
  CerebroBaseIntentId,
} from "./types";
export {
  CEREBRO_BASE_INTENTS,
  CEREBRO_ACTION_TYPES,
  CEREBRO_SEVERITIES,
} from "./types";
export { decide } from "./decide";
export { runCerebroWithIntent } from "./runCerebro";
export { processInputWithIntent } from "./processInput";
export type { ProcessInputWithIntentParams } from "./processInput";
export { useCerebroNavigation } from "./useCerebroNavigation";
export * from "./intents.catalog";
