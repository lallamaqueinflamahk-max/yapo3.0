/**
 * Datos de chips: intención, contextuales (rol/hora), conversacionales.
 * Cada chip tiene un CerebroIntent; no son filtros pasivos.
 */

import type { CerebroIntent } from "./engine/cerebroIntent";
import type { RoleId } from "@/lib/auth";
import { getDefaultSuggestions } from "./knowledge";

const MAX_VISIBLE = 8;

export interface ChipItem {
  id: string;
  label: string;
  intent: CerebroIntent;
  /** Nombre del ícono (wallet, chat, profile, home, search, etc.). */
  icon: string;
  /** Variante de color: red | blue | white (Paraguay). */
  variant?: "red" | "blue" | "white";
}

/** Chips de intención (desde knowledge: defaultSuggestions + routes). */
export function getIntentChips(): ChipItem[] {
  const suggestions = getDefaultSuggestions();
  const items: ChipItem[] = suggestions.map((s, i) => {
    const screen = mapQueryToPath(s.query ?? s.text);
    return {
      id: `intent-${s.id}-${i}`,
      label: s.text,
      intent: {
        type: screen ? "navigate" : "search",
        query: s.query ?? s.text,
        screen: screen ?? undefined,
        label: s.text,
        source: "intent",
      },
      icon: mapLabelToIcon(s.text),
      variant: "blue",
    };
  });
  return items;
}

/** Chips contextuales según rol y hora. */
export function getContextualChips(roles: RoleId[]): ChipItem[] {
  const role = roles[0] ?? "vale";
  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const isMorning = hour >= 6 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 19;

  const items: ChipItem[] = [];

  if (role === "vale" || role === "capeto") {
    items.push({
      id: "ctx-trabajos",
      label: isMorning ? "Ofertas de hoy" : isAfternoon ? "Trabajos cercanos" : "Ver ofertas",
      intent: { type: "search", query: "trabajos cercanos", label: "Trabajos", source: "contextual" },
      icon: "briefcase",
      variant: "red",
    });
  }

  if (["cliente", "pyme", "enterprise"].includes(role)) {
    items.push({
      id: "ctx-contratar",
      label: "Buscar talento",
      intent: { type: "search", query: "buscar trabajadores", label: "Buscar talento", source: "contextual" },
      icon: "users",
      variant: "red",
    });
  }

  items.push({
    id: "ctx-saldo",
    label: "Ver mi saldo",
    intent: { type: "navigate", screen: "/wallet", label: "Ver saldo", source: "contextual" },
    icon: "wallet",
    variant: "blue",
  });

  return items;
}

/** Chips conversacionales (preguntas frecuentes al Cerebro). */
export function getConversationalChips(): ChipItem[] {
  return [
    {
      id: "conv-ayuda",
      label: "¿Qué podés hacer?",
      intent: { type: "search", query: "qué podés hacer", label: "Ayuda", source: "conversational" },
      icon: "help",
      variant: "white",
    },
    {
      id: "conv-billetera",
      label: "¿Cómo transfiero?",
      intent: { type: "search", query: "cómo transfiero", label: "Transferir", source: "conversational" },
      icon: "wallet",
      variant: "blue",
    },
    {
      id: "conv-perfil",
      label: "Verificar mi perfil",
      intent: { type: "navigate", screen: "/profile", label: "Perfil", source: "conversational" },
      icon: "profile",
      variant: "white",
    },
  ];
}

/** Combina todos los chips; sin duplicados por intent.query+screen. */
export function getAllChips(roles: RoleId[]): ChipItem[] {
  const seen = new Set<string>();
  const out: ChipItem[] = [];

  for (const c of [...getIntentChips(), ...getContextualChips(roles), ...getConversationalChips()]) {
    const key = `${c.intent.type}:${c.intent.query ?? ""}:${c.intent.screen ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }

  return out;
}

/** Primeros N visibles; el resto en "más". */
export function getVisibleChips(roles: RoleId[], maxVisible = MAX_VISIBLE): { visible: ChipItem[]; more: ChipItem[] } {
  const all = getAllChips(roles);
  return {
    visible: all.slice(0, maxVisible),
    more: all.slice(maxVisible),
  };
}

function mapQueryToPath(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes("billetera") || q.includes("saldo") || q.includes("pago")) return "/wallet";
  if (q.includes("perfil") || q.includes("mi perfil")) return "/profile";
  if (q.includes("chat")) return "/chat";
  if (q.includes("inicio") || q.includes("trabajo")) return "/home";
  return null;
}

function mapLabelToIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("billetera") || l.includes("saldo")) return "wallet";
  if (l.includes("perfil")) return "profile";
  if (l.includes("chat")) return "chat";
  if (l.includes("trabajo") || l.includes("cercano")) return "briefcase";
  return "search";
}
