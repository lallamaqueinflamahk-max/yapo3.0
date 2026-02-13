/**
 * AI: motor OpenAI + voz en el Cerebro.
 * processInput() usa base de conocimiento local primero; luego OpenAI.
 * VoiceEngine: TTS ElevenLabs, mic → texto → Cerebro, voz por rol.
 */

export { processInput } from "./OpenAIEngine";
export type { ProcessInputParams } from "./OpenAIEngine";

export {
  VOICE_BY_ROLE,
  getVoiceForRole,
  speakWithElevenLabs,
  runVoiceToCerebro,
  createVoiceCerebroPipeline,
} from "./VoiceEngine";
export type {
  VoiceConfig,
  SpeakOptions,
  VoiceCerebroApiContext,
  CerebroVoiceResponse,
  VoiceCerebroPipelineOptions,
  VoiceCerebroPipeline,
} from "./VoiceEngine";
