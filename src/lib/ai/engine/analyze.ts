/**
 * Orquestación del Cerebro: búsqueda obligatoria + intent + respuesta.
 * Usa intentEngine, search, responseBuilder. Nunca "no sé".
 */

import { detectIntent } from "./intentEngine";
import { buildResponseFromIntent } from "./responseBuilder";
import { searchInOrder } from "./search";
import type { CerebroResult } from "./types";

/**
 * Analiza la consulta: búsqueda (conocimiento → FAQ → aprendizaje),
 * luego intención y construcción de respuesta.
 */
export function analyzeQuery(query: string): CerebroResult {
  const searchResult = searchInOrder(query);
  const { kind: intent, message: intentMessage } = detectIntent(query);
  return buildResponseFromIntent({
    intent,
    intentMessage,
    searchResult,
    query,
  });
}
