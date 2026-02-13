/**
 * Análisis de texto del usuario: detecta intención (navegación, búsqueda, acción, ayuda)
 * y extrae entidad con confianza.
 */

export type IntentType = "navigation" | "search" | "action" | "help";

export type ActionDomain = "wallet" | "chat" | "video" | "profile";

/** Entidad extraída según el tipo de intención. */
export interface IntentEntity {
  /** Navegación: ruta destino. */
  path?: string;
  /** Navegación: etiqueta. */
  label?: string;
  /** Búsqueda: consulta o tema. */
  query?: string;
  /** Acción: id canónico (ej. wallet:transfer). */
  actionId?: string;
  /** Acción: dominio (wallet, chat, video, profile). */
  domain?: ActionDomain;
  /** Ayuda: tema sobre el que pide explicación. */
  topic?: string;
}

export interface TextAnalysisResult {
  intentType: IntentType;
  entity: IntentEntity;
  confidence: number;
}

const HELP_PATTERNS = [
  "ayuda",
  "cómo",
  "qué es",
  "explicación",
  "explicame",
  "qué hace",
  "para qué",
  "tutorial",
  "no entiendo",
  "cómo funciona",
];

const NAVIGATION_ENTRIES: Array<{ keywords: string[]; path: string; label: string }> = [
  { keywords: ["inicio", "home", "principal", "volver"], path: "/home", label: "Inicio" },
  { keywords: ["billetera", "wallet", "dinero", "pagos", "saldo", "cobrar"], path: "/wallet", label: "Billetera" },
  { keywords: ["perfil", "mi perfil", "cuenta", "mis datos"], path: "/profile", label: "Perfil" },
  { keywords: ["chat", "mensajes", "hablar", "contacto", "escribir"], path: "/chat", label: "Chat" },
  { keywords: ["cerebro", "asistente"], path: "/cerebro", label: "Cerebro" },
];

const SEARCH_PATTERNS = [
  "buscar",
  "busco",
  "encontrar",
  "trabajo",
  "empleo",
  "oferta",
  "ofertas",
  "vacante",
  "vacantes",
  "contratar",
  "necesito trabajo",
  "trabajos cercanos",
];

const ACTION_ENTRIES: Array<{
  keywords: string[];
  actionId: string;
  domain: ActionDomain;
  path: string;
  label: string;
}> = [
  {
    keywords: ["transferir", "transferencia", "enviar dinero", "enviar plata", "enviar yap"],
    actionId: "wallet:transfer",
    domain: "wallet",
    path: "/wallet",
    label: "Transferir",
  },
  {
    keywords: ["pagar", "cobrar", "saldo", "billetera", "wallet"],
    actionId: "wallet:view",
    domain: "wallet",
    path: "/wallet",
    label: "Billetera",
  },
  {
    keywords: ["chat", "mensaje", "mensajes", "hablar", "escribir", "contacto"],
    actionId: "chat:private",
    domain: "chat",
    path: "/chat",
    label: "Chat",
  },
  {
    keywords: ["videollamada", "llamar por video", "iniciar videollamada", "crear llamada"],
    actionId: "video:call",
    domain: "video",
    path: "/video",
    label: "Videollamada",
  },
  {
    keywords: ["unirse a llamada", "entrar a videollamada", "unirme a la llamada"],
    actionId: "video:join",
    domain: "video",
    path: "/video",
    label: "Unirse a llamada",
  },
  {
    keywords: ["subir video", "desempeño", "foto desempeño", "video desempeño"],
    actionId: "upload:performance",
    domain: "video",
    path: "/home",
    label: "Video / desempeño",
  },
  {
    keywords: ["perfil", "mi perfil", "cuenta", "mis datos", "editar perfil"],
    actionId: "profile:view",
    domain: "profile",
    path: "/profile",
    label: "Perfil",
  },
];

function normalize(text: string): string {
  return text.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Analiza el texto del usuario y devuelve intención, entidad y confianza.
 * Orden de detección: ayuda → acción → navegación → búsqueda → fallback (búsqueda).
 */
export function analyzeUserText(text: string): TextAnalysisResult {
  const normalized = normalize(text);
  if (!normalized) {
    return {
      intentType: "search",
      entity: { query: "" },
      confidence: 0,
    };
  }

  // 1. Ayuda / explicación
  const helpMatch = HELP_PATTERNS.some((kw) => normalized.includes(normalize(kw)));
  if (helpMatch) {
    return {
      intentType: "help",
      entity: { topic: text.trim() },
      confidence: 0.85,
    };
  }

  // 2. Acción concreta (wallet, chat, video, profile)
  for (const entry of ACTION_ENTRIES) {
    const match = entry.keywords.some((kw) => normalized.includes(normalize(kw)));
    if (match) {
      return {
        intentType: "action",
        entity: {
          actionId: entry.actionId,
          domain: entry.domain,
          path: entry.path,
          label: entry.label,
        },
        confidence: 0.9,
      };
    }
  }

  // 3. Navegación (ir a X)
  const navPhrases = ["ir a", "ver ", "abrir ", "quiero "];
  const looksLikeNav = navPhrases.some((p) => normalized.startsWith(p)) || normalized.length <= 20;
  if (looksLikeNav) {
    for (const entry of NAVIGATION_ENTRIES) {
      const match = entry.keywords.some((kw) => normalized.includes(normalize(kw)));
      if (match) {
        return {
          intentType: "navigation",
          entity: { path: entry.path, label: entry.label },
          confidence: 0.85,
        };
      }
    }
  }

  // 4. Navegación por palabra clave (sin "ir a")
  for (const entry of NAVIGATION_ENTRIES) {
    const match = entry.keywords.some((kw) => normalized.includes(normalize(kw)));
    if (match) {
      return {
        intentType: "navigation",
        entity: { path: entry.path, label: entry.label },
        confidence: 0.75,
      };
    }
  }

  // 5. Búsqueda (trabajo, ofertas, etc.)
  const searchMatch = SEARCH_PATTERNS.some((kw) => normalized.includes(normalize(kw)));
  if (searchMatch) {
    return {
      intentType: "search",
      entity: { query: text.trim() },
      confidence: 0.8,
    };
  }

  // 6. Fallback: búsqueda genérica
  return {
    intentType: "search",
    entity: { query: text.trim() },
    confidence: 0.5,
  };
}
