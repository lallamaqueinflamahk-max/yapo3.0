/**
 * Elegibilidad para programas: criterios (rol, territorio, trustScore, biometría).
 * El Cerebro decide si el usuario califica, explica el motivo y puede requerir verificación adicional.
 */

import type { EligibilityResult } from "./institution.types";
import { getProgram } from "./subsidy.program";
import type { RoleId } from "@/lib/auth";
import type { TrustScore } from "@/lib/trust";
import type { UserIdentity } from "@/lib/identity";
import { hasVerifiedLevel } from "@/lib/identity";

export type EligibilityContext = {
  userId: string;
  roles: RoleId[];
  trustScore: TrustScore | null;
  userIdentity: UserIdentity | null;
  /** Zona territorial actual (ID o semáforo: verde/amarillo/rojo). */
  territoryId?: string;
};

/**
 * Evalúa si el usuario califica para el programa.
 * Devuelve qualified, reason y requiresVerification para que el Cerebro explique y pida verificación si aplica.
 */
export function checkEligibility(
  programId: string,
  context: EligibilityContext
): EligibilityResult {
  const program = getProgram(programId);
  if (!program) {
    return {
      qualified: false,
      reason: "Programa no encontrado.",
      programId,
    };
  }

  if (program.status !== "active") {
    return {
      qualified: false,
      reason:
        program.status === "paused"
          ? "El programa está pausado. Probá más tarde."
          : "El programa está cerrado.",
      programId,
    };
  }

  const criteria = program.criteria;
  const { roles, trustScore, userIdentity, territoryId } = context;

  if (criteria.allowedRoles?.length && !roles.some((r) => criteria.allowedRoles!.includes(r))) {
    return {
      qualified: false,
      reason: "Tu rol no está incluido en este programa. Revisá los criterios en la descripción.",
      programId,
      suggestedActions: [
        { id: "go-profile", label: "Ver mi perfil", target: "/profile" },
      ],
    };
  }

  if (criteria.minTrustScore != null && trustScore) {
    const score = trustScore.completedJobs + trustScore.locationStability - trustScore.reports;
    if (score < criteria.minTrustScore) {
      return {
        qualified: false,
        reason: `Se requiere un nivel mínimo de confianza (${criteria.minTrustScore}). Completá más trabajos y mantené tu perfil al día.`,
        programId,
        requiresVerification: true,
        suggestedActions: [
          { id: "go-profile", label: "Mejorar mi perfil", target: "/profile" },
        ],
      };
    }
  }

  if (criteria.maxTrustScore != null && trustScore) {
    const score = trustScore.completedJobs + trustScore.locationStability - trustScore.reports;
    if (score > criteria.maxTrustScore) {
      return {
        qualified: false,
        reason: "Este programa está dirigido a otro perfil. Gracias por tu interés.",
        programId,
      };
    }
  }

  if (criteria.requiredBiometricLevel != null && criteria.requiredBiometricLevel > 0) {
    if (!userIdentity) {
      return {
        qualified: false,
        reason: "Se requiere verificación de identidad para este programa.",
        programId,
        requiresVerification: true,
        suggestedActions: [
          { id: "go-profile", label: "Completar verificación", target: "/profile" },
        ],
      };
    }
    const ok = hasVerifiedLevel(userIdentity, criteria.requiredBiometricLevel as 0 | 1 | 2 | 3);
    if (!ok) {
      return {
        qualified: false,
        reason: `Se requiere verificación de identidad nivel ${criteria.requiredBiometricLevel} o superior. Completala en tu perfil.`,
        programId,
        requiresVerification: true,
        suggestedActions: [
          { id: "go-profile", label: "Completar verificación", target: "/profile" },
        ],
      };
    }
  }

  if (criteria.allowedTerritories?.length && territoryId) {
    if (!criteria.allowedTerritories.includes(territoryId)) {
      return {
        qualified: false,
        reason: "Este programa no está disponible en tu zona. Revisá los territorios incluidos.",
        programId,
      };
    }
  }

  return {
    qualified: true,
    reason: "Cumplís los criterios del programa. Podés solicitar el beneficio.",
    programId,
    requiresVerification: false,
  };
}

/**
 * Convierte EligibilityResult a un mensaje para el Cerebro (CerebroResult.message).
 */
export function eligibilityToMessage(result: EligibilityResult): string {
  return result.reason;
}

/**
 * Convierte EligibilityResult a forma compatible con CerebroResult:
 * message, suggestedActions, requiresValidation. El Cerebro puede usarlo para explicar y pedir verificación.
 */
export function eligibilityToCerebroShape(result: EligibilityResult): {
  message: string;
  suggestedActions: Array<{ id: string; label: string; target?: string }>;
  requiresValidation: boolean;
} {
  return {
    message: result.reason,
    suggestedActions: result.suggestedActions ?? [],
    requiresValidation: result.requiresVerification ?? false,
  };
}

/**
 * Punto de entrada para el Cerebro: evalúa elegibilidad y devuelve mensaje, acciones y si requiere verificación.
 * El Cerebro decide si el usuario califica, explica el motivo y puede requerir verificación adicional.
 */
export function checkProgramEligibilityForCerebro(
  programId: string,
  context: EligibilityContext
): {
  allowed: boolean;
  message: string;
  suggestedActions: Array<{ id: string; label: string; target?: string }>;
  requiresValidation: boolean;
} {
  const result = checkEligibility(programId, context);
  return {
    allowed: result.qualified,
    message: result.reason,
    suggestedActions: result.suggestedActions ?? [],
    requiresValidation: result.requiresVerification ?? false,
  };
}
