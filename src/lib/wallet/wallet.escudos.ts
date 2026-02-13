/**
 * Sistema de Escudos de YAPÓ: protección financiera por validación.
 * Cada escudo valida una Transaction; NO ejecuta transferencias. SOLO validar.
 * Escudo TERRITORIAL: semáforo (verde/amarillo/rojo) + redZones. Desacoplado de UI.
 */

import type { Transaction, WalletId } from "./wallet.types";
import { getTerritorySemaphore } from "@/lib/territory";

// -----------------------------------------------------------------------------
// Tipos de escudo
// -----------------------------------------------------------------------------

export type EscudoType =
  | "BIOMETRIC"
  | "TIME_DELAY"
  | "AMOUNT_LIMIT"
  | "TERRITORIAL"
  | "ROLE_BASED";

// -----------------------------------------------------------------------------
// Reglas por tipo (discriminado por type)
// -----------------------------------------------------------------------------

export interface EscudoRulesBiometric {
  type: "BIOMETRIC";
  /** Nivel mínimo de biometría (0–3). */
  minLevel: 0 | 1 | 2 | 3;
}

export interface EscudoRulesTimeDelay {
  type: "TIME_DELAY";
  /** Delay mínimo antes de permitir (ms). */
  delayMs: number;
}

export interface EscudoRulesAmountLimit {
  type: "AMOUNT_LIMIT";
  /** Límite por operación o por día (unidad base). */
  limitAmount: number;
  /** Si true, límite es diario (requiere spentToday en contexto). */
  perDay?: boolean;
}

export interface EscudoRulesTerritorial {
  type: "TERRITORIAL";
  /** Zonas donde se bloquea la operación (complemento al semáforo). */
  redZones: Array<{ lat: number; lng: number; radiusMeters: number }>;
  /** Si true, se consulta el semáforo territorial (verde/amarillo/rojo). */
  useSemaphore?: boolean;
}

export interface EscudoRulesRoleBased {
  type: "ROLE_BASED";
  /** Roles que pueden operar; vacío = todos. */
  allowedRoles: string[];
}

export type EscudoRules =
  | EscudoRulesBiometric
  | EscudoRulesTimeDelay
  | EscudoRulesAmountLimit
  | EscudoRulesTerritorial
  | EscudoRulesRoleBased;

// -----------------------------------------------------------------------------
// Escudo
// -----------------------------------------------------------------------------

export interface Escudo {
  id: string;
  type: EscudoType;
  description: string;
  isActive: boolean;
  rules: EscudoRules;
}

// -----------------------------------------------------------------------------
// Contexto de validación (datos para que cada escudo evalúe)
// -----------------------------------------------------------------------------

export interface EscudoValidationContext {
  /** Transacción a validar (o datos mínimos). */
  transaction: Pick<Transaction, "amount" | "fromWalletId" | "toWalletId" | "type">;
  /** Nivel de biometría actual del usuario (0–3). */
  userBiometricLevel?: number;
  /** Ubicación actual (para TERRITORIAL). */
  location?: { lat: number; lng: number };
  /** Roles del usuario (para ROLE_BASED). */
  userRoles?: string[];
  /** Monto ya gastado hoy desde fromWalletId (para AMOUNT_LIMIT perDay). */
  spentToday?: number;
  /** Timestamp de la solicitud (para TIME_DELAY). */
  requestedAt?: number;
}

// -----------------------------------------------------------------------------
// Resultado de validación
// -----------------------------------------------------------------------------

export interface EscudoValidationResult {
  allowed: boolean;
  reason?: string;
  requiredBiometricLevel?: number;
}

// -----------------------------------------------------------------------------
// Validadores por tipo (solo validar; no ejecutar)
// -----------------------------------------------------------------------------

function validateBiometric(
  escudo: Escudo,
  rules: EscudoRulesBiometric,
  ctx: EscudoValidationContext
): EscudoValidationResult {
  const level = ctx.userBiometricLevel ?? 0;
  if (level < rules.minLevel) {
    return {
      allowed: false,
      reason: `Se requiere verificación biométrica nivel ${rules.minLevel} o superior.`,
      requiredBiometricLevel: rules.minLevel,
    };
  }
  return { allowed: true };
}

function validateTimeDelay(
  _escudo: Escudo,
  rules: EscudoRulesTimeDelay,
  _ctx: EscudoValidationContext
): EscudoValidationResult {
  if (rules.delayMs <= 0) return { allowed: true };
  return {
    allowed: true,
    reason: `Esta operación requiere un tiempo de espera de ${rules.delayMs} ms antes de ejecutarse.`,
    requiredBiometricLevel: undefined,
  };
}

