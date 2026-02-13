/**
 * Tipos de compliance: auditoría, consentimientos, retención.
 * Eventos sensibles: inmutables, con timestamp y actor. Sin burocracia innecesaria.
 */

/** Acción auditada: qué se hizo. */
export type AuditAction =
  | "login"
  | "logout"
  | "consent_given"
  | "consent_revoked"
  | "wallet_transfer"
  | "wallet_deposit"
  | "biometric_verify"
  | "ai_query"
  | "chat_send"
  | "video_join"
  | "territory_access"
  | "data_export"
  | "account_deleted"
  | string;

/** Recurso afectado (ej. userId, walletId, chatId). */
export type AuditResource = string;

/**
 * Evento de auditoría: inmutable, con timestamp y actor.
 * Todo evento sensible se registra así para trazabilidad legal.
 */
export interface AuditEvent {
  /** ID único del evento (para referencia). */
  id: string;
  /** Qué se hizo. */
  action: AuditAction;
  /** Recurso afectado (userId, walletId, etc.). */
  resource: AuditResource;
  /** Quién realizó la acción (userId o "system"). */
  actor: string;
  /** Timestamp UTC (ms). */
  timestamp: number;
  /** Detalle opcional (sin datos sensibles en texto plano). */
  detail?: Record<string, unknown>;
  /** Versión del esquema (para evolución). */
  schemaVersion?: number;
}

/**
 * Tipos de consentimiento (registro, identidad, datos).
 * Solo se guardan datos personales con consentimiento explícito para el tipo correspondiente.
 * Ver docs/arquitectura/PRIVACIDAD-Y-CONSENTIMIENTOS.md.
 */
export type ConsentType =
  | "cookies_tecnicas"
  | "login_social"
  | "datos_perfil"
  | "biometria"
  | "datos_territoriales"
  | "ia"
  | "comunicaciones"
  | "reportes_pyme_enterprise"
  | "reportes_gobierno"
  | "uso_estadistico_anonimizado";

/**
 * Registro de consentimiento: usuario, tipo, otorgado/revocado, timestamp.
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  /** true = otorgado, false = revocado. */
  granted: boolean;
  timestamp: number;
  /** Versión del texto de consentimiento (opcional). */
  consentVersion?: string;
}

/** Categoría de datos para retención y exportación. */
export type DataCategory =
  | "identity"
  | "wallet"
  | "chat"
  | "video"
  | "ai_interactions"
  | "territory"
  | "audit";

/**
 * Política de retención por categoría (días). 0 = sin límite automático.
 */
export interface RetentionPolicy {
  category: DataCategory;
  /** Días a retener; 0 = no borrar por tiempo. */
  retainDays: number;
  /** Si aplica eliminación lógica al exportar/borrar. */
  logicalDelete: boolean;
}

/** Resultado de exportación de datos del usuario. */
export interface UserDataExport {
  userId: string;
  exportedAt: number;
  categories: DataCategory[];
  /** Referencia a los datos (URL, blob, etc.). */
  payload?: Record<string, unknown>;
}
