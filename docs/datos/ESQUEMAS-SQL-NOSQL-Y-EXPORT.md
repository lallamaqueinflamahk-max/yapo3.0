# Esquemas SQL/NoSQL, Servicios de Agregación y Exportación Segura — Censo Digital YAPÓ

Esquemas concretos, servicios de agregación, dashboards estadísticos, KPIs laborales, métricas para sponsors y exportación segura compatible con gobierno.

---

## 1. Esquemas SQL sugeridos (PostgreSQL)

### 1.1 Schema PERSONAL (datos identificables)

```sql
-- Personas (trabajadores); solo con consentimiento
CREATE SCHEMA IF NOT EXISTS personal;

CREATE TABLE personal.persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  document_type VARCHAR(50),
  document_number VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  address_region VARCHAR(20),
  address_city VARCHAR(100),
  consent_census BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc VARCHAR(20) UNIQUE NOT NULL,
  legal_name VARCHAR(500) NOT NULL,
  trade_name VARCHAR(255),
  sector VARCHAR(100),
  size VARCHAR(20) CHECK (size IN ('pyme', 'enterprise')),
  address_region VARCHAR(20),
  address_city VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.company_representatives (
  company_id UUID NOT NULL REFERENCES personal.companies(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  role VARCHAR(50),
  verified_at TIMESTAMPTZ,
  PRIMARY KEY (company_id, user_id)
);

CREATE TABLE personal.person_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id),
  institution_name VARCHAR(255),
  level VARCHAR(50),
  title VARCHAR(255),
  year_from SMALLINT,
  year_to SMALLINT,
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE personal.person_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id),
  name VARCHAR(255),
  issuer VARCHAR(255),
  issued_at DATE,
  expires_at DATE,
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE personal.labor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id),
  company_id UUID NOT NULL REFERENCES personal.companies(id),
  role VARCHAR(100),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  contract_type VARCHAR(50)
);

CREATE TABLE personal.person_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy_m INTEGER,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  purpose VARCHAR(50)
);

CREATE TABLE personal.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type VARCHAR(100),
  screen VARCHAR(255),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id),
  balance BIGINT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PYG',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES personal.wallets(id),
  type VARCHAR(50),
  amount BIGINT NOT NULL,
  reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20)
);

-- Perfil laboral
CREATE TABLE personal.labor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL UNIQUE REFERENCES personal.persons(id) ON DELETE CASCADE,
  summary TEXT,
  skills JSONB,
  preferred_sectors VARCHAR(100)[],
  preferred_region VARCHAR(20),
  availability VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.labor_profile_skills (
  labor_profile_id UUID NOT NULL REFERENCES personal.labor_profiles(id) ON DELETE CASCADE,
  skill_code VARCHAR(100) NOT NULL,
  level VARCHAR(20),
  PRIMARY KEY (labor_profile_id, skill_code)
);

-- Historial laboral (CV / empleos previos)
CREATE TABLE personal.labor_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id) ON DELETE CASCADE,
  role VARCHAR(200),
  sector VARCHAR(100),
  start_date DATE,
  end_date DATE,
  reason_end VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desempeño y reputación
CREATE TABLE personal.performance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id) ON DELETE CASCADE,
  type VARCHAR(50),
  score SMALLINT,
  from_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE personal.reputation_scores (
  person_id UUID PRIMARY KEY REFERENCES personal.persons(id) ON DELETE CASCADE,
  trust_score SMALLINT CHECK (trust_score >= 0 AND trust_score <= 100),
  last_calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE personal.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES personal.persons(id) ON DELETE CASCADE,
  badge_type VARCHAR(100),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID
);

-- Escudos y beneficios
CREATE TABLE personal.user_escudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  escudo_id VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  region_code VARCHAR(20)
);

CREATE TABLE personal.benefit_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  benefit_type VARCHAR(100),
  reference VARCHAR(255),
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persons_region ON personal.persons(address_region);
CREATE INDEX idx_labor_company ON personal.labor_relationships(company_id);
CREATE INDEX idx_usage_events_user_created ON personal.usage_events(user_id, created_at);
CREATE INDEX idx_performance_events_person ON personal.performance_events(person_id, created_at);
CREATE INDEX idx_user_escudos_user ON personal.user_escudos(user_id, escudo_id);
```

