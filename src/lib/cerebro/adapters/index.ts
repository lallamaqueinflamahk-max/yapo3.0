/**
 * Adapters del Cerebro: OpenAI, ElevenLabs.
 * Arquitectura preparada; no conectados aún.
 */

export {
  createOpenAICerebroAdapter,
  type IOpenAICerebroAdapter,
  type OpenAICerebroConfig,
  type OpenAIChatMessage,
  type OpenAIEnrichInput,
  type OpenAIEnrichOutput,
} from "./openai";

export {
  createElevenLabsCerebroAdapter,
  type IElevenLabsCerebroAdapter,
  type ElevenLabsCerebroConfig,
  type ElevenLabsSpeakOptions,
} from "./elevenlabs";
