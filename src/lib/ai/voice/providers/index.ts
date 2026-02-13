/**
 * Proveedores de voz alternativos: Whisper (STT), ElevenLabs (TTS).
 * Por defecto se usan Web Speech API y Speech Synthesis; aquí se prepara la
 * arquitectura para sustituir por APIs cuando estén configuradas.
 */

export { createWhisperCapture, type WhisperCaptureOptions } from "./whisper";
export { createElevenLabsOutput, type ElevenLabsOutputOptions } from "./elevenlabs";
