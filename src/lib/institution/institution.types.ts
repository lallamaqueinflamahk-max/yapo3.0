/**
 * Modo institucional: programas, subsidios y validaciones.
 * Lenguaje neutral: institución, programa; sin referencias a actores concretos.
 */

import type { RoleId } from "@/lib/auth";

/** Identificador de institución (emisor del programa). */
export type InstitutionId = string;

/** Estado del programa: activo, pausado, cerrado. */
export type ProgramStatus = "active" | "paused" | "closed";

/** Criterios de elegibilidad: rol, territorio, trustScore, biometría. */
export interface ProgramCriteria {
  /** Roles que califican (vacío = cualquier rol). */
  allowedRoles?: RoleId[];
  /** Zonas territoriales (IDs o semáforo: verde/amarillo). Vacío = todo el territorio. */
  allowedTerritories?: string[];
  /** TrustScore mínimo (opcional). */
  minTrustScore?: number;
  /** TrustScore máximo (opcional; ej. excluir perfiles muy altos). */
  maxTrustScore?: number;
  /** Nivel de biometría mínimo (0–3). */
  requiredBiometricLevel?: 0 | 1 | 2 | 3;
  /** Reglas adicionales en texto o clave (extensible). */
  customRules?: Record<string, unknown>;
}

/** Reglas de desembolso: monto máximo por usuario, frecuencia. */
export interface DisbursementRules {
  /** Máximo a depositar por usuario por programa (total o por ciclo). */
  maxAmountPerUser: number;
  /** Máximo por desembolso individual. */
  maxAmountPerDisbursement?: number;
  /** Si los fondos desembolsados pueden bloquearse para uso indebido (ej. solo gasto en categorías). */
  blockMisuse?: boolean;
  /** Categorías de uso permitido (si blockMisuse). Vacío = sin restricción. */
  allowedUseCategories?: string[];
}

/** Programa: criterios, reglas de desembolso, estado. */
export interface Program {
  id: string;
  institutionId: InstitutionId;
  name: string;
  description: string;
  status: ProgramStatus;
  criteria: ProgramCriteria;
  disbursementRules: DisbursementRules;
  /** Presupuesto total asignado (0 = sin tope explícito). */
  totalBudget?: number;
  /** Monto ya comprometido/desembolsado. */
  spentAmount?: number;
  createdAt: number;
  updatedAt: number;
}

/** Resultado de elegibilidad: el Cerebro decide y explica. */
export interface EligibilityResult {
  qualified: boolean;
  /** Motivo (para mostrar al usuario). */
  reason: string;
  /** Si se requiere verificación adicional antes de aprobar. */
  requiresVerification?: boolean;
  /** Acciones sugeridas (ej. completar biometría). */
  suggestedActions?: Array<{ id: string; label: string; target?: string }>;
  /** Programa evaluado. */
  programId: string;
}

/** Registro de desembolso: auditoría y bloqueo de uso indebido. */
export interface DisbursementRecord {
  id: string;
  programId: string;
  userId: string;
  amount: number;
  status: "completed" | "failed" | "reversed";
  /** Si los fondos están bloqueados para uso indebido. */
  blockMisuse: boolean;
  createdAt: number;
  metadata?: Record<string, unknown>;
}
