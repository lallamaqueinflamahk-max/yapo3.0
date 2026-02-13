# Sistema de Registro, Identidad y Recolección Legal de Datos — YAPÓ

**Rol:** Arquitecto senior plataforma GovTech / Fintech.  
**Objetivo:** Diseño completo de registro, identidad y recolección legal de datos.

---

## 1. Registro en 3 capas

### 1.1 Capa 1: Open Access (sin login)

| Aspecto | Definición |
|--------|------------|
| **Alcance** | Navegación pública: landing, contenido informativo, búsqueda de ofertas, precios, FAQ. |
| **Datos** | Ningún dato personal persistido. Opcional: cookies técnicas (sesión anónima, preferencia de idioma). |
| **Identidad** | `anonymous` o `guest`. No se exige email ni teléfono. |
| **Límites** | No puede: transferir dinero, chatear 1:1, subir contenido, acceder a wallet ni datos personales. |
| **Consentimiento** | Solo consentimiento para cookies técnicas (si aplica). No se pide consentimiento para datos personales. |

### 1.2 Capa 2: Login social (Google, Facebook, Instagram)

| Aspecto | Definición |
|--------|------------|
| **Alcance** | Acceso a app con identidad social: feed, aplicaciones a ofertas, chat (según políticas), perfil básico. |
| **Proveedores** | OAuth2 / OpenID: Google, Facebook (Meta), Instagram (API permitida). |
| **Datos mínimos** | `provider`, `providerUserId`, `email` (si otorgado), `displayName`, `avatarUrl`. Solo los que el usuario autoriza al conectar la app. |
| **Identidad** | `userId` interno; `verificationLevel: "basic"`; rol asignable (ej. vale, cliente) según flujo de onboarding. |
| **Consentimiento** | Explícito en el momento de "Continuar con Google/Facebook/Instagram": se muestra qué datos se leerán y para qué; solo se guardan si el usuario acepta. |
| **Persistencia** | Solo tras consentimiento explícito; datos en tabla/categoría "identidad_social" con propósito y versión de consentimiento. |

### 1.3 Capa 3: Registro verificado + biometría

| Aspecto | Definición |
|--------|------------|
| **Alcance** | Operaciones sensibles: wallet, transferencias, contratos, roles laborales (vale, capeto, kavaju, mbarete), subsidios. |
| **Verificación** | Flujo KYC según documento por rol (ver sección 5): cédula, RUC, etc. Comparación con datos de login social o formulario. |
| **Biometría** | Captura y verificación facial y/o dactilar; resultado (pass/fail + nivel) se guarda como evento de verificación, no la biometría en crudo. |
| **Identidad** | `verificationLevel: "verified"` o `"trusted"`; documentos asociados; nivel biométrico alcanzado. |
| **Consentimiento** | Consentimiento específico: (1) tratamiento de datos personales para verificación, (2) uso de biometría, (3) compartir con partners si aplica. Sin consentimiento no se guardan datos personales ni biométricos. |

**Transiciones entre capas**

- Open → Social: usuario elige "Iniciar sesión con Google/Facebook/Instagram".
- Social → Verificado: usuario inicia flujo de verificación (documentos + biometría); solo se persisten datos con consentimiento explícito en cada paso.

---

## 2. Guardar datos SOLO con consentimiento explícito

### 2.1 Principio

- **Ningún dato personal** (nombre, email, teléfono, documento, biometría, ubicación precisa) se persiste sin consentimiento explícito, registrado (qué, cuándo, versión del texto).
- **Consentimiento** = acción afirmativa (checkbox + botón "Aceptar", no pre-marcado); identificado por tipo, versión y timestamp.

### 2.2 Tipos de consentimiento (alineados a código existente y ampliados)

