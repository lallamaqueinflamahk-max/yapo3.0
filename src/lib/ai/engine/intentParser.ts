/**
 * Parser de intenciones: texto del usuario → intentId + confidence.
 * Coincidencia semántica simple (includes). Sin NLP externo. Sin OpenAI.
 */

/** Entrada del knowledge-base: id, triggers y opcionales action/response. */
export interface IntentEntry {
  id: string;
  triggers: string[];
  action?: string;
  response?: string;
}

/** Knowledge-base: lista de intents con sus triggers. */
export type KnowledgeBase = IntentEntry[];

/** Resultado del parseo: intentId, confidence y entrada coincidente (si hubo match). */
export interface ParseIntentResult {
  intentId: string | null;
  confidence: number;
  /** Entrada del knowledge-base que coincidió (para action/response). */
  entry?: IntentEntry;
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Parsea el texto del usuario contra el knowledge-base.
 * - Normaliza input (lowercase, trim, sin acentos).
 * - Compara contra cada trigger con includes().
 * - Devuelve intentId del primer match y confidence (1 si hay match, 0 si no).
 * Si varios intents coinciden, devuelve el primero cuyo trigger aparezca en el texto.
 */
export function parseIntent(
  input: string,
  knowledgeBase: KnowledgeBase
): ParseIntentResult {
  const normalizedInput = normalize(input);
  if (!normalizedInput) {
    return { intentId: null, confidence: 0 };
  }

  for (const entry of knowledgeBase) {
    for (const trigger of entry.triggers) {
      const normalizedTrigger = normalize(trigger);
      if (!normalizedTrigger) continue;
      if (normalizedInput.includes(normalizedTrigger)) {
        return {
          intentId: entry.id,
          confidence: 1,
          entry,
        };
      }
    }
  }

  return { intentId: null, confidence: 0 };
}
