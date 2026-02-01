/**
 * Base de Respuestas Frecuentes (generadas por interacciones previas).
 * Toda respuesta nueva con GPT debe guardarse aquí y etiquetarse.
 */

import type { FAQEntry } from "./sources";

/** Etiquetas para persistencia (regla 4: tema, tipoUsuario, contexto) */
export interface FAQTag {
  tema: string;
  tipoUsuario: string;
  contexto: string;
}

/** Placeholder: en producción sería DB o store */
const faqStore: FAQEntry[] = [];

export function addFAQ(
  question: string,
  answer: string,
  tag: FAQTag,
  source: "gpt" | "knowledge" | "learning" = "gpt"
): FAQEntry {
  const entry: FAQEntry = {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    question,
    answer,
    tema: tag.tema,
    tipoUsuario: tag.tipoUsuario,
    contexto: tag.contexto,
    source,
    createdAt: new Date().toISOString(),
    useCount: 0,
  };
  faqStore.push(entry);
  return entry;
}

export function searchFAQ(query: string): FAQEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return faqStore.filter(
    (e) =>
      e.question.toLowerCase().includes(q) ||
      e.answer.toLowerCase().includes(q) ||
      e.tema.toLowerCase().includes(q) ||
      e.contexto.toLowerCase().includes(q)
  );
}

export function getFAQStore(): readonly FAQEntry[] {
  return faqStore;
}
