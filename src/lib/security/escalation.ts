/**
 * Escalación de seguridad — shouldEscalate(context).
 * true si: monto alto, rol sensible, acción crítica.
 * Preparado para exigir biometría / 2FA en flujos sensibles.
 */

export type EscalationRole = "vale" | "capeto" | "kavaju" | "mbarete" | "cliente" | "pyme" | "enterprise";

/** Impacto del flujo: bajo, medio, alto (ej. ver saldo vs transferir vs admin). */
export type EscalationImpact = "low" | "medium" | "high";

export interface EscalationContext {
  /** Monto involucrado (ej. transferencia). 0 si no aplica. */
  monto: number;
  /** Rol del usuario. */
  rol: EscalationRole | string;
  /** Impacto / criticidad de la acción. */
  impacto: EscalationImpact;
}

export interface EscalationResult {
  /** true si se debe escalar (exigir biometría / 2FA / confirmación adicional). */
  shouldEscalate: boolean;
  reason?: string;
}

const MONTO_UMBRAL_ALTO = 1_000_000;
const MONTO_UMBRAL_MEDIO = 100_000;

/** Roles sensibles (privilegios altos). */
const ROLES_SENSIBLES = ["mbarete", "kavaju"];

/**
 * true si: monto alto, rol sensible, o acción crítica (impacto high).
 */
export function shouldEscalate(context: EscalationContext): EscalationResult {
  const { monto, rol, impacto } = context;
  const roleStr = (rol ?? "").toString().toLowerCase();

  if (impacto === "high") {
    return {
      shouldEscalate: true,
      reason: "Acción crítica requiere verificación adicional.",
    };
  }

  if (monto >= MONTO_UMBRAL_ALTO) {
    return {
      shouldEscalate: true,
      reason: `Monto (${monto}) supera umbral de escalación (${MONTO_UMBRAL_ALTO}).`,
    };
  }

  if (monto >= MONTO_UMBRAL_MEDIO && impacto === "medium") {
    return {
      shouldEscalate: true,
      reason: `Monto (${monto}) e impacto medio requieren verificación adicional.`,
    };
  }

  if (ROLES_SENSIBLES.includes(roleStr) && monto > 0 && impacto === "medium") {
    return {
      shouldEscalate: true,
      reason: "Rol sensible y monto involucrado: verificación adicional recomendada.",
    };
  }

  return { shouldEscalate: false };
}

/** Alias para compatibilidad. */
export function shouldEscalateSecurity(context: EscalationContext): EscalationResult {
  return shouldEscalate(context);
}
