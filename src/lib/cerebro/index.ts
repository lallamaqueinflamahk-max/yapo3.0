/**
 * Núcleo Cerebro YAPÓ.
 * Este módulo decide TODO: permisos, flujos, autorizaciones y sugerencias.
 * Sin UI. Sin OpenAI. 100% testeable.
 */

export type {
  RoleId,
  ActionId,
  CerebroRole,
  CerebroContext,
  CerebroDecision,
  Decision,
} from "./types";

export { decide, decidir } from "./engine";

export {
  can,
  getAllowedActions,
  getNextSteps,
  CEREBRO_ACTIONS,
} from "./rules";

export {
  runBarQuery,
  queryToAction,
} from "./barEngine";
export type {
  BarScreenContext,
  BarResult,
  BarSuggestedAction,
} from "./barEngine";

export {
  createOpenAICerebroAdapter,
  createElevenLabsCerebroAdapter,
} from "./adapters";
export type {
  IOpenAICerebroAdapter,
  IElevenLabsCerebroAdapter,
  OpenAICerebroConfig,
  ElevenLabsCerebroConfig,
  OpenAIEnrichInput,
  OpenAIEnrichOutput,
  ElevenLabsSpeakOptions,
} from "./adapters";
