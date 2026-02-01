/**
 * Base de conocimiento YAPÓ (JSON).
 * El Cerebro responde preguntas, guía a pantallas y sugiere acciones.
 * Estructura reemplazable por OpenAI con el mismo schema.
 */

export {
  searchKnowledgeBase,
  getScreenForQuery,
  getSuggestedActionsForQuery,
  platform,
  roles,
  escudos,
  categories,
  actions,
} from "./load";
export type {
  KnowledgeEntry,
  KnowledgeSearchResult,
  PlatformEntry,
  RoleEntry,
  EscudoEntry,
  CategoryEntry,
  ActionEntry,
  BaseKnowledgeEntry,
  KnowledgeEntryType,
} from "./types";
