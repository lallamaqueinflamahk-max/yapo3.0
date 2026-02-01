/**
 * Orden obligatorio de búsqueda del Cerebro (regla 1):
 * a) Base de Conocimiento YAPÓ (JSON en /data/knowledge-base)
 * b) Base de Respuestas Frecuentes
 * c) Historial de Aprendizaje Colectivo
 */

import { CEREBRO_RULES } from "./rules";
import {
  searchKnowledgeBase,
  getScreenForQuery,
  getSuggestedActionsForQuery,
} from "@/data/knowledge-base/load";
import { searchFAQ } from "@/lib/ai/knowledge-base/faq";
import { searchLearning } from "@/lib/ai/knowledge-base/learning-history";
import type { SearchMatch } from "@/lib/ai/knowledge-base/sources";

export interface CerebroSearchResult {
  /** Si se encontró respuesta suficiente en fuentes YAPÓ */
  sufficient: boolean;
  /** Primera fuente que aportó (knowledge_base | faq | learning) */
  source?: (typeof CEREBRO_RULES.searchOrder)[number];
  /** Respuesta o excerpt a mostrar */
  message?: string;
  /** Pantalla a la que guiar (desde base JSON) */
  screen?: string;
  /** Acciones sugeridas según contexto (desde base JSON) */
  suggestedActions?: string[];
  /** Detalles de coincidencias por fuente */
  matches: SearchMatch[];
}

/**
 * Busca en el orden obligatorio: conocimiento YAPÓ → FAQ → aprendizaje.
 * Devuelve si hay respuesta suficiente y el mensaje a usar (solo conocimiento interno).
 */
export function searchInOrder(query: string): CerebroSearchResult {
  const matches: SearchMatch[] = [];
  const q = query.trim().toLowerCase();
  if (!q) {
    return { sufficient: false, matches: [] };
  }

  // 1a) Base de Conocimiento YAPÓ (JSON: platform, roles, escudos, categorías, acciones)
  const kbResults = searchKnowledgeBase(query);
  if (kbResults.length > 0) {
    const best = kbResults[0];
    matches.push({
      source: "knowledge_base",
      entryId: best.id,
      excerpt: best.content,
      score: best.score,
    });
    return {
      sufficient: true,
      source: "knowledge_base",
      message: best.content,
      screen: best.screen ?? getScreenForQuery(query),
      suggestedActions: best.suggestedActions.length > 0
        ? best.suggestedActions
        : getSuggestedActionsForQuery(query),
      matches,
    };
  }

  // 1b) Base de Respuestas Frecuentes
  const faqResults = searchFAQ(query);
  if (faqResults.length > 0) {
    const best = faqResults[0];
    matches.push({
      source: "faq",
      entryId: best.id,
      excerpt: best.answer,
      score: 1,
    });
    return {
      sufficient: true,
      source: "faq",
      message: best.answer,
      matches,
    };
  }

  // 1c) Historial de Aprendizaje Colectivo
  const learningResults = searchLearning(query);
  if (learningResults.length > 0) {
    const best = learningResults[0];
    matches.push({
      source: "learning",
      entryId: best.id,
      excerpt: best.resolution,
      score: 0.9,
    });
    return {
      sufficient: true,
      source: "learning",
      message: best.resolution,
      matches,
    };
  }

  return { sufficient: false, matches };
}
