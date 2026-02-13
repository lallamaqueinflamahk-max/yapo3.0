# Entregable Legal YAPÓ v2 — Política de Privacidad, Términos y Consentimientos

**Rol:** Abogado digital + arquitecto de producto GovTech / Fintech.  
**Objetivo:** Documentos legales base, sistema de consentimientos y recomendaciones de implementación, con cumplimiento obligatorio LATAM, convenios gubernamentales y aptitud para stores y auditorías.

---

## 1. Cumplimiento de requisitos obligatorios

| Requisito | Dónde se cumple |
|-----------|-----------------|
| **Qué datos personales se recolectan (identificables)** | Política de Privacidad § Definiciones + § 2 (tabla por momento: navegación, login social, perfil, verificación, uso). |
| **Qué datos NO se venden** | Política § Definiciones ("No vendemos datos personales") + § 3 ("Qué datos NO vendemos") + § 7 ("Prohibición de venta de datos identificables"). |
| **Qué datos se anonimizan y agregan** | Política § Definiciones ("Datos anonimizados y agregados") + § 4 (tabla: censo, PyME/Enterprise, Gobierno, mejora producto). |
| **Uso como censo digital laboral** | Política § 5 ("Uso de datos como censo digital laboral"). |
| **Uso estadístico PyMEs, Enterprise y Gobierno** | Política § 6 ("Uso estadístico para PyMEs, empresas y Gobierno"). |
| **Prohibición de venta de datos identificables** | Política § 7 ("Prohibición de venta de datos identificables"). |
| **Checkboxes explícitos e informados** | CONSENTIMIENTOS-ESTRUCTURA § 2 (patrón UI: texto visible, checkbox desmarcado, CTA solo al marcar). |
| **Aceptación de uso de datos anonimizados** | Consentimiento `uso_estadistico_anonimizado`; CONSENTIMIENTOS-ESTRUCTURA § 6. |
| **Registro fecha, versión y usuario** | CONSENTIMIENTOS-ESTRUCTURA § 4 (consent_records: userId, consentType, granted, timestamp, consentVersion). |
| **Versionado de políticas** | Política § 12; Términos § 13; CONSENTIMIENTOS-ESTRUCTURA § 7 (policy_acceptances / registro de versión aceptada). |
| **Documentos base: Política y Términos** | POLITICA-DE-PRIVACIDAD.md, TERMINOS-Y-CONDICIONES.md. |
| **Lenguaje claro, simple y legalmente sólido** | Textos en español, tuteo, secciones numeradas; definiciones al inicio; revisión con asesoría jurídica recomendada. |
| **Compatibilidad LATAM** | Referencia a legislación aplicable (ej. Ley 1682/01 Paraguay); estructura de consentimiento y derechos alineada a la región. |
| **Escalable a convenios gubernamentales** | Política § 5 y § 6 (datos solo anonimizados para Gobierno); CONSENTIMIENTOS § 8. |
| **Apto para stores y auditorías** | Versionado de políticas y registro de aceptación (versión + fecha + usuario); enlaces a Política y Términos; documentación técnica en este entregable. |

---

## 2. Textos legales base

| Documento | Ubicación | Contenido resumido |
|-----------|-----------|--------------------|
| **Política de Privacidad** | [POLITICA-DE-PRIVACIDAD.md](./POLITICA-DE-PRIVACIDAD.md) | Definiciones (identificables, anonimizados, no venta); responsable; qué datos recogemos; qué no vendemos; qué anonimizamos; censo digital laboral; uso estadístico PyME/Enterprise/Gobierno; prohibición venta; conservación; derechos; transferencias; cookies; cambios y versionado. |
| **Términos y Condiciones** | [TERMINOS-Y-CONDICIONES.md](./TERMINOS-Y-CONDICIONES.md) | Aceptación; qué es YAPÓ; registro; uso permitido; servicios; billetera; contenido; privacidad (remisión a Política); propiedad intelectual; limitación responsabilidad; indemnización; resolución conflictos; modificaciones y versionado; vigencia; contacto. |

Ambos en **español**, **lenguaje claro** y con **versión y fecha** para versionado. Sustituir [FECHA] y [correo] antes de publicación.

---

## 3. Estructura técnica de consentimientos

### 3.1 Tipos de consentimiento (códigos)

- `cookies_tecnicas` — Cookies técnicas (informativo).
- `login_social` — Login con red social; guardar nombre, correo, avatar.
- `datos_perfil` — Datos de perfil (teléfono, dirección, etc.).
- `biometria` — Uso de biometría para verificación.
- `datos_territoriales` — Ubicación para ofertas y semáforo.
- `ia` — Uso del asistente IA (Cerebro).
- `comunicaciones` — Emails y notificaciones.
- `reportes_pyme_enterprise` — Inclusión en reportes para PyME/Empresa.
- `reportes_gobierno` — Estadísticas anonimizadas para Gobierno.
- `uso_estadistico_anonimizado` — Aceptación explícita del uso de datos anonimizados (censo, estadísticas, reportes).

### 3.2 Registro por evento (consent_records)

