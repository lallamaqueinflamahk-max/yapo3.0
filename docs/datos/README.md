# Censo Digital YAPÓ — Modelo de Datos y Big Data

Diseño de la base de datos del Censo Digital: separación estricta identificables vs anonimizados, entidades, esquemas SQL/NoSQL, reglas de anonimización, servicios de agregación y exportación segura. GovTech / Big Data.

---

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [MODELO-DATOS-CENSO-COMPLETO.md](./MODELO-DATOS-CENSO-COMPLETO.md) | **Modelo completo obligatorio:** separación estricta PRIVADA (identificables) vs COMERCIALIZABLE (anonimizados). Entidades: identidad, perfil laboral, formación, certificaciones, historial laboral, desempeño/reputación, territorio/GPS, escudos y beneficios, wallet, snapshots estadísticos. Diagramas lógicos. Analítica: KPIs, reportes por zona, impacto capacitaciones, métricas sponsors, informes gobierno. |
| [MODELO-DATOS-CENSO-DIGITAL.md](./MODELO-DATOS-CENSO-DIGITAL.md) | Modelo de datos (versión resumida): entidades principales, PERSONAL vs STATS, diagramas. |
| [REGLAS-ANONIMIZACION.md](./REGLAS-ANONIMIZACION.md) | Reglas de anonimización: supresión, generalización, agregación, k-anonimidad. Por tipo de dato (identificadores, demografía, territorio, montos, uso). |
| [ESQUEMAS-SQL-NOSQL-Y-EXPORT.md](./ESQUEMAS-SQL-NOSQL-Y-EXPORT.md) | Esquemas SQL (PostgreSQL) PERSONAL y STATS; sugerencia NoSQL para eventos; servicios de agregación (ETL); dashboards, KPIs laborales, métricas sponsors; exportación segura y compatibilidad gobierno. |

---

## Principios

- **PERSONAL:** Datos identificables; acceso restringido; solo con consentimiento; nunca se exportan como estadística.
- **STATS:** Solo agregados y datos anonimizados; sin `user_id` ni claves que reidentifiquen; fuente de dashboards, reportes por zona, gobierno y sponsors.
- **Pipeline:** PERSONAL → ETL (anonimización) → STATS. No reversible.

---

## Relación con el resto del proyecto

- Identidad y consentimiento: `docs/arquitectura/ESQUEMA-BASE-DATOS-IDENTIDAD.md`, `src/lib/compliance`.
- Privacidad y censo: `docs/legal/POLITICA-DE-PRIVACIDAD.md` (uso como censo digital, no venta de identificables).
