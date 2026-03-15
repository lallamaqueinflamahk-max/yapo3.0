# KYC – Verificación de identidad y facial (YAPÓ)

Implementación de verificación de identidad (KYC) con documento y biometría facial, lista para producción.

---

## 1. Proveedor elegido: Incode

- **Incode** se usa para **verificación de identidad**: documento (cédula/pasaporte), selfie y liveness. Incluye SDK web y móvil, API REST y flujos hospedados. Documentación: [Incode Omni Platform](https://developer.incode.com/docs/omni-platform-1).
- **Incognia** está orientado a **dispositivo y ubicación** (fraud detection, device fingerprinting), no a KYC documental/facial. Puede añadirse más adelante como capa adicional de confianza.

**Conclusión:** Para KYC funcional (documento + facial) el proveedor óptimo es **Incode**.

---

## 2. Arquitectura

- **Backend (Next.js API):**
  - `POST /api/kyc/session`: crea sesión en Incode, comprueba consentimiento de biometría y devuelve `sessionId` y `customerToken` para el frontend.
  - `GET /api/kyc/status`: devuelve nivel de verificación del usuario (`unverified` | `basic` | `verified` | `trusted`) y qué pasos tiene completados.
  - `POST /api/webhooks/incode`: webhook que Incode llama al finalizar la verificación; actualiza `User.verificationLevel` y registra `VerificationEvent` (sin guardar imágenes ni datos biométricos crudos).

- **Frontend:**
  - Página `/verify`: paso 1 = consentimiento de biometría (checkbox + texto); paso 2 = flujo de verificación (iframe con `INCODE_FLOW_URL` o integración con SDK usando `customerToken`).

- **Base de datos (Prisma):**
  - `User.verificationLevel`: `unverified` | `basic` | `verified` | `trusted`.
  - `VerificationEvent`: auditoría por usuario (paso, resultado, proveedor, nivel alcanzado). **No se almacenan imágenes ni datos biométricos en crudo.**

- **Consentimiento:** Se exige consentimiento de tipo `biometria-v1` antes de iniciar la verificación; se registra en la tabla `Consent`.

---

## 3. Variables de entorno

| Variable | Descripción | Obligatorio |
|----------|-------------|-------------|
| `INCODE_API_KEY` | API Key de Incode (dashboard) | Sí para KYC real |
| `INCODE_API_SECRET` | API Secret de Incode | Sí para KYC real |
| `INCODE_API_BASE_URL` | Base URL de la API (por defecto `https://api.incode.com`) | No |
| `INCODE_FLOW_URL` | URL del flujo hospedado (low-code) para embeber en iframe | No (alternativa: SDK) |
| `INCODE_WEBHOOK_SECRET` | Secret para verificar firma del webhook (header `x-incode-signature`) | Recomendado en producción |

Sin `INCODE_API_KEY` y `INCODE_API_SECRET`, la creación de sesión devuelve 503 y la página `/verify` indica que la verificación no está disponible.

---

## 4. Almacenamiento seguro y cumplimiento

- **No se almacenan** imágenes de documento ni de selfie ni datos biométricos crudos. Solo se persisten:
  - `User.verificationLevel`
  - Registros en `VerificationEvent`: `userId`, `step`, `result`, `provider`, `providerId`, `verificationLevel`, `createdAt`.

- **Consentimiento:** Consentimiento explícito de biometría (`biometria-v1`) antes de iniciar el flujo; registro en `Consent` con versión y timestamp.

- **Webhook:** En producción se debe verificar la firma del webhook (por ejemplo con `INCODE_WEBHOOK_SECRET`) para evitar que terceros actualicen el estado de verificación.

- **Auditoría:** `VerificationEvent` permite rastrear qué usuario subió de nivel, cuándo y con qué proveedor.

Alineado con `docs/arquitectura/REGISTRO-IDENTIDAD-DATOS.md` y `docs/legal/CONSENTIMIENTOS-ESTRUCTURA.md`.

---

## 5. Experiencia de usuario

- **Paso 1:** En `/verify` se muestra el texto de consentimiento de biometría; el usuario debe marcar la casilla y pulsar "Continuar a verificación".
- **Paso 2:** Se crea la sesión Incode y se muestra el flujo de verificación:
  - Si está configurado `INCODE_FLOW_URL`, se muestra en un iframe.
  - Si no, se muestra un mensaje indicando que hay que integrar el SDK de Incode con el token (y en desarrollo, el Session ID).
- **Éxito:** Cuando Incode notifica el resultado vía webhook, se actualiza el usuario. El usuario puede ver "Ya estás verificado" al volver a `/verify` o si Incode redirige a `/verify?done=1` (o `success=true`).
- Enlaces desde **Perfil** ("Verificación de identidad (KYC)") y desde la sección de servicios especiales.

---

## 6. Migración de base de datos

La migración que añade `User.verificationLevel` y la tabla `VerificationEvent` está en:

`prisma/migrations/20260204120000_add_kyc_verification_level_and_events/migration.sql`

**Aplicar migraciones:**

- **Producción:** `npx prisma migrate deploy`
- **Desarrollo:** `npx prisma migrate dev`

**Si Prisma indica que hay una migración fallida (P3009):** hay que resolverla antes de aplicar las siguientes.

1. Marcar la migración fallida como revertida (para poder volver a intentar aplicarla):
   ```bash
   npx prisma migrate resolve --rolled-back "NOMBRE_DE_LA_MIGRACION_FALLIDA"
   ```
   El nombre es el de la carpeta, por ejemplo: `20260204000000_indexes_rating_fks_search_history`.

2. Volver a ejecutar:
   ```bash
   npx prisma migrate deploy
   ```

Si la migración anterior sigue fallando, revisar el SQL de esa migración y el estado real de la base (columnas/índices existentes) o marcar como aplicada si el esquema ya está correcto:
   ```bash
   npx prisma migrate resolve --applied "NOMBRE_DE_LA_MIGRACION"
   ```
   Luego ejecutar de nuevo `npx prisma migrate deploy` para aplicar el resto (incluida la de KYC).

---

## 7. Configuración en Incode

1. Crear cuenta y proyecto en el dashboard de Incode.
2. Obtener API Key y API Secret y configurarlos en las variables de entorno.
3. Configurar el webhook en el dashboard de Incode apuntando a:  
   `https://tu-dominio.com/api/webhooks/incode`  
   y, si aplica, configurar el secret para la firma.
4. Opcional: crear un flujo hospedado en Incode y poner su URL en `INCODE_FLOW_URL` para usar el iframe sin integrar el SDK a mano.

---

## 8. Pasos para dejarlo listo en producción

1. **Migración:** Ejecutar `npx prisma migrate deploy` (y, si aplica, resolver migraciones fallidas como en la sección 6).
2. **Incode Dashboard:** Configurar API Key y API Secret; registrar la URL del webhook: `https://tu-dominio.com/api/webhooks/incode` (y el secret de firma si se usa).
3. **Variables de entorno en el servidor:** Definir `INCODE_API_KEY`, `INCODE_API_SECRET` y, opcionalmente, `INCODE_API_BASE_URL`, `INCODE_FLOW_URL`, `INCODE_WEBHOOK_SECRET`.
4. **Opcional – Flujo hospedado:** Crear un flujo en Incode y poner su URL en `INCODE_FLOW_URL` para que `/verify` muestre el iframe sin integrar el SDK a mano.

---

## 9. Resumen

| Aspecto | Decisión |
|---------|----------|
| Proveedor KYC | Incode (documento + facial + liveness) |
| Almacenamiento | Solo nivel y eventos; sin imágenes ni biometría cruda |
| Consentimiento | Biometría (`biometria-v1`) obligatorio antes del flujo |
| UX | `/verify`: consent → flujo (iframe o SDK); enlace desde perfil |
| Webhook | `POST /api/webhooks/incode` actualiza nivel y crea `VerificationEvent` |

KYC queda funcional, seguro y alineado con requisitos legales y de privacidad para producción.
