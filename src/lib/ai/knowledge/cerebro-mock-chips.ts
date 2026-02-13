/**
 * Chips de intents desde base de conocimiento mock (Cerebro + Wallet + Escudos).
 * Usado por CerebroBar y ChipBubble para emitir intents reales (mock).
 */

import type { IntentId } from "@/lib/ai/intents";

export interface MockIntentChip {
  id: string;
  label: string;
  icon: string;
  intentId: IntentId;
  payload?: Record<string, unknown>;
}

/** Chips que emiten intents: wallet (ver balance, transferir mock, subsidios), navegación, territorio. */
export const MOCK_INTENT_CHIPS: MockIntentChip[] = [
  { id: "chip-wallet", label: "Mi billetera", icon: "💼", intentId: "wallet_view" },
  {
    id: "chip-transfer",
    label: "Transferir",
    icon: "📤",
    intentId: "wallet_transfer",
    payload: { toUserId: "user-2", amount: 5000 },
  },
  { id: "chip-subsidios", label: "Subsidios", icon: "📋", intentId: "wallet_subsidy" },
  { id: "chip-escudo", label: "Activar escudo", icon: "🛡️", intentId: "escudo_activate" },
  { id: "chip-chat", label: "Mensajes", icon: "💬", intentId: "navigate.chat" },
  { id: "chip-perfil", label: "Mi perfil", icon: "👤", intentId: "navigate.profile" },
  { id: "chip-inicio", label: "Inicio", icon: "🏠", intentId: "navigate.home" },
  { id: "chip-territorio", label: "Territorio", icon: "🗺️", intentId: "navigate.territory" },
];
