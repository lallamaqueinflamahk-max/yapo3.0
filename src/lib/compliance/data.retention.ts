/**
 * Retención de datos: políticas, exportación de datos del usuario, eliminación lógica.
 * Trazabilidad legal sin burocracia innecesaria.
 */

import type { DataCategory, RetentionPolicy, UserDataExport } from "./compliance.types";
import { getEventsByResource, getEventsInRange } from "./audit.log";
import { getConsents } from "./consent.service";

const DEFAULT_RETAIN_DAYS = 365;
const policies: RetentionPolicy[] = [
  { category: "identity", retainDays: 0, logicalDelete: true },
  { category: "wallet", retainDays: 0, logicalDelete: true },
  { category: "chat", retainDays: DEFAULT_RETAIN_DAYS, logicalDelete: true },
  { category: "video", retainDays: 90, logicalDelete: true },
  { category: "ai_interactions", retainDays: 180, logicalDelete: true },
  { category: "territory", retainDays: 90, logicalDelete: true },
  { category: "audit", retainDays: 0, logicalDelete: false },
];

/**
 * Devuelve la política de retención para una categoría.
 */
export function getRetentionPolicy(category: DataCategory): RetentionPolicy | undefined {
  return policies.find((p) => p.category === category);
}

/**
 * Prepara la exportación de datos del usuario: auditoría + consentimientos.
 * No incluye datos sensibles en texto plano; devuelve referencias y metadatos.
 * El caller (API/worker) puede adjuntar payload real según categorías.
 */
export function prepareUserDataExport(userId: string): UserDataExport {
  const auditEvents = getEventsByResource(userId);
  const consentRecords = getConsents(userId);
  const exportedAt = Date.now();
  return {
    userId,
    exportedAt,
    categories: ["identity", "wallet", "chat", "video", "ai_interactions", "territory", "audit"],
    payload: {
      auditEvents: auditEvents.map((e) => ({
        id: e.id,
        action: e.action,
        resource: e.resource,
        actor: e.actor,
        timestamp: e.timestamp,
        schemaVersion: e.schemaVersion,
      })),
      consentRecords: consentRecords.map((r) => ({
        id: r.id,
        consentType: r.consentType,
        granted: r.granted,
        timestamp: r.timestamp,
        consentVersion: r.consentVersion,
      })),
    },
  };
}

/**
 * Marca eliminación lógica del usuario (no borra datos; marca para retención/anonimización).
 * La trazabilidad legal se mantiene: auditoría conserva que se solicitó borrado.
 */
export interface LogicalDeleteResult {
  userId: string;
  deletedAt: number;
  categoriesMarked: DataCategory[];
}

const logicallyDeleted = new Set<string>();

export function logicalDelete(userId: string): LogicalDeleteResult {
  logicallyDeleted.add(userId);
  const categories = policies.filter((p) => p.logicalDelete).map((p) => p.category);
  return {
    userId,
    deletedAt: Date.now(),
    categoriesMarked: categories,
  };
}

/**
 * Indica si el usuario tiene eliminación lógica activa.
 */
export function isLogicallyDeleted(userId: string): boolean {
  return logicallyDeleted.has(userId);
}

/**
 * Devuelve eventos de auditoría en rango (para reportes legales).
 */
export function getAuditEventsForLegal(
  fromTs: number,
  toTs: number
): ReturnType<typeof getEventsInRange> {
  return getEventsInRange(fromTs, toTs);
}
