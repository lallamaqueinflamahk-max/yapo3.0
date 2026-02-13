/**
 * Fuente de conocimiento: patrones de intención y respuestas.
 * El motor (engine) usa esto para analizar la consulta.
 * NO es filtro: es conocimiento para el asistente.
 */

export type IntentKind =
  | "buscar_trabajo"
  | "ver_perfil"
  | "ir_billetera"
  | "ir_chat"
  | "ir_inicio"
  | "general";

export interface IntentPattern {
  kind: IntentKind;
  keywords: string[];
  /** Mensaje del asistente cuando se detecta esta intención */
  message: string;
}

export const INTENT_PATTERNS: IntentPattern[] = [
  {
    kind: "buscar_trabajo",
    keywords: ["trabajo", "empleo", "busco", "oferta", "vacante", "contratar", "necesito trabajo"],
    message: "Encontré opciones relacionadas con trabajo.",
  },
  {
    kind: "ver_perfil",
    keywords: ["perfil", "mi perfil", "cuenta", "yo", "mis datos"],
    message: "Tu perfil está en la sección Perfil.",
  },
  {
    kind: "ir_billetera",
    keywords: ["billetera", "wallet", "dinero", "pago", "cobrar", "saldo"],
    message: "Podés gestionar pagos en Billetera.",
  },
  {
    kind: "ir_chat",
    keywords: ["chat", "mensaje", "hablar", "contacto", "escribir"],
    message: "Abrí Chat para conversar.",
  },
  {
    kind: "ir_inicio",
    keywords: ["inicio", "home", "principal", "volver"],
    message: "Inicio es tu pantalla principal.",
  },
];

export const DEFAULT_SUGGESTIONS = [
  { id: "s1", text: "Trabajos cercanos", query: "trabajos cercanos" },
  { id: "s2", text: "Mi perfil", query: "mi perfil" },
  { id: "s3", text: "Billetera", query: "billetera" },
  { id: "s4", text: "Chat", query: "chat" },
];
