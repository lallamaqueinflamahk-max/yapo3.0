/**
 * Tipos del sistema de Subsidios Wallet (políticas públicas digitales).
 * Reglas: no transferibles; solo se liberan bajo condiciones; totalmente auditables.
 * Listo para gobierno: creación, asignación, validación por escudos, acreditación en balance protegido.
 */

import type { RoleId } from "@/lib/auth";

/** Origen del subsidio: gobierno, empresa, sponsor. */
export type SubsidySource = "government" | "enterprise" | "sponsor";

/** Estado del subsidio en el flujo. */
export type SubsidyStatus =
  | "draft"
  | "available"
  | "accepted"
  | "completed"
  | "cancelled";

/** Condiciones para aceptar/liberar el subsidio (extensible). */
export interface SubsidyConditions {
  /** Rol(es) destinatarios (vacío = cualquier rol). */
  targetRoles?: RoleId[];
  /** Territorio(s) permitidos (IDs; vacío = todos). */
  allowedTerritoryIds?: string[];
  /** Nivel de biometría mínimo (0–3). */
  requiredBiometricLevel?: 0 | 1 | 2 | 3;
  /** TrustScore mínimo (opcional). */
  minTrustScore?: number;
  /** Reglas adicionales en texto (para UI). */
  description?: string;
  /** Claves adicionales (extensible). */
  custom?: Record<string, unknown>;
}

/** Subsidio: definición, condiciones y estado. No transferible; auditable. */
export interface Subsidy {
  id: string;
  /** Origen: government | enterprise | sponsor. */
  source: SubsidySource;
  /** Rol(es) a los que va dirigido. */
  targetRole: RoleId[];
  /** Monto (unidad base). */
  amount: number;
  /** Condiciones para aceptar y liberar. */
  conditions: SubsidyConditions;
  /** IDs o tipos de escudos que deben validar (ej. BIOMETRIC, TERRITORIAL). */
  escudosRequeridos: string[];
  status: SubsidyStatus;
  /** Título o nombre para UI. */
  name?: string;
  /** Descripción para UI. */
  description?: string;
  /** ID de programa público (gobierno). Para trazabilidad y auditoría. */
  programId?: string;
  /** Creado por (userId Mbareté o sistema/gobierno). */
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

/** Registro de aceptación: auditoría (quién, cuándo, cuánto). No transferible. */
export interface SubsidyAcceptance {
  id: string;
  subsidyId: string;
  userId: string;
  amount: number;
  /** Siempre true: subsidios se acreditan en balance protegido; no transferibles. */
  creditedToProtegido: boolean;
  createdAt: number;
  /** Condiciones evaluadas en el momento de aceptar (auditoría). */
  conditionsSnapshot?: SubsidyConditions;
  /** programId del subsidio (trazabilidad para gobierno). */
  programId?: string;
}
