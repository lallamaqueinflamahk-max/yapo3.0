/**
 * Capa de compliance: auditoría, consentimientos, retención.
 * Eventos sensibles: inmutables, con timestamp y actor. Sin frenar producto ni UX.
 */

export type {
  AuditEvent,
  AuditAction,
  AuditResource,
  ConsentType,
  ConsentRecord,
  DataCategory,
  RetentionPolicy,
  UserDataExport,
} from "./compliance.types";

export {
  audit,
  getEventsByActor,
  getEventsByResource,
  getEventsInRange,
  getAllEvents,
  exampleLegalLogEvent,
} from "./audit.log";

export {
  giveConsent,
  revokeConsent,
  hasConsent,
  getConsents,
  requireConsent,
} from "./consent.service";

export {
  getRetentionPolicy,
  prepareUserDataExport,
  logicalDelete,
  isLogicallyDeleted,
  getAuditEventsForLegal,
} from "./data.retention";
export type { LogicalDeleteResult } from "./data.retention";

export {
  CONSENT_TEXTS,
  getConsentText,
  getConsentVersion,
} from "./consentTexts";
export type { ConsentTextEntry } from "./consentTexts";
