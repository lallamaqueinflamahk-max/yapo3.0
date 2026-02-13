/**
 * Construye el contexto de knowledge-base para OpenAI.
 * Solo datos; sin lógica en prompts.
 */

import { YAPO_KNOWLEDGE } from "@/lib/ai/knowledge-base/yapo-knowledge";
import {
  getIntentPatterns,
  getRoutesByIntent,
  getDefaultSuggestions,
  type IntentKind,
} from "@/lib/ai/knowledge";

export function buildKnowledgeContext(): string {
  const kbParts: string[] = [];

  kbParts.push("## Conocimiento YAPÓ (base local)\n");
  for (const entry of YAPO_KNOWLEDGE) {
    kbParts.push(`- **${entry.title}** (${entry.category}): ${entry.content}`);
  }

  kbParts.push("\n## Intents y rutas\n");
  const patterns = getIntentPatterns();
  for (const p of patterns) {
    kbParts.push(`- Intent "${p.kind}": keywords [${p.keywords.join(", ")}] → "${p.message}"`);
  }
  const intents: IntentKind[] = [
    "general",
    "ir_inicio",
    "ir_billetera",
    "ir_chat",
    "ver_perfil",
    "buscar_trabajo",
  ];
  for (const intent of intents) {
    const routes = getRoutesByIntent(intent);
    if (routes.length) {
      kbParts.push(`- Rutas para ${intent}: ${routes.map((r) => `${r.path} (${r.label})`).join(", ")}`);
    }
  }

  kbParts.push("\n## Sugerencias por defecto\n");
  const suggestions = getDefaultSuggestions();
  for (const s of suggestions.slice(0, 8)) {
    kbParts.push(`- ${s.text}${s.query ? ` → query: "${s.query}"` : ""}`);
  }

  return kbParts.join("\n");
}
