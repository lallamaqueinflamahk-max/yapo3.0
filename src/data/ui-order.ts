/**
 * Orden de visualización y de comandos/respuestas según especificación.
 * Una sola fuente de verdad: Home y Cerebro siguen este orden.
 */

/** Orden de secciones en Home (de arriba a abajo). */
export const HOME_SECTION_ORDER = [
  "hero",
  "chips_cerebro",
  "chips_rol",
  "categorias_escudos",
  "top_profesionales",
  "comunidad",
  "funciones_disponibles",
  "accesos_rapidos",
  "semaforo",
  "cta_billetera",
] as const;

/** Orden de chips en la barra del Cerebro (CerebroBar): comando → respuesta/interacción. */
export const CEREBRO_BAR_CHIPS_ORDER: readonly { id: string; label: string; intentId: string }[] = [
  { id: "chip-wallet", label: "Mi billetera", intentId: "wallet_view" },
  { id: "chip-transfer", label: "Transferir", intentId: "wallet_transfer" },
  { id: "chip-subsidios", label: "Subsidios", intentId: "wallet_subsidy" },
  { id: "chip-escudo", label: "Activar escudo", intentId: "escudo_activate" },
  { id: "chip-chat", label: "Mensajes", intentId: "navigate.chat" },
  { id: "chip-perfil", label: "Mi perfil", intentId: "navigate.profile" },
  { id: "chip-inicio", label: "Inicio", intentId: "navigate.home" },
  { id: "chip-territorio", label: "Territorio", intentId: "navigate.territory" },
];

/** Orden de los 4 escudos en toda la UI: Insurtech, Fintech, Regalos, Comunidad. */
export const ESCUDOS_DISPLAY_ORDER = ["insurtech", "fintech", "regalos", "comunidad"] as const;

/** Orden de categorías (chips dinámicos): oficios, movilidad, cuidados, profesional, escudos. */
export const CATEGORIAS_ORDER = ["oficios", "movilidad", "cuidados", "profesional", "escudos"] as const;
