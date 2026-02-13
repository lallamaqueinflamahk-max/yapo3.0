/**
 * VoiceEngine: voz en el Cerebro.
 * - TTS con ElevenLabs (voz configurada por rol).
 * - Micrófono → texto (STT) → Cerebro (/api/ai) → TTS (ElevenLabs).
 * Uso: cliente (STT + fetch /api/ai + fetch /api/voice); voz por rol.
 */

import type { CerebroRole } from "@/lib/ai/cerebro";
import {
  createWebSpeechAPI,
  type WebSpeechAPIHandle,
} from "@/lib/ai/voice";

// -----------------------------------------------------------------------------
// Voz configurada por rol (ElevenLabs voice_id)
// -----------------------------------------------------------------------------

/** Voice IDs de ejemplo ElevenLabs (multilingual). Sustituir por los de tu cuenta. */
const ELEVENLABS_VOICES: Record<string, string> = {
  /** Rachel - neutro, claro */
  rachel: "21m00Tcm4TlvDq8ikWAM",
  /** Adam - masculino */
  adam: "pNInz6obpgDQGcFmaJgB",
  /** Bella - femenino */
  bella: "EXAVITQu4vr4xnSDxMaL",
  /** Antoni - masculino */
  antoni: "ErXwobaYiN019PkySvjV",
  /** Josh - masculino */
  josh: "TxGEqnHWrfWFTfGW9XjX",
  /** Arnold - masculino */
  arnold: "VR6AewLTigWG4xSOukaG",
  /** Domi - femenino */
  domi: "AZnzlk1XvdvUeBnXmlld",
};

export interface VoiceConfig {
  voiceId: string;
  lang?: string;
}

/** Mapeo rol → voz ElevenLabs. Ajustar voiceId según voces disponibles en la cuenta. */
export const VOICE_BY_ROLE: Record<CerebroRole, VoiceConfig> = {
  vale: { voiceId: ELEVENLABS_VOICES.rachel, lang: "es-ES" },
  capeto: { voiceId: ELEVENLABS_VOICES.adam, lang: "es-ES" },
  kavaju: { voiceId: ELEVENLABS_VOICES.antoni, lang: "es-ES" },
  mbarete: { voiceId: ELEVENLABS_VOICES.arnold, lang: "es-ES" },
  cliente: { voiceId: ELEVENLABS_VOICES.bella, lang: "es-ES" },
  pyme: { voiceId: ELEVENLABS_VOICES.josh, lang: "es-ES" },
  enterprise: { voiceId: ELEVENLABS_VOICES.antoni, lang: "es-ES" },
};

export function getVoiceForRole(role: CerebroRole): VoiceConfig {
  return VOICE_BY_ROLE[role] ?? VOICE_BY_ROLE.vale;
}

// -----------------------------------------------------------------------------
// TTS con ElevenLabs (cliente: llama /api/voice y reproduce)
// -----------------------------------------------------------------------------

export interface SpeakOptions {
  /** Rol para elegir voiceId; se ignora si se pasa voiceId. */
  role?: CerebroRole;
  /** voice_id directo (prioridad sobre role). */
  voiceId?: string;
  /** Base URL para la API (por defecto "" para rutas relativas). */
  apiBase?: string;
}

/**
 * Reproduce texto con ElevenLabs vía POST /api/voice.
 * Para uso en cliente: obtiene audio y lo reproduce con AudioContext/HTMLAudioElement.
 */