function validateAmountLimit(
  _escudo: Escudo,
  rules: EscudoRulesAmountLimit,
  ctx: EscudoValidationContext
): EscudoValidationResult {
  const { amount } = ctx.transaction;
  if (rules.perDay && ctx.spentToday != null) {
    const remaining = Math.max(0, rules.limitAmount - ctx.spentToday);
    if (amount > remaining) {
      return {
        allowed: false,
        reason: `Límite diario: ${rules.limitAmount}. Ya utilizado hoy: ${ctx.spentToday}. Máximo permitido en esta operación: ${remaining}.`,
      };
    }
  } else if (amount > rules.limitAmount) {
    return {
      allowed: false,
      reason: `El monto supera el límite permitido (${rules.limitAmount}).`,
    };
  }
  return { allowed: true };
}

function validateTerritorial(
  _escudo: Escudo,
  rules: EscudoRulesTerritorial,
  ctx: EscudoValidationContext
): EscudoValidationResult {
  const loc = ctx.location;
  if (!loc) return { allowed: true };
  if (rules.useSemaphore) {
    const semaphore = getTerritorySemaphore(loc);
    if (semaphore.state === "red") {
      return {
        allowed: false,
        reason: semaphore.reason ?? "Las operaciones están bloqueadas en esta zona (semáforo rojo).",
      };
    }
    if (semaphore.state === "yellow") {
      return {
        allowed: true,
        reason: semaphore.reason ?? "Zona en validación: se requiere confirmación biométrica.",
        requiredBiometricLevel: 2,
      };
    }
  }
  const inRedZone = rules.redZones.some((z) =>
    inRadius(loc, { lat: z.lat, lng: z.lng }, z.radiusMeters)
  );
  if (inRedZone) {
    return {
      allowed: false,
      reason: "Las operaciones están restringidas en esta zona.",
    };
  }
  return { allowed: true };
}

function validateRoleBased(
  _escudo: Escudo,
  rules: EscudoRulesRoleBased,
  ctx: EscudoValidationContext
): EscudoValidationResult {
  const roles = ctx.userRoles ?? [];
  if (rules.allowedRoles.length === 0) return { allowed: true };
  const hasRole = roles.some((r) => rules.allowedRoles.includes(r));
  if (!hasRole) {
    return {
      allowed: false,
      reason: `Tu rol no está permitido para esta operación. Roles permitidos: ${rules.allowedRoles.join(", ")}.`,
    };
  }
  return { allowed: true };
}

function inRadius(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const R = 6371e3;
  const φ1 = (point.lat * Math.PI) / 180;
  const φ2 = (center.lat * Math.PI) / 180;
  const Δφ = ((center.lat - point.lat) * Math.PI) / 180;
  const Δλ = ((center.lng - point.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radiusMeters;
}

// -----------------------------------------------------------------------------
// API pública: validar un escudo / validar una transacción contra todos los escudos
// -----------------------------------------------------------------------------

/**
 * Valida una transacción contra un escudo. NO ejecuta transferencias. SOLO validar.
 */
export function validateEscudo(
  escudo: Escudo,
  context: EscudoValidationContext
): EscudoValidationResult {
  if (!escudo.isActive) return { allowed: true };

  const { rules } = escudo;
  switch (rules.type) {
    case "BIOMETRIC":
      return validateBiometric(escudo, rules, context);
    case "TIME_DELAY":
      return validateTimeDelay(escudo, rules, context);
    case "AMOUNT_LIMIT":
      return validateAmountLimit(escudo, rules, context);
    case "TERRITORIAL":
      return validateTerritorial(escudo, rules, context);
    case "ROLE_BASED":
      return validateRoleBased(escudo, rules, context);
    default:
      return { allowed: true };
  }
}

/**
 * Valida una transacción contra todos los escudos activos.
 * Devuelve el primer resultado no permitido, o allowed: true si todos pasan.
 * NO ejecuta transferencias. SOLO validar.
 */
export function validateTransaction(
  escudos: Escudo[],
  context: EscudoValidationContext
): EscudoValidationResult {
  for (const escudo of escudos) {
    if (!escudo.isActive) continue;
    const result = validateEscudo(escudo, context);
    if (!result.allowed) {
      return result;
    }
    if (result.requiredBiometricLevel != null) {
      return result;
    }
  }
  return { allowed: true };
}