### 1.2 Schema STATS (solo agregados y snapshots; sin FKs a PERSONAL)

```sql
CREATE SCHEMA IF NOT EXISTS stats;

-- Período: 'YYYY-MM' o 'YYYY'
CREATE TABLE stats.persons_by_region (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  role_type VARCHAR(50),
  age_range VARCHAR(20),
  gender_aggregate VARCHAR(20),
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (region_code, period, role_type, age_range, gender_aggregate)
);

CREATE TABLE stats.companies_by_region (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  size VARCHAR(20),
  sector_code VARCHAR(50),
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (region_code, period, size, sector_code)
);

CREATE TABLE stats.labor_by_region (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  hires_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  contract_type_aggregate VARCHAR(50),
  PRIMARY KEY (region_code, period, contract_type_aggregate)
);

CREATE TABLE stats.usage_daily (
  date DATE NOT NULL,
  region_code VARCHAR(20),
  role_type VARCHAR(50),
  events_count INTEGER NOT NULL DEFAULT 0,
  unique_sessions_estimate INTEGER,
  PRIMARY KEY (date, region_code, role_type)
);

CREATE TABLE stats.wallet_by_region (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  volume_bucket VARCHAR(50),
  active_wallets_count INTEGER,
  PRIMARY KEY (region_code, period, volume_bucket)
);

CREATE TABLE stats.semaphore_by_region (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  green_pct NUMERIC(5,2),
  yellow_pct NUMERIC(5,2),
  red_pct NUMERIC(5,2),
  territories_count INTEGER,
  PRIMARY KEY (region_code, period)
);

-- Impacto de capacitaciones (anonimizado)
CREATE TABLE stats.training_impact (
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  education_level VARCHAR(50),
  certifications_count INTEGER NOT NULL DEFAULT 0,
  hires_after_training_count INTEGER,
  PRIMARY KEY (region_code, period, education_level)
);

-- Snapshots estadísticos anonimizados (censo, KPIs, sponsors, gobierno)
CREATE TABLE stats.snapshots_census (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  persons_count INTEGER NOT NULL DEFAULT 0,
  companies_count INTEGER NOT NULL DEFAULT 0,
  labor_active_count INTEGER,
  education_breakdown JSONB,
  escudos_active_count JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stats.snapshots_kpis (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  hires_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  offers_published INTEGER,
  offers_filled INTEGER,
  training_completions_count INTEGER,
  avg_trust_score_bucket VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stats.snapshots_sponsors (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  region_code VARCHAR(20),
  period VARCHAR(10) NOT NULL,
  reach_count INTEGER,
  activations_count INTEGER,
  redemptions_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stats.snapshots_government (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  region_code VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  indicators JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Particionamiento recomendado por period para tablas grandes
-- CREATE TABLE stats.* (...) PARTITION BY RANGE (period);
```

---

## 2. NoSQL sugerido (eventos y uso)

Para alta escritura de eventos de uso, opción **MongoDB** o **Cassandra**:

- **Colección / tabla:** `usage_events` (por usuario, TTL o retención por política).
- **Campos:** `user_id`, `event_type`, `screen`, `payload` (sin PII), `created_at`.
- **Uso:** Consumir en batch (Spark, job ETL) para agregar por día/región/rol y escribir en STATS SQL. No exponer documentos con `user_id` fuera del sistema autorizado.
- **Alternativa:** Stream (Kafka) → agregación en tiempo real → escritura en STATS (conteos por ventana de tiempo).

---

## 3. Servicios de agregación

### 3.1 Responsabilidad

