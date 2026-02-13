/**
 * Tipos de la base de conocimiento YAPÓ (JSON).
 * Estructura pensada para: responder preguntas, guiar a pantallas, sugerir acciones.
 * Fácilmente reemplazable por respuestas OpenAI con el mismo schema.
 */

export type KnowledgeEntryType = "platform" | "role" | "escudo" | "category" | "action";

export interface BaseKnowledgeEntry {
  id: string;
  type: KnowledgeEntryType;
  keywords: string[];
  screen?: string;
  suggestedActions?: string[];
}

export interface PlatformEntry extends BaseKnowledgeEntry {
  type: "platform";
  title: string;
  content: string;
}

export interface RoleEntry extends BaseKnowledgeEntry {
  type: "role";
  name: string;
  description: string;
  functions: string[];
}

export interface EscudoEntry extends BaseKnowledgeEntry {
  type: "escudo";
  name: string;
  description: string;
}

export interface CategoryEntry extends BaseKnowledgeEntry {
  type: "category";
  name: string;
  description: string;
  subcategories: string[];
}

export interface ActionEntry extends BaseKnowledgeEntry {
  type: "action";
  label: string;
  context: string[];
  roleRequired: string[];
}

export type KnowledgeEntry =
  | PlatformEntry
  | RoleEntry
  | EscudoEntry
  | CategoryEntry
  | ActionEntry;

/** Resultado unificado para el Cerebro: respuesta + pantalla + acciones sugeridas */
export interface KnowledgeSearchResult {
  id: string;
  type: KnowledgeEntryType;
  /** Texto para responder la pregunta */
  content: string;
  /** Pantalla a la que guiar al usuario */
  screen?: string;
  /** Acciones a sugerir según contexto */
  suggestedActions: string[];
  /** Relevancia (0-1) para ordenar */
  score: number;
}