| Tipo | Propósito | Cuándo se pide |
|------|-----------|----------------|
| `cookies_tecnicas` | Sesión anónima, idioma | Open access, primer uso |
| `login_social` | Leer y guardar email, nombre, avatar del proveedor | Al conectar Google/Facebook/Instagram |
| `datos_perfil` | Guardar perfil extendido (teléfono, dirección) | Formulario de perfil |
| `biometria` | Captura y verificación biométrica | Flujo de verificación / alta seguridad |
| `datos_territoriales` | Ubicación para ofertas y semáforo | Uso de mapa / ofertas cercanas |
| `ia` | Uso de asistentes IA (Cerebro) | Primera interacción con Cerebro |
| `comunicaciones` | Emails/push de notificaciones | Preferencias de notificaciones |
| `reportes_pyme_enterprise` | Inclusión en reportes agregados para PyME/Empresa | Onboarding PyME/Enterprise |
| `reportes_gobierno` | Inclusión en estadísticas anonimizadas para entes públicos | Opcional en registro o más adelante |

### 2.3 Registro de consentimiento

- Cada otorgamiento/revocación se registra en tabla `consent_records`: `userId`, `consentType`, `granted` (boolean), `timestamp`, `consentVersion`, `purpose`.
- Antes de guardar cualquier dato personal, el backend comprueba `hasConsent(userId, consentType)` (o equivalente); si no hay consentimiento, no se escribe y se devuelve error o flujo de solicitud de consentimiento.

---

## 3. Separación: datos personales vs datos estadísticos anonimizados

### 3.1 Datos personales

- **Definición:** Cualquier dato que permita identificar directa o indirectamente a una persona (nombre, email, documento, teléfono, ubicación precisa, identificadores de dispositivo vinculados a cuenta).
- **Almacenamiento:** En tablas/contenedores dedicados; acceso solo con autorización y auditoría; cifrado en reposo recomendado para datos sensibles (documentos, biometría resultado).
- **Retención:** Según política por categoría (ver compliance existente); usuario puede exportar y solicitar eliminación.

### 3.2 Datos estadísticos anonimizados

- **Definición:** Datos que no permiten re-identificación razonable (agregados por región, sector, rangos de edad, KPIs sin IDs ni claves externas).
- **Almacenamiento:** En almacén separado (data lake / warehouse); sin `userId` ni claves que enlacen a identidad.
- **Procedimiento:** Pipeline ETL que agrega/anonimiza antes de escribir; no se guardan datos personales en este almacén.
- **Uso:** Dashboards Big Data, reportes PyME/Enterprise/Gobierno (ver sección 4).

### 3.3 Matriz de separación (resumen)

| Categoría | Personal | Anonimizado | Consentimiento para guardar |
|-----------|----------|-------------|-----------------------------|
| Login social (email, nombre) | Sí | No | `login_social` |
| Perfil (teléfono, dirección) | Sí | No | `datos_perfil` |
| Documentos (cédula, RUC) | Sí | No | Verificación + términos |
| Biometría (resultado pass/fail) | Sí (evento) | No | `biometria` |
| Ubicación precisa | Sí | No | `datos_territoriales` |
| Transacciones (montos, fechas) | Sí en ledger | Sí (agregados) | Implícito en uso wallet; reportes con `reportes_*` |
| Interacciones Cerebro | Sí (log por usuario) | Sí (eventos sin userId) | `ia` |
| Ofertas y aplicaciones | Sí (quién aplicó) | Sí (conteos, sectores) | Uso de la app |

---

## 4. Preparación: Dashboards Big Data y reportes

### 4.1 Dashboards Big Data (interno / producto)

- **Fuente:** Solo datos anonimizados y agregados del data lake.
- **Métricas:** Actividad por región, sector, tipo de rol; volumen de transacciones (sin identificar usuarios); uso de escudos y semáforo (conteos); adopción de biometría (porcentajes).
- **Acceso:** Roles internos autorizados; sin exportación de datos personales.

### 4.2 Reportes para PyMEs y Enterprise

