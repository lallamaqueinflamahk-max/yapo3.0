/**
 * Configuración GPT del Cerebro (reglas 5):
 * - GPT-4.1 nano por defecto
 * - GPT-4.1 estándar SOLO si la complejidad lo exige
 * - Reducir tokens al mínimo viable
 */

import { CEREBRO_RULES } from "./rules";

export const GPT_CONFIG = {
  defaultModel: CEREBRO_RULES.gptDefaultModel,
  standardModel: CEREBRO_RULES.gptStandardModel,
  minimizeTokens: CEREBRO_RULES.minimizeTokens,
  /** Umbral de complejidad para pasar a estándar (ej. longitud de query o número de intents) */
  complexityThreshold: { queryLength: 200, multiIntent: true },
} as const;

export type GPTModelTier = "nano" | "standard";

/**
 * Decide qué modelo usar según complejidad (económico por defecto).
 */
export function getModelForQuery(query: string, _options?: { multiIntent?: boolean }): GPTModelTier {
  if (query.length > GPT_CONFIG.complexityThreshold.queryLength) {
    return "standard";
  }
  return "nano";
}
