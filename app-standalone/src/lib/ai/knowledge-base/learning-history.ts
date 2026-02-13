/**
 * Historial de Aprendizaje Colectivo (búsquedas similares).
 * Alimenta el Cerebro para respuestas reutilizables (regla 4c).
 */

import type { LearningEntry } from "./sources";

/** Placeholder: en producción sería DB o store */
const learningStore: LearningEntry[] = [];

export function addLearning(
  query: string,
  resolution: string,
  similarQueries: string[] = []
): LearningEntry {
  const entry: LearningEntry = {
    id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    query: query.trim(),
    resolution,
    similarQueries,
    createdAt: new Date().toISOString(),
  };
  learningStore.push(entry);
  return entry;
}

export function searchLearning(query: string): LearningEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return learningStore.filter(
    (e) =>
      e.query.toLowerCase().includes(q) ||
      e.resolution.toLowerCase().includes(q) ||
      e.similarQueries.some((sq) => sq.toLowerCase().includes(q))
  );
}

export function getLearningStore(): readonly LearningEntry[] {
  return learningStore;
}