- **Contenido:** KPIs de su propia organización (trabajadores, ofertas, contrataciones, pagos) usando solo datos de usuarios que tienen relación laboral/contrato con esa PyME/Enterprise y consentimiento donde aplique.
- **Base legal:** Consentimiento `reportes_pyme_enterprise`; datos personales solo en el ámbito de la relación contractual y con propósito limitado.

### 4.3 Reportes para Gobierno

- **Contenido:** Estadísticas anonimizadas (empleo por sector/región, indicadores de formalización, subsidios agregados). Sin identificación de personas.
- **Base legal:** Consentimiento `reportes_gobierno` o habilitación legal para estadística oficial; datos solo anonimizados.
- **Entrega:** API o exportación periódica bajo acuerdo; esquema fijo y documentado.

---

## 5. Documentos por rol y flujos de verificación

### 5.1 Documentos por rol

| Rol | Documentos requeridos (verificado) | Notas |
|-----|-------------------------------------|--------|
| Vale | Cédula de identidad (o documento nacional) | Verificación básica de identidad |
| Capeto / Kavaju / Mbareté | Cédula; opcional constancia laboral o relación con territorio | Igual que Vale + contexto laboral |
| Cliente | Cédula; opcional RUC si actúa como persona jurídica | Acceso a ofertas y contratación |
| PyME | RUC, representante legal (cédula), documentación de empresa si aplica | Verificación empresa |
| Enterprise | RUC, representante legal, documentación corporativa | Verificación empresa + posibles acuerdos marco |

### 5.2 Flujos de verificación

1. **Inicio:** Usuario con login social (o email) elige "Verificar mi cuenta".
2. **Propósito y consentimiento:** Se muestra para qué se usan los datos y se pide consentimiento explícito (documentos + biometría si aplica).
3. **Documento:** Subida de cédula (y RUC si rol PyME/Enterprise); validación de formato y lectura (OCR si aplica); no se guarda sin consentimiento.
4. **Biometría:** Captura facial/dactilar; comparación con documento; resultado (nivel, pass/fail) se guarda como evento; no se almacena la biometría en crudo.
5. **Resultado:** `verificationLevel` actualizado a `verified` o `trusted`; roles sensibles habilitados según política; auditoría del evento.

### 5.3 Master Key DEV

- **Propósito:** Solo desarrollo e integración; nunca en producción.
- **Comportamiento (existente):** Variable `YAPO_MASTER_KEY`; si el cliente envía el mismo valor, se inyecta identidad de desarrollo con todos los roles y sesión larga.
- **Regla:** En producción `YAPO_MASTER_KEY` no debe estar definida (o estar vacía); en build de producción el código no debe exponer la master key al cliente. Revisión de secrets en CI/CD.

---

## 6. Política de privacidad base y consentimientos claros

### 6.1 Política de privacidad (base)

- **Responsable:** Identificación del responsable del tratamiento (YAPÓ / entidad legal).
- **Datos que se recaban:** Por capa (open access: ninguno personal; social: los indicados al conectar; verificado: documentos y resultado de biometría).
- **Finalidad:** Prestación del servicio, verificación de identidad, cumplimiento legal, mejora del producto (con datos anonimizados).
- **Base legal:** Consentimiento; ejecución contractual; obligación legal cuando aplique.
- **Derechos:** Acceso, rectificación, supresión, limitación, portabilidad, oposición; forma de ejercerlos (ej. en perfil o email de privacidad).
- **Retención:** Tiempos por categoría (o referencia a política de retención interna).
- **Transferencias:** Si hay transferencias internacionales o a terceros (ej. proveedores cloud), indicarlas y garantías.
- **Cookies y tecnologías similares:** Uso de cookies técnicas y analíticas; enlace a gestión de consentimiento.

### 6.2 Consentimientos claros (textos cortos por tipo)

