/**
 * Text-to-Speech: síntesis de texto a voz.
 * Wrapper sobre Speech Synthesis API (createSpeechSynthesis).
 */

import { createSpeechSynthesis } from "./output";
import type {
  SpeechSynthesisAPIHandle,
  SpeechSynthesisAPIOptions,
  SpeechSynthesisLang,
} from "./output";

export type {
  SpeechSynthesisAPIHandle,
  SpeechSynthesisAPIOptions,
  SpeechSynthesisLang,
};

/**
 * Crea un handle de text-to-speech (Speech Synthesis API).
 * speak(text), stop(), isSpeaking.
 */
export function createTextToSpeech(
  options: SpeechSynthesisAPIOptions = {}
): SpeechSynthesisAPIHandle {
  return createSpeechSynthesis(options);
}
