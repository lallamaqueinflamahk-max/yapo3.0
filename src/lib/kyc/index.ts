/**
 * KYC: verificación de identidad y facial.
 * Proveedor principal: Incode (documento + selfie + liveness).
 * Solo se almacenan resultados (pass/fail, nivel), nunca datos biométricos crudos.
 */

export {
  createIncodeSession,
  isIncodeConfigured,
  verifyIncodeWebhookSignature,
} from "./incode";
export type { KycSessionResponse, KycStatusResponse, KycVerificationLevel, VerificationStep, IncodeWebhookPayload } from "./types";
export { getKycStatus, recordVerificationSuccess } from "./service";
