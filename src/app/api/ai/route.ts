/**
 * API Route: Cerebro con OpenAI.
 * Usa processInput (KB local primero, luego OpenAI). Salida unificada CerebroResult → CerebroResponse.
 * Nunca expone API key al frontend.
 */

import { NextResponse } from "next/server";
import { getAIMode } from "@/lib/ai/config";
import { processInput } from "@/ai";
import type { CerebroContext } from "@/lib/ai/cerebroContext";
import type { CerebroResponse, CerebroResponseAction } from "@/lib/ai/types/cerebroResponse";

export interface ApiAiBody {
  query: string;
  context: CerebroContext;
}

function cerebroResultToResponse(
  result: Awaited<ReturnType<typeof processInput>>,
  source: "local" | "openai"
): CerebroResponse {
  const text = result.message ?? "";
  const suggestedActions: CerebroResponseAction[] = (result.actions ?? []).map(
    (a) => ({
      id: a.type,
      label: a.label ?? a.type,
      href: typeof a.payload?.screen === "string" ? a.payload.screen : undefined,
      description: undefined,
    })
  );
  const navigation =
    result.navigation ?? result.navigationTarget
      ? {
          href: (result.navigation ?? result.navigationTarget)!.screen,
          label:
            (result.navigation ?? result.navigationTarget)!.params?.label as
              | string
              | undefined ?? "Ir",
        }
      : undefined;

  return {
    text,
    textForTTS: text.replace(/\s+/g, " ").trim(),
    suggestedActions,
    navigation,
    actionAllowed: result.allowed,
    source,
  };
}

export async function POST(request: Request) {
  if (getAIMode() !== "openai") {
    return NextResponse.json(
      { error: "AI_MODE no es openai" },
      { status: 400 }
    );
  }

  let body: ApiAiBody;
  try {
    body = (await request.json()) as ApiAiBody;
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { query, context } = body;
  const q = typeof query === "string" ? query.trim() : "";
  if (!q) {
    return NextResponse.json(
      { error: "query requerido" },
      { status: 400 }
    );
  }

  try {
    const result = await processInput({ text: q, context });
    const source = result.state?.fromKb ? "local" : "openai";
    const response = cerebroResultToResponse(result, source);
    return NextResponse.json(response);
  } catch (err) {
    const fallback: CerebroResponse = {
      text: "No pude procesar la consulta. ¿Querés que te guíe por el inicio?",
      textForTTS: "No pude procesar la consulta.",
      suggestedActions: [{ id: "home", label: "Ir al inicio", href: "/home" }],
      source: "local",
    };
    return NextResponse.json(fallback);
  }
}
