/**
 * Tipos para KYC (verificación de identidad y facial).
 * Alineado con auth/types VerificationLevel y con Prisma VerificationEvent.
 */

export type KycVerificationLevel = "unverified" | "basic" | "verified" | "trusted";

export type VerificationStep = "basic" | "document" | "biometric";

export interface KycSessionResponse {
  sessionId: string;
  customerToken: string;
  /** URL del flujo hospedado de Incode (opción low-code). Si se usa SDK, no es necesario. */
  flowUrl?: string;
}

export interface KycStatusResponse {
  verificationLevel: KycVerificationLevel;
  canAccessWallet: boolean;
  canAccessVideo: boolean;
  /** Pasos completados (para mostrar progreso en UI). */
  stepsCompleted: VerificationStep[];
}

/** Payload que Incode envía al webhook cuando termina una sesión (ej. onboarding complete). */
export interface IncodeWebhookPayload {
  sessionId?: string;
  customerId?: string;
  status?: string; // "OK" | "FAIL" | "PENDING"
  id?: string;
  /** Firma para verificación (si Incode la envía). */
  signature?: string;
  [key: string]: unknown;
}