export async function speakWithElevenLabs(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  if (typeof window === "undefined") return;
  const t = text?.trim();
  if (!t) return;

  const { role, voiceId, apiBase = "" } = options;
  const voiceConfig = voiceId
    ? { voiceId, lang: "es-ES" as const }
    : role
      ? getVoiceForRole(role)
      : getVoiceForRole("vale");

  const res = await fetch(`${apiBase}/api/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: t,
      voiceId: voiceConfig.voiceId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Voice API error");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

// -----------------------------------------------------------------------------
// Contexto para /api/ai (compatible con ApiAiBody)
// -----------------------------------------------------------------------------

export interface VoiceCerebroApiContext {
  screen: string;
  roles: string[];
  user?: { userId: string; roles?: string[]; verified?: boolean } | null;
  permissions?: string[];
  memory?: { query?: string; message?: string; at?: number }[];
}

// -----------------------------------------------------------------------------
// Microfono → texto → Cerebro → TTS
// -----------------------------------------------------------------------------

export interface CerebroVoiceResponse {
  text: string;
  suggestedActions?: { id: string; label: string; href?: string }[];
  source?: "local" | "openai";
}

/**
 * Envía el texto transcrito al Cerebro (/api/ai) y devuelve la respuesta.
 * Uso en cliente: mic → transcript → runVoiceToCerebro(transcript, context) → speakWithElevenLabs(res.text, { role }).
 */
export async function runVoiceToCerebro(
  transcript: string,
  context: VoiceCerebroApiContext,
  options: { apiBase?: string } = {}
): Promise<CerebroVoiceResponse> {
  const { apiBase = "" } = options;
  const res = await fetch(`${apiBase}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: transcript.trim(),
      context: {
        screen: context.screen,
        roles: context.roles ?? [],
        user: context.user ?? null,
        permissions: context.permissions ?? [],
        memory: context.memory ?? [],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Cerebro API error");
  }

  const data = (await res.json()) as {
    text?: string;
    suggestedActions?: { id: string; label: string; href?: string }[];
    source?: "local" | "openai";
  };
  return {
    text: data.text ?? "No pude procesar la consulta.",
    suggestedActions: data.suggestedActions,
    source: data.source,
  };
}

// -----------------------------------------------------------------------------
// Pipeline: STT (mic) + Cerebro + TTS
// -----------------------------------------------------------------------------

export interface VoiceCerebroPipelineOptions {
  /** Contexto para /api/ai (pantalla, roles, user). */
  context: VoiceCerebroApiContext;
  /** Rol para elegir voz en TTS. */
  role: CerebroRole;
  /** Idioma para STT (ej. "es-ES"). */
  lang?: string;
  /** Base URL para APIs (por defecto ""). */
  apiBase?: string;
  /** Si true, tras obtener respuesta del Cerebro se reproduce con ElevenLabs. */
  speakResponse?: boolean;
  /** Callback con respuesta del Cerebro (para UI). */
  onResponse?: (response: CerebroVoiceResponse) => void;
  /** Callback con error. */
  onError?: (err: Error) => void;
}

export interface VoiceCerebroPipeline {
  /** Inicia la escucha por micrófono. */
  startListening(): Promise<boolean>;
  /** Detiene la escucha. */
  stopListening(): void;
  /** true si está escuchando. */
  readonly isListening: boolean;
  /** Handle de STT (por si se quiere reutilizar). */
  readonly stt: WebSpeechAPIHandle;
}

/**
 * Crea el pipeline: micrófono → texto → Cerebro (/api/ai) → (opcional) TTS ElevenLabs.
 * Al recibir un resultado final de STT, llama a /api/ai y, si speakResponse, reproduce la respuesta con la voz del rol.
 */
export function createVoiceCerebroPipeline(
  options: VoiceCerebroPipelineOptions
): VoiceCerebroPipeline {
  const {
    context,
    role,
    lang = "es-ES",
    apiBase = "",
    speakResponse = true,
    onResponse,
    onError,
  } = options;

  const stt = createWebSpeechAPI({
    lang,
    finalOnly: true,
    onResult: async (text) => {
      if (!text.trim()) return;
      try {
        const response = await runVoiceToCerebro(text, context, { apiBase });
        onResponse?.(response);
        if (speakResponse && response.text) {
          await speakWithElevenLabs(response.text, { role, apiBase });
        }
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
  });

  return {
    get isListening() {
      return stt.isListening;
    },
    startListening: () => stt.startListening(),
    stopListening: () => stt.stopListening(),
    stt,
  };
}
