/**
 * Log de auditoría: append-only, inmutable.
 * Todo evento sensible tiene timestamp y actor. Trazabilidad legal.
 */

import type { AuditEvent, AuditAction, AuditResource } from "./compliance.types";

const SCHEMA_VERSION = 1;
const events: AuditEvent[] = [];

function nextId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Registra un evento de auditoría. Inmutable: no se modifica después de escribir.
 * Todo evento sensible debe pasar por aquí.
 */
export function audit(params: {
  action: AuditAction;
  resource: AuditResource;
  actor: string;
  detail?: Record<string, unknown>;
}): AuditEvent {
  const event: AuditEvent = {
    id: nextId(),
    action: params.action,
    resource: params.resource,
    actor: params.actor,
    timestamp: Date.now(),
    detail: params.detail,
    schemaVersion: SCHEMA_VERSION,
  };
  events.push(event);
  return event;
}

/**
 * Devuelve eventos por actor (quién hizo). Solo lectura; no expone mutación.
 */
export function getEventsByActor(actor: string): readonly AuditEvent[] {
  return events.filter((e) => e.actor === actor);
}

/**
 * Devuelve eventos por recurso (qué se afectó). Solo lectura.
 */
export function getEventsByResource(resource: AuditResource): readonly AuditEvent[] {
  return events.filter((e) => e.resource === resource);
}

/**
 * Devuelve eventos en un rango de tiempo (para exportación o reportes).
 */
export function getEventsInRange(fromTs: number, toTs: number): readonly AuditEvent[] {
  return events.filter((e) => e.timestamp >= fromTs && e.timestamp <= toTs);
}

/**
 * Devuelve todos los eventos (solo lectura). Para exportación de datos del usuario.
 */
export function getAllEvents(): readonly AuditEvent[] {
  return events;
}

/**
 * Ejemplo de log legal válido: evento inmutable con timestamp y actor.
 * Cumple trazabilidad: qué (action), quién (actor), cuándo (timestamp), sobre qué (resource).
 * Sin datos sensibles en texto plano en detail; opcional consentVersion para evidencias.
 */
export function exampleLegalLogEvent(): AuditEvent {
  return audit({
    action: "consent_given",
    resource: "user-u123",
    actor: "u123",
    detail: {
      consentType: "ia",
      consentVersion: "1.0",
      ipHint: "anonymized",
    },
  });
}
