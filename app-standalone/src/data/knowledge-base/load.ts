/**
 * Cargador de la base de conocimiento YAPÓ (JSON).
 * El Cerebro usa esto para: responder preguntas, guiar a pantallas, sugerir acciones.
 * Los JSON pueden reemplazarse después por respuestas de OpenAI con el mismo schema.
 */

import type {
  KnowledgeEntry,
  KnowledgeSearchResult,
  PlatformEntry,
  RoleEntry,
  EscudoEntry,
  CategoryEntry,
  ActionEntry,
} from "./types";

import platformData from "./platform.json";
import rolesData from "./roles.json";
import escudosData from "./escudos.json";
import categoriesData from "./categories.json";
import actionsData from "./actions.json";

const platform = platformData as PlatformEntry;
const roles = rolesData as RoleEntry[];
const escudos = escudosData as EscudoEntry[];
const categories = categoriesData as CategoryEntry[];
const actionEntries = actionsData as ActionEntry[];

function entryToContent(entry: KnowledgeEntry): string {
  switch (entry.type) {
    case "platform":
      return `${entry.title}\n\n${entry.content}`;
    case "role":
      return `${entry.name}: ${entry.description}\n\nFunciones: ${entry.functions.join(". ")}`;
    case "escudo":
      return `${entry.name}: ${entry.description}`;
    case "category":
      return `${entry.name}: ${entry.description}\n\nSubcategorías: ${entry.subcategories.join(", ")}`;
    case "action":
      return entry.label;
    default:
      return "";
  }
}

function matchScore(query: string, keywords: string[], content: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const contentLower = content.toLowerCase();
  let score = 0;
  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (keywords.some((k) => k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))) {
      score += 0.4;
    }
    if (contentLower.includes(word)) {
      score += 0.3;
    }
  }
  return Math.min(1, score / Math.max(1, words.length));
}

function buildResult(
  entry: KnowledgeEntry,
  content: string,
  score: number
): KnowledgeSearchResult {
  const suggestedActions =
    "suggestedActions" in entry && Array.isArray(entry.suggestedActions)
      ? entry.suggestedActions
      : [];
  return {
    id: entry.id,
    type: entry.type,
    content,
    screen: entry.screen,
    suggestedActions,
    score,
  };
}

/** Búsqueda en toda la base: responde preguntas, devuelve pantalla y acciones sugeridas */
export function searchKnowledgeBase(query: string): KnowledgeSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: KnowledgeSearchResult[] = [];

  const platformContent = entryToContent(platform);
  const platformScore = matchScore(q, platform.keywords, platformContent);
  if (platformScore > 0) {
    results.push(buildResult(platform, platformContent, platformScore));
  }

  for (const entry of roles) {
    const content = entryToContent(entry);
    const score = matchScore(q, entry.keywords, content);
    if (score > 0) results.push(buildResult(entry, content, score));
  }

  for (const entry of escudos) {
    const content = entryToContent(entry);
    const score = matchScore(q, entry.keywords, content);
    if (score > 0) results.push(buildResult(entry, content, score));
  }

  for (const entry of categories) {
    const content = entryToContent(entry);
    const score = matchScore(q, entry.keywords, content);
    if (score > 0) results.push(buildResult(entry, content, score));
  }

  for (const entry of actions) {
    const score = matchScore(q, entry.context, entry.label);
    if (score > 0) {
      results.push(buildResult(entry, entry.label, score));
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

/** Obtener pantalla recomendada según la consulta (para guiar al usuario) */
export function getScreenForQuery(query: string): string | undefined {
  const results = searchKnowledgeBase(query);
  const best = results.find((r) => r.screen);
  return best?.screen;
}

/** Obtener acciones sugeridas según contexto */
export function getSuggestedActionsForQuery(query: string): string[] {
  const results = searchKnowledgeBase(query);
  const actions: string[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    for (const a of r.suggestedActions) {
      if (!seen.has(a)) {
        seen.add(a);
        actions.push(a);
      }
    }
  }
  return actions.slice(0, 6);
}

export { platform, roles, escudos, categories, actionEntries as actions };
export type { KnowledgeEntry, KnowledgeSearchResult } from "./types";
