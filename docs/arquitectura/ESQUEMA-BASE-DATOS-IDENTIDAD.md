# Esquema de base de datos — Identidad, consentimiento y verificación

Esquema conceptual para el sistema de registro, identidad y recolección legal de datos. Implementar en el motor de persistencia elegido (PostgreSQL, etc.) con las convenciones del proyecto.

---

## 1. Tablas de identidad y registro

### 1.1 `users`

Identidad mínima; sin datos personales sensibles en esta tabla.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID / string | PK, identificador interno del usuario. |
| `created_at` | timestamp | Alta del usuario. |
| `updated_at` | timestamp | Última actualización. |
| `verification_level` | enum | `unverified`, `basic`, `verified`, `trusted`. |
| `primary_role` | string | Rol principal: vale, capeto, kavaju, mbarete, cliente, pyme, enterprise. |
| `registration_layer` | enum | `open` \| `social` \| `verified`. Capa de registro actual. |

### 1.2 `identities_social`

Datos de login social; solo se persisten con consentimiento.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID / string | PK. |
| `user_id` | FK → users.id | Usuario al que pertenece. |
| `provider` | string | `google`, `facebook`, `instagram`. |
| `provider_user_id` | string | ID en el proveedor. |
| `email` | string (nullable) | Email si el proveedor lo otorga. |
| `display_name` | string (nullable) | Nombre mostrado. |
| `avatar_url` | string (nullable) | URL de avatar. |
| `consent_type` | string | Tipo de consentimiento (ej. `login_social`). |
| `consent_version` | string (nullable) | Versión del texto aceptado. |
| `consent_at` | timestamp | Cuándo se otorgó. |
| `created_at` | timestamp | Alta del enlace. |

- Índice único: `(provider, provider_user_id)`.

### 1.3 `consent_records`

Registro de otorgamientos y revocaciones.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID / string | PK. |
| `user_id` | FK → users.id | Usuario. |
| `consent_type` | string | Tipo (ia, biometria, datos_territoriales, login_social, etc.). |
| `granted` | boolean | true = otorgado, false = revocado. |
| `timestamp` | timestamp | Momento del evento. |
| `consent_version` | string (nullable) | Versión del texto. |
| `purpose` | string (nullable) | Propósito opcional para auditoría. |

- Índice: `(user_id, consent_type, timestamp)` para consultar el último estado por tipo.

### 1.4 `verification_events`

Resultados de verificación (documento + biometría); no se guardan documento ni biometría en crudo.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID / string | PK. |
| `user_id` | FK → users.id | Usuario verificado. |
| `document_type` | string | cédula, ruc, etc. |
| `result` | enum | `ok`, `fail`, `pending`. |
| `biometric_level` | smallint (nullable) | Nivel biométrico alcanzado (0–3) si aplica. |
| `verified_at` | timestamp | Momento de la verificación. |
| `metadata` | jsonb (nullable) | Metadatos no identificables (ej. proveedor de verificación). |

### 1.5 `profiles`

Datos extendidos de perfil; solo campos con consentimiento.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `user_id` | FK → users.id | PK. |
| `phone` | string (nullable) | Solo si hay consentimiento. |
| `address` | string (nullable) | Solo si hay consentimiento. |
| `consent_version_profile` | string (nullable) | Versión del consentimiento para este conjunto. |
| `updated_at` | timestamp | Última actualización. |

- Otros campos según necesidad; cada conjunto sensible con su consentimiento y versión.

---

## 2. Auditoría

### 2.1 `audit_events` (existente / ampliado)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID / string | PK. |
| `action` | string | login, consent_given, consent_revoked, biometric_verify, etc. |
| `resource` | string | Recurso afectado (user_id, etc.). |
| `actor` | string | Quién realizó la acción (user_id o "system"). |
| `timestamp` | timestamp | Momento del evento. |
| `detail` | jsonb (nullable) | Detalle sin datos sensibles en texto plano. |
| `schema_version` | int (nullable) | Versión del esquema del evento. |

---

## 3. Almacén anonimizado (Big Data / reportes)

- **No incluir** `user_id` ni claves que permitan re-identificación.
- Ejemplos de tablas/vistas:
  - `agg_activity_by_region`: región, fecha, conteos, KPIs.
  - `agg_usage_by_sector`: sector, métricas de uso.
  - `agg_transactions`: montos agregados, rangos, sin identificadores.

- Pipeline ETL: sistemas transaccionales → transformación/anonimización → escritura en este almacén.

---

## 4. Relación con el código

- Tipos en `src/lib/compliance/compliance.types.ts`: alinear `ConsentType` con los tipos de este diseño.
- Servicio de consentimiento: `giveConsent` / `revokeConsent` / `hasConsent` antes de escribir datos personales.
- Capa de registro: representar `registration_layer` y flujos en tipos (ej. `src/lib/identity/registration.types.ts`).
- Documentos por rol y flujos de verificación: ver `docs/arquitectura/REGISTRO-IDENTIDAD-DATOS.md` sección 5.
