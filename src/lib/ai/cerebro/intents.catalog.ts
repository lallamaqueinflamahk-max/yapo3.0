/**
 * Catálogo de intents del Cerebro (capa cerebro/).
 * Reexporta el catálogo de intents para uso en decide y runCerebro.
 */

export {
  INTENT_CATALOG,
  INTENT_IDS,
  getIntentDefinition,
  isValidIntentId,
} from "@/lib/ai/intents/catalog";

export type { IntentId, IntentDefinition } from "@/lib/ai/intents/types";
