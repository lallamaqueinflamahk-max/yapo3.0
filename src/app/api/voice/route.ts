/**
 * API Route: Text-to-Speech (ElevenLabs).
 * Nunca expone API key al frontend. Fallback: cliente usa SpeechSynthesis.
 */

import { NextResponse } from "next/server";
import { getVoiceMode } from "@/lib/ai/config";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel (multilingual)
const VOICE_TIMEOUT_MS = 15_000;

export interface ApiVoiceBody {
  text: string;
  voiceId?: string;
  modelId?: string;
}

function getApiKey(): string | undefined {
  return process.env.ELEVENLABS_API_KEY?.trim();
}

export async function POST(request: Request) {
  if (getVoiceMode() !== "elevenlabs") {
    return NextResponse.json(
      { error: "VOICE_MODE no es elevenlabs" },
      { status: 400 }
    );
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY no configurada" },
      { status: 503 }
    );
  }

  let body: ApiVoiceBody;
  try {
    body = (await request.json()) as ApiVoiceBody;
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "text requerido" },
      { status: 400 }
    );
  }

  const voiceId = body.voiceId?.trim() || DEFAULT_VOICE_ID;
  const modelId = body.modelId?.trim() || "eleven_multilingual_v2";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VOICE_TIMEOUT_MS);

  try {
    const res = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `ElevenLabs error: ${res.status} ${errText}` },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Voice API no disponible" },
      { status: 503 }
    );
  }
}