- **Login social:** "Al continuar con [Google/Facebook/Instagram], YAPÓ recibirá tu nombre, correo y foto de perfil para crear tu cuenta. Solo guardamos estos datos si aceptas. Puedes revocar el acceso desde la configuración de tu cuenta."
- **Biometría:** "Usamos tu rostro [y/o huella] solo para verificar que eres tú. No guardamos la imagen ni la huella; solo el resultado de la verificación. Es necesario para operaciones seguras."
- **Datos territoriales:** "Usamos tu ubicación para mostrarte ofertas y servicios cercanos y el estado del semáforo en tu zona. Puedes desactivarlo en cualquier momento."
- **IA (Cerebro):** "El asistente de YAPÓ procesa tus consultas para guiarte. Las conversaciones se usan para mejorar el servicio; puedes revocar este consentimiento en configuración."
- **Reportes PyME/Enterprise:** "Tus datos laborales podrán incluirse en reportes para tu empleador o empresa con la que tienes relación, según tu contrato y esta autorización."
- **Reportes Gobierno:** "Podemos incluir datos anonimizados (sin identificar a personas) en estadísticas para entes públicos, para políticas de empleo y formalización."

---

## 7. Estructura de base de datos (esquema conceptual)

### 7.1 Tablas principales

- **users** (identidad mínima): `id`, `created_at`, `verification_level`, `primary_role`; sin datos personales sensibles; enlace a `identities_social` y `verification_events`.
- **identities_social**: `user_id`, `provider`, `provider_user_id`, `email`, `display_name`, `avatar_url`, `consent_type`, `consent_version`, `consent_at`; índice único `(provider, provider_user_id)`.
- **consent_records**: `id`, `user_id`, `consent_type`, `granted`, `timestamp`, `consent_version`, `purpose` (opcional).
- **verification_events**: `id`, `user_id`, `document_type`, `result` (ok/fail), `biometric_level`, `verified_at`; sin almacenar documento ni biometría en crudo.
- **profiles**: `user_id`, campos de perfil (teléfono, dirección, etc.) solo si hay consentimiento; `consent_version` por conjunto de datos.
- **audit_events**: ya existente; ampliar con acciones de consentimiento y verificación.

### 7.2 Almacén de datos anonimizados (Big Data / reportes)

- **Tablas/schemas separados** (por ejemplo en warehouse): `agg_by_region`, `agg_by_sector`, `agg_usage_metrics`, etc.
- **Sin** `user_id` ni claves que permitan re-identificación; solo agregados, rangos y KPIs.
- **Pipeline:** ETL desde sistemas transaccionales → anonimización/agregación → escritura en warehouse.

### 7.3 Diagrama de flujo de datos (resumen)

```
[Usuario] → Consentimiento explícito → [Backend]
                ↓
    [Datos personales] → Tablas identificables (users, identities_social, profiles, verification_events)
    [Eventos/transacciones] → Ledger / logs (con userId)
                ↓
    ETL / agregación → [Almacén anonimizado] → Dashboards, reportes PyME/Enterprise/Gobierno
```

---

## 8. Resumen de decisiones

| Tema | Decisión |
|------|----------|
| Registro | 3 capas: open access, social, verificado+biometría. |
| Datos | Solo con consentimiento explícito; registro por tipo y versión. |
| Separación | Datos personales en tablas identificables; estadística solo anonimizada en almacén separado. |
| Reportes | Big Data y reportes PyME/Enterprise/Gobierno sobre datos anonimizados o con consentimiento y propósito limitado. |
| Documentos | Por rol (cédula, RUC, etc.); flujo verificación con consentimiento y sin guardar biometría en crudo. |
| Master Key | Solo DEV; no en producción. |
| Privacidad | Política base + textos de consentimiento claros por tipo. |
| DB | Esquema conceptual: users, identities_social, consent_records, verification_events, profiles, audit; almacén anonimizado separado. |

Este documento sirve como referencia para implementación y auditoría legal/técnica.
