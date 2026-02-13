/**
 * Servicio de consentimientos: IA, biometría, datos territoriales.
 * Flujo: otorgar / revocar; consultar si tiene consentimiento. Sin frenar UX.
 */

import type { ConsentRecord, ConsentType } from "./compliance.types";
import { audit } from "./audit.log";

const records: ConsentRecord[] = [];

function nextId(): string {
  return `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Otorga consentimiento para un tipo. Registra en auditoría.
 */
export function giveConsent(
  userId: string,
  consentType: ConsentType,
  options?: { consentVersion?: string }
): ConsentRecord {
  const record: ConsentRecord = {
    id: nextId(),
    userId,
    consentType,
    granted: true,
    timestamp: Date.now(),
    consentVersion: options?.consentVersion,
  };
  records.push(record);
  audit({
    action: "consent_given",
    resource: userId,
    actor: userId,
    detail: { consentType, consentVersion: options?.consentVersion },
  });
  return record;
}

/**
 * Revoca consentimiento. Registra en auditoría.
 */
export function revokeConsent(userId: string, consentType: ConsentType): ConsentRecord {
  const record: ConsentRecord = {
    id: nextId(),
    userId,
    consentType,
    granted: false,
    timestamp: Date.now(),
  };
  records.push(record);
  audit({
    action: "consent_revoked",
    resource: userId,
    actor: userId,
    detail: { consentType },
  });
  return record;
}

/**
 * Indica si el usuario tiene consentimiento activo para ese tipo.
 * Se considera activo el último registro: granted = true.
 */
export function hasConsent(userId: string, consentType: ConsentType): boolean {
  const userRecords = records
    .filter((r) => r.userId === userId && r.consentType === consentType)
    .sort((a, b) => b.timestamp - a.timestamp);
  const latest = userRecords[0];
  return latest?.granted ?? false;
}

/**
 * Devuelve todos los registros de consentimiento del usuario (para exportación).
 */
export function getConsents(userId: string): readonly ConsentRecord[] {
  return records.filter((r) => r.userId === userId);
}

/**
 * Requiere consentimiento para una acción: devuelve true si puede proceder.
 * No bloquea UX: el caller decide si mostrar banner o continuar.
 */
export function requireConsent(userId: string, consentType: ConsentType): boolean {
  return hasConsent(userId, consentType);
}
