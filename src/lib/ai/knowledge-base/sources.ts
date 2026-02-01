/**
 * Estructura de las fuentes de conocimiento del Cerebro (orden de búsqueda obligatorio).
 * a) Base de Conocimiento YAPÓ
 * b) Base de Respuestas Frecuentes
 * c) Historial de Aprendizaje Colectivo
 */

export type KnowledgeCategory =
  | "documentos"
  | "reglas"
  | "servicios"
  | "usuarios"
  | "pymes"
  | "mbareté"
  | "enterprises";

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  /** Palabras clave para búsqueda */
  keywords: string[];
  updatedAt: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  /** Etiquetas para reutilización */
  tema: string;
  tipoUsuario: string;
  contexto: string;
  /** Origen: "knowledge" | "gpt" | "learning" */
  source: string;
  createdAt: string;
  useCount: number;
}

export interface LearningEntry {
  id: string;
  query: string;
  /** Respuesta o acción que funcionó */
  resolution: string;
  /** Búsquedas similares que llevaron aquí */
  similarQueries: string[];
  createdAt: string;
}

export type SearchSourceType = "knowledge_base" | "faq" | "learning";

export interface SearchMatch {
  source: SearchSourceType;
  entryId: string;
  /** Fragmento o respuesta a mostrar */
  excerpt: string;
  /** Score o relevancia (0–1) */
  score: number;
}
