/**
 * Set MVP de chips de YAPÓ.
 * Cada chip dispara un intent estructurado; el Cerebro decide y ejecuta (buscar, navegar, accionar).
 * Máx 10 visibles; "Más opciones" abre bottom sheet con chips secundarios.
 */

import type { IntentId, IntentPayload } from "@/lib/ai/intents";

export interface ChipMvp {
  id: string;
  label: string;
  icon: string;
  intentId: IntentId;
  payload?: IntentPayload;
}

/** Chips principales MVP (máx 10 visibles). Orden fijo para UX consistente. */
export const MVP_CHIPS: ChipMvp[] = [
  {
    id: "chip-arreglos-cerca",
    label: "Arreglos cerca",
    icon: "🛠️",
    intentId: "search.services",
    payload: { query: "arreglos", near: true },
  },
  {
    id: "chip-electricista-ahora",
    label: "Electricista ahora",
    icon: "⚡",
    intentId: "search.services",
    payload: { query: "electricista", now: true },
  },
  {
    id: "chip-mecanico-cercano",
    label: "Mecánico cercano",
    icon: "🚗",
    intentId: "search.services",
    payload: { query: "mecánico", near: true },
  },
  {
    id: "chip-cuadrillas",
    label: "Cuadrillas disponibles",
    icon: "👷‍♂️",
    intentId: "search.workers",
    payload: { query: "cuadrillas" },
  },
  {
    id: "chip-top-rankeados",
    label: "Top rankeados",
    icon: "🏆",
    intentId: "search.workers",
    payload: { query: "top rankeados", sort: "rank" },
  },
  {
    id: "chip-subir-trabajo",
    label: "Subir trabajo",
    icon: "🎥",
    intentId: "action.post_performance",
    payload: { type: "video" },
  },
  {
    id: "chip-mensajes",
    label: "Mensajes",
    icon: "💬",
    intentId: "navigate.chat",
  },
  {
    id: "chip-mi-billetera",
    label: "Mi billetera",
    icon: "💼",
    intentId: "wallet_view",
  },
  {
    id: "chip-cerca-mio",
    label: "Cerca mío",
    icon: "📍",
    intentId: "search.services",
    payload: { query: "cerca mío", near: true },
  },
  {
    id: "chip-mas-opciones",
    label: "Más opciones",
    icon: "➕",
    intentId: "action.show_more_options",
  },
];

/** Chips secundarios (se muestran en el bottom sheet al tocar "Más opciones"). */
export const MVP_CHIPS_SECONDARY: ChipMvp[] = [
  {
    id: "sec-perfil",
    label: "Mi perfil",
    icon: "👤",
    intentId: "navigate.profile",
  },
  {
    id: "sec-inicio",
    label: "Inicio",
    icon: "🏠",
    intentId: "navigate.home",
  },
  {
    id: "sec-subsidios",
    label: "Subsidios",
    icon: "📋",
    intentId: "wallet_subsidy",
  },
  {
    id: "sec-territorio",
    label: "Territorio",
    icon: "🗺️",
    intentId: "navigate.territory",
  },
  {
    id: "sec-explicar",
    label: "¿Qué podés hacer?",
    icon: "❓",
    intentId: "info.explain_feature",
    payload: { feature: "cerebro" },
  },
];

/** Convierte un ChipMvp a intentId + payload para CerebroIntent. */
export function chipToIntentPayload(chip: ChipMvp): { intentId: IntentId; payload?: IntentPayload } {
  return { intentId: chip.intentId, payload: chip.payload };
}
