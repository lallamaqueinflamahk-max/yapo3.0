# Arquitectura YAPÓ — Registro, identidad y datos

Documentos de diseño para el sistema de registro, identidad y recolección legal de datos (GovTech / Fintech).

| Documento | Contenido |
|----------|------------|
| [REGISTRO-IDENTIDAD-DATOS.md](./REGISTRO-IDENTIDAD-DATOS.md) | Sistema completo: 3 capas de registro, consentimiento, separación datos personales/anonimizados, dashboards y reportes, documentos por rol, flujos de verificación, Master Key DEV. |
| [PRIVACIDAD-Y-CONSENTIMIENTOS.md](./PRIVACIDAD-Y-CONSENTIMIENTOS.md) | Política de privacidad base y textos de consentimiento por tipo (login social, biometría, territoriales, IA, reportes, etc.). |
| [ESQUEMA-BASE-DATOS-IDENTIDAD.md](./ESQUEMA-BASE-DATOS-IDENTIDAD.md) | Esquema conceptual de base de datos: users, identities_social, consent_records, verification_events, profiles, audit; almacén anonimizado. |

**Código relacionado**

- Consentimientos: `src/lib/compliance/consent.service.ts`, `compliance.types.ts` (ConsentType ampliado).
- Identidad y registro: `src/lib/identity/registration.types.ts`, `DOCUMENTS_BY_ROLE`, `getDocumentsForRole`.
- Master Key DEV: `src/lib/auth/dev/masterKey.ts` (solo desarrollo).
