/**
 * Acciones sensibles que pueden requerir verificación biométrica.
 * No bloquean por sí solas: el flujo pasa por AuthorizationService y luego,
 * si la acción está aquí, se puede pedir biometría (salvo SAFE MODE).
 */

import type { ActionId } from "../types";
import { ACTIONS } from "../actions";

/** IDs de acciones que pueden requerir biometría antes de ejecutar. */
export const BIOMETRIC_REQUIRED_ACTIONS: ActionId[] = [
  ACTIONS.wallet_transfer,
  "whatsapp:enable" as ActionId, // feature gate whatsapp
  ACTIONS.video_call,
  ACTIONS.video_join,
];

export function actionRequiresBiometric(actionId: ActionId): boolean {
  return BIOMETRIC_REQUIRED_ACTIONS.includes(actionId);
}