- Leer solo de PERSONAL (o de copia staging con control de acceso).
- Aplicar reglas de anonimización (ver `REGLAS-ANONIMIZACION.md`): generalización, supresión de IDs, k-anonimidad.
- Escribir solo en STATS; no escribir nunca identificadores en STATS.

### 3.2 Jobs sugeridos

| Job | Fuente (PERSONAL) | Destino (STATS) | Frecuencia |
|-----|--------------------|-----------------|------------|
| `agg_persons_by_region` | `persons` + `users` | `stats.persons_by_region` | Diario |
| `agg_companies_by_region` | `companies` | `stats.companies_by_region` | Diario |
| `agg_labor_by_region` | `labor_relationships`, `job_applications` | `stats.labor_by_region` | Diario |
| `agg_usage_daily` | `usage_events` | `stats.usage_daily` | Diario (ventana D-1) |
| `agg_wallet_by_region` | `wallet_transactions` + `persons.address_region` | `stats.wallet_by_region` | Diario |
| `agg_semaphore_by_region` | `territory_semaphore_snapshots` + territorios | `stats.semaphore_by_region` | Diario |
| `agg_education_training_impact` | `person_education`, `person_certifications`, `labor_relationships` | `stats.education_by_region`, `stats.training_impact` | Diario |
| `agg_escudos_benefits` | `user_escudos`, `benefit_redemptions` | tablas stats por región/periodo (conteos) | Diario |
| `snapshot_census` | Tablas stats existentes | `stats.snapshots_census` | Semanal/Mensual |
| `snapshot_kpis` | `labor_by_region`, etc. | `stats.snapshots_kpis` | Semanal/Mensual |
| `snapshot_government` | Snapshots + indicadores acordados | `stats.snapshots_government` | Según convenio |

### 3.3 Ejemplo de lógica (pseudocódigo)

```
agg_persons_by_region:
  - SELECT address_region AS region_code, primary_role AS role_type,
           age_range(birth_date) AS age_range, gender, COUNT(*)
    FROM personal.persons p
    JOIN users u ON p.user_id = u.id
    WHERE p.consent_census = true
    GROUP BY region_code, period (e.g. current month), role_type, age_range, gender
  - Aplicar k-anonimidad: si count < K, suprimir fila o agrupar en "Otros"
  - INSERT en stats.persons_by_region (sin user_id ni person_id)
```

---

## 4. Dashboards estadísticos y KPIs

### 4.1 Dashboards internos

- **Censo por región:** Conteos de personas y empresas por `region_code`, período, rol, sector; gráficos de evolución.
- **Actividad laboral:** Contrataciones y postulaciones por región/sector; ofertas publicadas vs cubiertas.
- **Uso de plataforma:** Sesiones, eventos por pantalla, adopción de funciones por región/rol.
- **Semáforo:** Distribución verde/amarillo/rojo por zona y período.
- **Wallet (simulado):** Número de transacciones y volumen en rangos por región.

Fuente de datos: **solo schema STATS.** Control de acceso por rol (ej. equipo producto, analytics).

### 4.2 Reportes por zona

- Export o API por `region_code` (departamento/distrito): totales y KPIs por período.
- Formato: CSV/Parquet o API JSON con esquema fijo; sin IDs ni datos identificables.

### 4.3 KPIs laborales (ejemplos)

| KPI | Definición | Fuente STATS |
|-----|------------|--------------|
| Trabajadores registrados por región | Conteo por region_code, period, role_type | `persons_by_region` |
| Empresas activas por sector | Conteo por sector_code, size, period | `companies_by_region` |
| Contrataciones por mes/región | Suma de hires por region, period | `labor_by_region` |
| Postulaciones por oferta (agregado) | applications_count por región/sector | `labor_by_region` |
| Ofertas publicadas / cubiertas | offers_count, filled_count por sector/región | `stats_offers_by_sector` (ver modelo) |

### 4.4 Impacto de capacitaciones

