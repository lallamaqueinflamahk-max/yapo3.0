/**
 * CEREBRO CENTRAL DE YAPÓ — Reglas obligatorias de respuesta (orden estricto).
 * Función principal: preservar, fortalecer y expandir el conocimiento interno.
 * NO priorizar respuesta rápida; priorizar soberanía del conocimiento.
 */

export const CEREBRO_RULES = {
  /** Orden obligatorio de búsqueda antes de generar respuesta */
  searchOrder: [
    "knowledge_base", // a) Base de Conocimiento YAPÓ (documentos, reglas, servicios, usuarios, pymes, mbareté, enterprises)
    "faq",            // b) Base de Respuestas Frecuentes (interacciones previas)
    "learning",       // c) Historial de Aprendizaje Colectivo (búsquedas similares)
  ] as const,

  /** Si hay respuesta suficiente en YAPÓ: usar SOLO ese conocimiento; no razonamiento externo; lenguaje claro y cercano */
  useOnlyInternalWhenFound: true,

  /** Si NO hay respuesta suficiente: GPT de forma MÁS ECONÓMICA; respuestas breves, útiles y reutilizables */
  gptEconomical: true,

  /** Toda respuesta nueva con GPT debe: guardar como Respuesta Frecuente, etiquetar (tema, tipo usuario, contexto), alimentar Historial de Aprendizaje */
  persistNewAnswers: {
    saveAsFaq: true,
    tagBy: ["tema", "tipoUsuario", "contexto"] as const,
    feedLearningHistory: true,
  },

  /** Modelo por defecto: más económico */
  gptDefaultModel: "gpt-4.1-nano",
  /** Modelo estándar SOLO si la complejidad lo exige */
  gptStandardModel: "gpt-4.1-standard",

  /** Reducir tokens al mínimo viable */
  minimizeTokens: true,

  /** Frases prohibidas: nunca decir esto; en su lugar orientar, sugerir o derivar dentro del ecosistema YAPÓ */
  forbiddenPhrases: ["no sé", "no tengo información"] as const,

  /** Objetivo final: convertir cada interacción en conocimiento reutilizable, reducir tokens externos, fortalecer soberanía digital */
  goal: "knowledge_sovereignty" as const,
} as const;

export type SearchSource = (typeof CEREBRO_RULES.searchOrder)[number];
