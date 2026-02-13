/**
 * Base de Conocimiento YAPÓ (documentos, reglas, servicios, usuarios, pymes, mbareté, enterprises).
 * Primera fuente de búsqueda obligatoria (regla 1a).
 */

import type { KnowledgeEntry } from "./sources";

/** Conocimiento interno YAPÓ — lenguaje claro y cercano */
export const YAPO_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "kb-1",
    category: "reglas",
    title: "Qué es YAPÓ",
    content:
      "YAPÓ es la Super App paraguaya de identidad, reputación y confianza. Organiza el ecosistema laboral y conecta trabajadores con oportunidades.",
    keywords: ["yapó", "qué es", "super app", "paraguay", "trabajo", "reputación"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kb-2",
    category: "reglas",
    title: "Tipos de usuario",
    content:
      "Vale (básico), Capeto (lidera cuadrilla), Kavaju (supervisa zona), Mbareté (control territorial). Cada nivel tiene funciones y privilegios definidos.",
    keywords: ["vale", "capeto", "kavaju", "mbareté", "usuario", "nivel", "rango"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kb-3",
    category: "servicios",
    title: "Billetera",
    content:
      "En Billetera podés gestionar pagos, ver saldo y cobrar. Accedé desde la barra inferior.",
    keywords: ["billetera", "pago", "cobrar", "saldo", "dinero"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kb-4",
    category: "servicios",
    title: "Trabajos e inicio",
    content:
      "En Inicio ves trabajos cercanos y ofertas. Usá tu ubicación para ver oportunidades cerca tuyo.",
    keywords: ["trabajo", "inicio", "home", "ofertas", "cercanos", "empleo"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kb-5",
    category: "documentos",
    title: "Cerebro",
    content:
      "El Cerebro es tu asistente. Escribí qué necesitás y te guía con sugerencias, acciones y rutas dentro de YAPÓ.",
    keywords: ["cerebro", "asistente", "buscar", "ayuda", "guía"],
    updatedAt: new Date().toISOString(),
  },
];

export function searchKnowledgeBase(query: string): KnowledgeEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return YAPO_KNOWLEDGE.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))
  );
}