- **Fuente STATS:** `stats.training_impact`, `stats.education_by_region`, `stats.certifications_by_sector`.
- **Indicadores:** Personas por nivel de formación y región; certificaciones completadas por sector/período; contrataciones posteriores a formación (conteos anonimizados, sin vincular personas).
- **Uso:** Reportes de impacto de programas de capacitación para gobierno o sponsors; solo agregados.

### 4.5 Métricas para sponsors

- **Fuente STATS:** `stats.snapshots_sponsors`, adopción de escudos/beneficios por región/periodo.
- Vistas o APIs por contrato (solo regiones o sectores acordados). KPIs: alcance, activaciones, canjes; sin datos identificables.

### 4.6 Informes para gobierno

- **Fuente STATS:** `stats.snapshots_government`, `stats.snapshots_census`, `stats.snapshots_kpis`.
- Esquema estable de indicadores (empleo, formalización, sectores) por `region_code` y `period`; exportación segura según convenio; solo agregados.

---

## 5. Procesos de anonimización

- **Reglas detalladas:** Ver `REGLAS-ANONIMIZACION.md` (supresión de IDs, generalización de edad/ubicación/montos, k-anonimidad).
- **Pipeline:** Los jobs de agregación (§ 3) leen de PERSONAL, aplican estas reglas en el ETL y escriben solo en STATS. No se persiste ningún identificador en STATS.
- **Auditoría:** Documentar para cada tabla STATS las tablas PERSONAL de origen y la regla aplicada (agregación, generalización, supresión).

---

## 6. Exportación segura de estadísticas

### 6.1 Principios

- Origen: **solo schema STATS** (o vistas sobre STATS).
- No incluir nunca `user_id`, `person_id`, `company_id`, documentos, contactos ni coordenadas.
- Aplicar k-anonimidad antes de exportar (suprimir celdas con conteo < k).
- Registrar exportaciones en auditoría: quién, cuándo, qué conjunto (ej. región, período), propósito.

### 6.2 Flujo recomendado

1. **Solicitud:** Rol autorizado solicita export (por región, período, tipo de KPI).
2. **Validación:** Servicio comprueba permisos y que el conjunto solicitado esté permitido (acuerdo gobierno, sponsor, interno).
3. **Generación:** Query solo sobre STATS; aplicar reglas de supresión (k-anonimidad).
4. **Entrega:** Archivo en almacén seguro (S3, blob) con acceso temporal o API de descarga con token.
5. **Auditoría:** Evento `data_export` con actor, recurso (ej. "stats.labor_by_region"), timestamp, propósito.

### 6.3 Compatibilidad con gobierno

- **Esquema fijo:** Definir contrato/convenio con ente público: nombres de indicadores, region_code (estándar oficial), período, formato (CSV, JSON schema).
- **Solo agregados:** Entregar únicamente tablas/vistas que ya cumplan reglas de anonimización; sin acceso a PERSONAL.
- **Actualización:** Exportaciones periódicas (ej. mensual) con mismo esquema para series temporales.

---

## 7. Cumplimiento, escalabilidad y gobierno (resumen)

| Requisito | Cómo se garantiza |
|-----------|--------------------|
| **Cumplimiento legal** | Separación PERSONAL/STATS; consentimiento antes de escribir en PERSONAL; retención y auditoría; sin venta de identificables. |
| **Escalabilidad nacional** | `region_code` estándar; particionamiento por período/región; agregación en batch; STATS como única fuente de reportes. |
| **Compatibilidad gobierno** | Esquema estable de export; solo STATS; k-anonimidad; acuerdos que definan indicadores y formato. |

Documentos relacionados: `MODELO-DATOS-CENSO-DIGITAL.md`, `MODELO-DATOS-CENSO-COMPLETO.md`, `REGLAS-ANONIMIZACION.md`. Código de identidad y consentimiento: `docs/arquitectura/ESQUEMA-BASE-DATOS-IDENTIDAD.md`, `src/lib/compliance`.
