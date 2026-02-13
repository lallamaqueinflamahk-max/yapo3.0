export {
  canUseVoice,
  VOICE_TONE,
  MBARETE_REFERIDOS_MIN,
} from "./eligibility";
export type { UserTier, VoiceEligibilityContext } from "./eligibility";

export { createVoiceCapture, createWebSpeechAPI } from "./capture";
export { createVoiceOutput, createSpeechSynthesis } from "./output";
export { createSpeechToText, createSpeechToText as speechToText } from "./speechToText";
export { createTextToSpeech, createTextToSpeech as textToSpeech } from "./textToSpeech";
export type {
  IVoiceCapture,
  IVoiceOutput,
  VoiceProvider,
  TranscriptResult,
  SpeakOptions,
} from "./types";
export type { WebSpeechAPIOptions, WebSpeechAPIHandle } from "./capture";
export type {
  SpeechSynthesisLang,
  SpeechSynthesisAPIOptions,
  SpeechSynthesisAPIHandle,
} from "./output";

export {
  createWhisperCapture,
  createElevenLabsOutput,
} from "./providers";
export type { WhisperCaptureOptions, ElevenLabsOutputOptions } from "./providers";