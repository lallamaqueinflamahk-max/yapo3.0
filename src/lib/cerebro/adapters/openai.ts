/**
 * Adapter OpenAI para el Cerebro.
 * Arquitectura preparada; no conectado aún.
 * Uso futuro: completions/chat para interpretar query y enriquecer respuesta.
 */

import type { BarScreenContext, BarResult } from "../barEngine";

export interface OpenAICerebroConfig {
  /** API key (no usar en cliente; solo server-side). */
  apiKey?: string;
  /** Modelo (ej. gpt-4o-mini). */
  model?: string;
  /** Idioma por defecto. */
  lang?: string;
}

export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Entrada para enriquecer la respuesta con OpenAI (futuro).
 */
export interface OpenAIEnrichInput {
  query: string;
  screenContext: BarScreenContext;
  /** Decisión ya obtenida del Cerebro (para no duplicar lógica). */
  barResult: BarResult;
}

/**
 * Salida opcional de OpenAI (futuro: texto enriquecido, sugerencias NL).
 */
export interface OpenAIEnrichOutput {
  /** Respuesta en lenguaje natural mejorada. */
  responseText?: string;
  /** Sugerencias adicionales (frases). */
  suggestions?: string[];
}

/**
 * Adapter OpenAI: no conectado. Lanzará si se llama.
 */
export interface IOpenAICerebroAdapter {
  /** Enriquecer respuesta del Cerebro con NL (futuro). */
  enrich(input: OpenAIEnrichInput): Promise<OpenAIEnrichOutput>;
}

const NOT_CONNECTED = "OpenAI adapter no conectado. Configurar y conectar antes de usar.";

/**
 * Stub: lanza al llamar. Conectar cuando se tenga API key y se quiera usar.
 */
export function createOpenAICerebroAdapter(_config?: OpenAICerebroConfig): IOpenAICerebroAdapter {
  return {
    async enrich(_input: OpenAIEnrichInput): Promise<OpenAIEnrichOutput> {
      throw new Error(NOT_CONNECTED);
    },
  };
}
