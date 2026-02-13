/**
 * Cerebro AI — punto de entrada público.
 * Arquitectura: engine | knowledge | voice | cerebroContext | config | adapters | cerebroEngine
 */

export { getAIMode, getVoiceMode, AI_MODE, VOICE_MODE } from "./config";
export type { AIMode, VoiceMode } from "./config";

export {
  INTENT_INFERENCE_SYSTEM_PROMPT,
  CLARIFY_INTENT_ID,
} from "./prompts";

export { runCerebro } from "./cerebroEngine";
export { runOpenAIEngine, inferIntent } from "./adapters/openaiEngine";
export { buildKnowledgeContext } from "./adapters/buildKnowledgeContext";

export {
  runCerebroWithIntent,
  processInputWithIntent,
  decide as decideCerebro,
  useCerebroNavigation,
} from "./cerebro/index";
export type {
  CerebroIntent as CerebroRunIntent,
  CerebroContext as CerebroRunContext,
  CerebroResult as CerebroRunResult,
  CerebroRole,
} from "./cerebro/index";

export type { CerebroResponse, CerebroResponseAction } from "./types";
export type { CerebroIntent as CerebroIntentLegacy, CerebroIntentType } from "./engine/cerebroIntent";

export {
  decide,
  getIntentsForRoles,
  toDecideContext,
  INTENT_CATALOG,
  INTENT_IDS,
  getIntentDefinition,
  isValidIntentId,
} from "./intents";
export type {
  IntentId,
  IntentCategory,
  IntentPayload,
  ResultAction,
  IntentDefinition,
  CerebroIntent,
  DecideContext,
  DecideUser,
  CerebroResult,
  SuggestedAction,
} from "./intents";
export {
  getIntentChips,
  getContextualChips,
  getConversationalChips,
  getAllChips,
  getVisibleChips,
} from "./chipData";
export type { ChipItem } from "./chipData";

export {
  getChipsForRole,
  getChipsForRoles,
  MAX_ROLE_CHIPS_VISIBLE,
} from "./role-intents";
export type { RoleChip } from "./role-intents";

export {
  analyzeQuery,
  detectIntent,
  analyzeUserText,
  resolveIntentToAction,
  resolveUserIntent,
  buildResponse,
  buildResponseFromIntent,
  buildFinalResponse,
  searchInOrder,
  parseIntent,
  CEREBRO_RULES,
  ensureNoForbiddenPhrase,
  getOrientationMessage,
  GPT_CONFIG,
  getModelForQuery,
} from "./engine";

export type {
  CerebroContext,
  IntentKind,
  Suggestion,
  Action,
  NavRoute,
  CerebroSearchResult,
  IntentResolution,
  IntentResult,
  TextAnalysisResult,
  IntentType,
  IntentEntity,
  ActionDomain,
  ResolveIntentResult,
  ResolvedAction,
  ResolvedActionType,
  CerebroFinalResponse,
  ClickeableAction,
  ActionResultResponse,
  GPTModelTier,
  ParseIntentResult,
  IntentEntry,
  KnowledgeBase,
} from "./engine";

export {
  getIntentPatterns,
  getDefaultSuggestions,
  getRoutesByIntent,
  getCapabilities,
  getCapabilityById,
  roles,
  actions,
} from "./knowledge";

export type {
  IntentPattern,
  SuggestionEntry,
  RouteEntry,
  RoleEntry,
  ActionEntry,
  CapabilityEntry,
} from "./knowledge";

export {
  canUseVoice,
  createVoiceCapture,
  createVoiceOutput,
  createWebSpeechAPI,
  createSpeechSynthesis,
  createSpeechToText,
  createTextToSpeech,
  speechToText,
  textToSpeech,
  createWhisperCapture,
  createElevenLabsOutput,
  VOICE_TONE,
  MBARETE_REFERIDOS_MIN,
} from "./voice";

export type {
  IVoiceCapture,
  IVoiceOutput,
  VoiceProvider,
  TranscriptResult,
  SpeakOptions,
  UserTier,
  VoiceEligibilityContext,
  WebSpeechAPIOptions,
  WebSpeechAPIHandle,
  SpeechSynthesisLang,
  SpeechSynthesisAPIOptions,
  SpeechSynthesisAPIHandle,
  WhisperCaptureOptions,
  ElevenLabsOutputOptions,
} from "./voice";

export { buildCerebroContext } from "./cerebroContext";
export type {
  BuildCerebroContextInput,
  CerebroUser,
  CerebroMemoryEntry,
} from "./cerebroContext";

export { processInput } from "./cerebro";
export type { ProcessInputResult } from "./cerebro";
export type { UserContext } from "./engine/contextResolver";
