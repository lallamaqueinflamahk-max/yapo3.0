/**
 * Speech-to-Text: transcripción de voz a texto.
 * Wrapper sobre Web Speech API (createWebSpeechAPI).
 */

import { createWebSpeechAPI } from "./capture";
import type { WebSpeechAPIHandle, WebSpeechAPIOptions } from "./capture";

export type { WebSpeechAPIHandle, WebSpeechAPIOptions };

/**
 * Crea un handle de speech-to-text (Web Speech API).
 * startListening(), stopListening(), onResult(text).
 */
export function createSpeechToText(
  options: WebSpeechAPIOptions = {}
): WebSpeechAPIHandle {
  return createWebSpeechAPI(options);
}
