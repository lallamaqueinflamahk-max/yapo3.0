/**
 * Roles conductuales YAPÓ: comportamiento por rol (intents, biometría, wallet, contratación).
 * Complementa auth/roles y auth/permissions; no los reemplaza.
 * El CerebroEngine valida RoleBehavior antes de decidir.
 */

export type {
  RoleBehavior,
  LimitesWallet,
  BiometriaNivel,
} from "./behaviors";
export {
  ROLE_BEHAVIORS,
  getRoleBehavior,
  roleAllowsIntent,
  getLimitesWallet,
  getRequiereBiometriaNivel,
  puedeContratarA,
} from "./behaviors";
