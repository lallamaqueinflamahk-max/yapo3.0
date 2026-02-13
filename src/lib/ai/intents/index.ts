/**
 * Modelo de intents del Cerebro.
 * El Cerebro entiende QUÉ se quiere hacer (intent) antes de decidir CÓMO (result).
 * Sin UI; deterministico; extensible; preparado para NLP.
 */

export type {
  IntentId,
  IntentCategory,
  IntentPayload,
  ResultAction,
  IntentDefinition,
  CerebroIntent,
  DecideUser,
  DecideContext,
  CerebroResult,
  SuggestedAction,
} from "./types";

export {
  INTENT_CATALOG,
  INTENT_IDS,
  getIntentDefinition,
  isValidIntentId,
} from "./catalog";

export { decide, getIntentsForRoles } from "./decide";
export { toDecideContext } from "./contextAdapter";
