/**
 * Registro e identidad: 3 capas y documentos por rol.
 * Diseño: docs/arquitectura/REGISTRO-IDENTIDAD-DATOS.md.
 * Datos personales solo con consentimiento explícito.
 */

import type { RoleId } from "@/lib/auth";

/** Capa de registro del usuario. */
export type RegistrationLayer = "open" | "social" | "verified";

/** Nivel de verificación (alineado a auth/types). */
export type VerificationLevel =
  | "unverified"
  | "basic"
  | "verified"
  | "trusted";

/** Proveedor de login social. */
export type SocialProvider = "google" | "facebook" | "instagram";

/** Tipo de documento para verificación. */
export type DocumentType = "cedula" | "ruc" | "representante_legal" | "doc_empresa";

/** Documentos requeridos por rol para registro verificado. */
export interface DocumentRequirement {
  documentType: DocumentType;
  label: string;
  required: boolean;
  description?: string;
}

/** Configuración de documentos por rol (verificación). */
export const DOCUMENTS_BY_ROLE: Record<RoleId, DocumentRequirement[]> = {
  vale: [
    { documentType: "cedula", label: "Cédula de identidad", required: true },
  ],
  capeto: [
    { documentType: "cedula", label: "Cédula de identidad", required: true },
  ],
  kavaju: [
    { documentType: "cedula", label: "Cédula de identidad", required: true },
  ],
  mbarete: [
    { documentType: "cedula", label: "Cédula de identidad", required: true },
  ],
  cliente: [
    { documentType: "cedula", label: "Cédula de identidad", required: true },
    {
      documentType: "ruc",
      label: "RUC (si actúa como persona jurídica)",
      required: false,
    },
  ],
  pyme: [
    { documentType: "ruc", label: "RUC de la empresa", required: true },
    {
      documentType: "representante_legal",
      label: "Cédula del representante legal",
      required: true,
    },
    {
      documentType: "doc_empresa",
      label: "Documentación de la empresa",
      required: false,
    },
  ],
  enterprise: [
    { documentType: "ruc", label: "RUC de la empresa", required: true },
    {
      documentType: "representante_legal",
      label: "Cédula del representante legal",
      required: true,
    },
    {
      documentType: "doc_empresa",
      label: "Documentación corporativa",
      required: true,
    },
  ],
};

/** Obtiene los documentos requeridos para un rol. */
export function getDocumentsForRole(role: RoleId): DocumentRequirement[] {
  return DOCUMENTS_BY_ROLE[role] ?? DOCUMENTS_BY_ROLE.vale;
}

/** Resultado de un paso de verificación (sin guardar documento ni biometría en crudo). */
export interface VerificationEventResult {
  documentType: DocumentType;
  result: "ok" | "fail" | "pending";
  biometricLevel?: 0 | 1 | 2 | 3;
  verifiedAt: number;
}

/** Identidad social vinculada (solo con consentimiento login_social). */
export interface SocialIdentityRecord {
  provider: SocialProvider;
  providerUserId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  consentType: string;
  consentVersion?: string | null;
  consentAt: number;
}

/** Capa mínima requerida para una acción (ej. wallet_transfer → verified). */
export const LAYER_FOR_SENSITIVE_ACTIONS: RegistrationLayer = "verified";