Por cada otorgamiento o revocación se guarda:

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `id` | string (UUID) | Sí |
| `userId` | string | Sí |
| `consentType` | código anterior | Sí |
| `granted` | boolean | Sí (true = otorgado, false = revocado) |
| `timestamp` | number (UTC ms) | Sí |
| `consentVersion` | string (ej. "v1") | Recomendado |
| `purpose` | string | Opcional |

**Consulta de estado:** Para saber si el usuario tiene consentimiento activo para un tipo, se toma el último registro por `userId` + `consentType` (ordenado por `timestamp` desc). Si `granted === true`, está activo.

### 3.3 Versionado de políticas (Privacidad y Términos)

- Cada documento tiene **versión** (ej. 1.0) y **fecha de última actualización**.
- Se recomienda tabla o equivalente: **policy_acceptances** (id, user_id, document_type, version, accepted_at), donde `document_type` es `privacy_policy` o `terms`.
- Alternativa: usar `consent_records` con tipos `politica_privacidad` y `terminos`, y `consentVersion` = versión del documento (ej. "1.0").

Referencia de implementación: `src/lib/compliance/consent.service.ts`, `compliance.types.ts`, `consentTexts.ts`.

---

## 4. Recomendaciones de implementación en frontend

### 4.1 Enlaces a documentos legales

- **Política de Privacidad:** Footer, pantalla de registro, Configuración > Privacidad, y en cada modal de consentimiento ("Ver Política de Privacidad").
- **Términos y Condiciones:** Registro ("Al registrarte aceptas los [Términos y Condiciones]"), footer, Configuración > Legal.
- **Rutas sugeridas:** `/legal/privacidad`, `/legal/terminos` (páginas Next.js que sirvan el contenido de los documentos o lo carguen desde CMS).

### 4.2 Componente de consentimiento (checkbox)

- Mostrar **texto corto** del consentimiento (desde `getConsentText(consentType)` en `consentTexts.ts`).
- **Checkbox desmarcado por defecto.** No premarcar.
- Botón "Aceptar" o "Continuar" **habilitado solo cuando el checkbox está marcado.**
- Enlace a Política de Privacidad (y a Términos si aplica).
- Al aceptar: `POST /api/consent` con `{ consentType, consentVersion, granted: true }`; el backend debe validar sesión, llamar a `giveConsent(userId, consentType, { consentVersion })` y devolver éxito.

### 4.3 Aceptación de Política y Términos en registro

- Pantalla o paso donde se muestre: "Al crear tu cuenta aceptas nuestra [Política de Privacidad] y los [Términos y Condiciones]."
- Checkbox(es) desmarcados: uno por documento o uno conjunto según diseño; CTA "Crear cuenta" habilitado solo al marcar.
- Al crear cuenta: además de los consentimientos por tipo, registrar aceptación de versión vigente de Política y Términos (policy_acceptances o consent_records con versión).

### 4.4 Pantalla "Mis consentimientos"

- En Configuración > Privacidad: listar tipos de consentimiento con estado (Activo/Revocado). Opción de revocar; opcional historial con fecha y versión.
- Incluir opción para aceptar o revocar `uso_estadistico_anonimizado` y `reportes_gobierno` con texto claro.

### 4.5 Accesibilidad y stores

- Textos legibles (tamaño, contraste). Checkbox con label asociado. Botón de aceptación con texto explícito ("Aceptar", "Acepto y continuar").
- Para publicar en App Store / Google Play: asegurar que los enlaces a Política y Términos estén visibles antes del registro y en la app; conservar registro de aceptación de versión para auditoría si lo solicitan.

Documento detallado: [IMPLEMENTACION-FRONTEND.md](./IMPLEMENTACION-FRONTEND.md).

---

## 5. Compatibilidad LATAM, gobierno y auditorías

- **LATAM:** Definiciones y derechos (acceso, rectificación, supresión, limitación, portabilidad, oposición) alineados a leyes de protección de datos de la región. Sustituir referencia normativa según país (ej. Ley 1682/01 Paraguay).
- **Convenios gubernamentales:** Política y Términos dejan claro que los datos compartidos con Gobierno son **anonimizados y agregados**; la estructura de consentimientos permite registrar `reportes_gobierno` y `uso_estadistico_anonimizado`.
- **Stores y auditorías:** Versionado de políticas + registro de fecha, versión y usuario en consentimientos y aceptación de documentos; documentación técnica en este entregable y en CONSENTIMIENTOS-ESTRUCTURA e IMPLEMENTACION-FRONTEND.

---

## 6. Resumen del entregable

| Entregable | Archivo / código |
|------------|------------------|
| **Textos legales base** | POLITICA-DE-PRIVACIDAD.md, TERMINOS-Y-CONDICIONES.md |
| **Estructura técnica de consentimientos** | CONSENTIMIENTOS-ESTRUCTURA.md; consent.service.ts, compliance.types.ts, consentTexts.ts (incl. uso_estadistico_anonimizado y versionado políticas) |
| **Recomendaciones implementación frontend** | IMPLEMENTACION-FRONTEND.md; este documento § 4 |
| **Checklist requisitos obligatorios** | Este documento § 1 |
| **Compatibilidad LATAM, gobierno, stores** | Política y Términos; este documento § 5 |

*Revisar con asesoría jurídica antes de publicación oficial. Versión documentos: 1.0.*
