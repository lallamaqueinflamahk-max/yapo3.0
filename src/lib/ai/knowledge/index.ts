/**
 * Conocimiento del Cerebro: roles, acciones, funciones de app, capacidades.
 * Separación estricta: solo datos y acceso; sin lógica de motor.
 */

import rolesData from "./roles.json";
import actionsData from "./actions.json";
import appFunctionsData from "./app-functions.json";
import capabilitiesData from "./capabilities.json";
import walletIntentsData from "./wallet.json";

export type IntentKind =
  | "buscar_trabajo"
  | "ver_perfil"
  | "ir_billetera"
  | "ir_chat"
  | "ir_inicio"
  | "general";

export interface IntentPattern {
  kind: IntentKind;
  keywords: string[];
  message: string;
}

export interface SuggestionEntry {
  id: string;
  text: string;
  query?: string;
}

export interface RouteEntry {
  path: string;
  label: string;
  description?: string;
}

export interface RoleEntry {
  id: string;
  type: string;
  name: string;
  description: string;
  keywords: string[];
  screen: string;
  suggestedActions: string[];
}

export interface ActionEntry {
  id: string;
  label: string;
  screen: string;
  context: string[];
  roleRequired: string[];
}

/** Capacidad: id (action id), descripción, roles permitidos. */
export interface CapabilityEntry {
  id: string;
  description: string;
  rolesAllowed: string[];
}

/** Intent de billetera: id, triggers, action canónica, respuesta con template. */
export interface WalletIntentEntry {
  id: string;
  triggers: string[];
  action: string;
  response: string;
}

const appFunctions = appFunctionsData as {
  intentPatterns: IntentPattern[];
  defaultSuggestions: SuggestionEntry[];
  routesByIntent: Record<IntentKind, RouteEntry[]>;
};

export const roles = rolesData as RoleEntry[];
export const actions = actionsData as ActionEntry[];
const capabilities = capabilitiesData as CapabilityEntry[];
export const walletIntents = walletIntentsData as WalletIntentEntry[];

export function getCapabilities(): CapabilityEntry[] {
  return capabilities;
}

export function getCapabilityById(actionId: string): CapabilityEntry | undefined {
  return capabilities.find((c) => c.id === actionId);
}

export function getIntentPatterns(): IntentPattern[] {
  return appFunctions.intentPatterns;
}

export function getDefaultSuggestions(): SuggestionEntry[] {
  return appFunctions.defaultSuggestions;
}

export function getRoutesByIntent(intent: IntentKind): RouteEntry[] {
  return appFunctions.routesByIntent[intent] ?? appFunctions.routesByIntent.general;
}

export function getWalletIntents(): WalletIntentEntry[] {
  return walletIntents;
}

export function getWalletIntentByTrigger(text: string): WalletIntentEntry | undefined {
  const normalized = text.trim().toLowerCase();
  return walletIntents.find((entry) =>
    entry.triggers.some((t) => normalized.includes(t))
  );
}
