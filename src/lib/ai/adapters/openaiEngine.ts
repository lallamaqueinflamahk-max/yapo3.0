/**
 * OpenAIEngine: Cerebro ampliado vía OpenAI.
 * Input: CerebroContext + query. Output: CerebroResponse normalizado.
 * inferIntent: OpenAI SOLO propone intent + payload; NUNCA navega ni ejecuta.
 * Solo server-side; nunca exponer API key al frontend.
 */

import type { CerebroContext } from "@/lib/ai/cerebroContext";
import type { CerebroResponse, CerebroResponseAction } from "@/lib/ai/types/cerebroResponse";
import type { CerebroIntent, CerebroContext as CerebroRunContext } from "@/lib/ai/cerebro";
import { buildKnowledgeContext } from "./buildKnowledgeContext";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 15_000;

export interface OpenAIEngineConfig {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

/** Tool: cerebro_response — devuelve la respuesta estructurada. */
const CEREBRO_RESPONSE_TOOL = {
  type: "function" as const,
  function: {
    name: "cerebro_response",
    description: "Devuelve la respuesta del asistente YAPÓ: texto, acciones sugeridas y navegación.",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "Mensaje en lenguaje natural para el usuario" },
        suggestedActions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              href: { type: "string" },
              description: { type: "string" },
            },
          },
          description: "Acciones sugeridas (navegación, etc.)",
        },
        navigation: {
          type: "object",
          properties: { href: { type: "string" }, label: { type: "string" } },
          description: "Navegación principal si aplica",
        },
      },
      required: ["text", "suggestedActions"],
    },
  },
};

function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim();
}

/**
 * Ejecuta el motor OpenAI con contexto Cerebro y KB local.
 * Sin lógica en prompts: el modelo recibe solo contexto y debe usar function-calling.
 */
export async function runOpenAIEngine(
  query: string,
  context: CerebroContext,
  config: OpenAIEngineConfig = {}
): Promise<CerebroResponse> {
  const apiKey = config.apiKey ?? getApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurada");
  }

  const model = config.model ?? DEFAULT_MODEL;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const kbContext = buildKnowledgeContext();

  const systemContent = [
    "Sos el asistente de YAPÓ (Super App paraguaya de identidad, reputación y trabajo).",
    "Respondé en español, de forma breve y útil.",
    "Usá SOLO el conocimiento proporcionado y las rutas/sugerencias indicadas. No inventes enlaces ni acciones que no estén en el contexto.",
    "Para cada respuesta del usuario, llamá a la función cerebro_response con el texto de tu respuesta y las acciones sugeridas (id, label, href) que correspondan según el conocimiento.",
    "",
    kbContext,
  ].join("\n");

  const userContent = [
    `Pantalla actual: ${context.screen}.`,
    `Permisos del usuario: ${context.permissions.join(", ") || "ninguno"}.`,
    `Consulta del usuario: "${query}"`,
  ].join(" ");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        tools: [CEREBRO_RESPONSE_TOOL],
        tool_choice: { type: "function", function: { name: "cerebro_response" } },
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{
            function?: { name: string; arguments?: string };
          }>;
        };
      }>;
    };
    const choice = data.choices?.[0];
    const toolCall = choice?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (!argsStr) {
      return normalizeFallback(query, "openai");
    }

    let parsed: { text?: string; suggestedActions?: CerebroResponseAction[]; navigation?: { href: string; label: string } };
    try {
      parsed = JSON.parse(argsStr) as typeof parsed;
    } catch {
      return normalizeFallback(query, "openai");
    }

    const text = parsed.text?.trim() ?? "¿En qué te ayudo?";
    const suggestedActions = Array.isArray(parsed.suggestedActions)
      ? parsed.suggestedActions.map((a) => ({
          id: String(a?.id ?? ""),
          label: String(a?.label ?? ""),
          href: a?.href,
          description: a?.description,
        }))
      : [];

    return {
      text,
      textForTTS: text.replace(/\s+/g, " ").trim(),
      suggestedActions,
      navigation: parsed.navigation,
      permissions: context.permissions,
      source: "openai",
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function normalizeFallback(query: string, source: "openai"): CerebroResponse {
  return {
    text: "No pude procesar la consulta. ¿Querés que te guíe por el inicio?",
    textForTTS: "No pude procesar la consulta.",
    suggestedActions: [{ id: "home", label: "Ir al inicio", href: "/home" }],
    source,
  };
}

/**
 * Infiere intent + payload desde texto. OpenAI SOLO propone intent; NUNCA navega ni ejecuta.
 * El Cerebro (runCerebroWithIntent) decide y ejecuta.
 * Reglas: solo intentId + payload; si no está seguro, devolver intentId = "clarify.intent".
 */
export async function inferIntent(
  text: string,
  context: CerebroRunContext
): Promise<CerebroIntent> {
  // Stub: devolver búsqueda por defecto; luego conectar OpenAI con INTENT_INFERENCE_SYSTEM_PROMPT
  const query = (text ?? "").trim();
  if (!query) {
    return {
      intentId: "clarify.intent",
      payload: {},
      source: "chat",
    };
  }
  return {
    intentId: "search.services",
    payload: { query },
    source: "chat",
  };
}
