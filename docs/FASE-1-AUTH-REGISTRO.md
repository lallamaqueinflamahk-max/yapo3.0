# FASE 1 — Autenticación y Registro (Auth real + perfil obligatorio)

**Objetivo:** Identidad real, registro legal, persistencia en PostgreSQL y perfil mínimo obligatorio. Nadie entra a la app sin sesión; perfil incompleto bloquea Wallet, Cerebro, Chat, Video y Dashboard.

---

## 1. Flujo de login

1. **Usuario visita la app** (sin sesión, SAFE MODE desactivado)  
   → ConsentGuard redirige a `/login`.

2. **Pantalla `/login`:**
   - Logo YAPÓ.
   - Botones OAuth: **Google**, **Facebook**, **Instagram** (si están configurados en `.env`).
   - Formulario **email + contraseña** (Credentials).
   - Enlace **“¿Olvidaste tu contraseña?”** → `/forgot-password`.
   - Enlace **“Registrarse”** → `/register`.
   - En desarrollo: desplegable **Master Key** (si `YAPO_MASTER_KEY` está definido).

3. **Login exitoso (Credentials u OAuth):**
   - NextAuth crea/actualiza sesión (JWT con `id`, `role`).
   - AuthSessionBridge sincroniza sesión NextAuth → SessionProvider YAPÓ (Identity con `userId`, `roles`, `verified`).
   - Si el usuario **no tiene consentimiento vigente** → ConsentGuard redirige a `/consent`.
   - Si tiene consentimiento → puede ir a `/home` u otra ruta permitida.

4. **SAFE MODE activo** (`NEXT_PUBLIC_SAFE_MODE=true`):  
   No se exige login; SessionProvider usa sesión mock. Master Key sigue disponible en dev.

5. **Nadie entra a la app sin sesión:**  
   Rutas no públicas (ej. `/home`, `/wallet`) redirigen a `/login` si no hay sesión (ConsentGuard).

---

## 2. Flujo de registro

1. **Usuario en `/login`** → hace clic en **“Registrarse”** → va a `/register`.

2. **Pantalla `/register`:**
   - Logo YAPÓ.
   - Campos: **Nombre** (opcional), **Email**, **Contraseña** (mín. 8 caracteres).
   - **Checkbox obligatorio:** “Acepto la Política de Privacidad y los Términos y Condiciones de YAPÓ.”
   - **Submit deshabilitado** hasta que el checkbox esté marcado.

3. **Al enviar el formulario:**
   - POST `/api/auth/register` con `{ email, password, name? }`.
   - Backend:
     - Crea **User** (email, name, passwordHash, provider = "credentials", role = "vale").
     - Crea **Profile** (userId, profileStatus = "INCOMPLETO").
     - Registra **Consent** (userId, version = "privacy-and-terms-v1", acceptedAt, ip?, userAgent?).
   - Respuesta: `{ ok: true, message: "Cuenta creada. Iniciá sesión…" }`.
   - Redirección a `/login?registered=1`.

4. **Texto legal:**  
   Durante el registro se muestra el texto resumido y el checkbox; el registro se guarda en la tabla **Consent**. Sin aceptación no se puede enviar el formulario.

---

## 3. Campos guardados

### User (Prisma)

| Campo         | Tipo     | Notas                                      |
|---------------|----------|--------------------------------------------|
| id            | String   | cuid                                       |
| email         | String   | unique                                     |
| name          | String?  |                                            |
| emailVerified | DateTime?|                                            |
| image         | String?  |                                            |
| passwordHash  | String?  | email/password; null para OAuth           |
| provider      | String?  | "credentials" \| "google" \| "facebook" \| "instagram" |
| role          | String   | default "vale"                             |
| createdAt     | DateTime |                                            |

### Profile (Prisma)

| Campo          | Tipo   | Notas                          |
|----------------|--------|--------------------------------|
| id             | String | cuid                           |
| userId         | String | unique                         |
| country        | String?| **Obligatorio para OK**        |
| territory      | String?| **Obligatorio para OK**        |
| workStatus     | String?| **Obligatorio para OK**        |
| workType       | String?| **Obligatorio para OK**        |
| education      | String?| opcional                       |
| certifications | String?| opcional                       |
| profileStatus  | String | "INCOMPLETO" \| "OK"           |

### Consent (Prisma)

| Campo     | Tipo     | Notas                    |
|-----------|----------|--------------------------|
| id        | String   | cuid                     |
| userId    | String   |                          |
| version   | String   | ej. "privacy-and-terms-v1" |
| acceptedAt| DateTime |                          |
| ip        | String?  |                          |
| userAgent | String?  |                          |

---

## 4. Cómo funciona el bloqueo por perfil

**Regla global:**  
Si `profile.profileStatus === "INCOMPLETO"`, el usuario **no puede** acceder a Wallet, Cerebro, Chat, Video ni Dashboard; se redirige siempre a `/profile`.

### 4.1 ProfileGuard

- **Dónde:** Envolviendo la app (después de ConsentGuard), en `src/app/layout.tsx`.
- **Qué hace:**  
  En cada navegación, si la ruta es una de las **bloqueadas** (`/wallet`, `/cerebro`, `/chat`, `/dashboard`, `/video` o subrutas) y el usuario está autenticado (no SAFE MODE, no dev-master/safe-user):
  - GET `/api/auth/profile-status`.
  - Si la respuesta es `profileStatus === "INCOMPLETO"` → `router.replace("/profile")`.

### 4.2 Rutas bloqueadas con perfil incompleto

- `/wallet`
- `/cerebro`
- `/chat` (y subrutas)
- `/dashboard`
- `/video`

### 4.3 Perfil mínimo requerido

Para que `profileStatus` pase a **OK**, el usuario debe tener completos en **Profile**:

- **País** (country)
- **Territorio** (territory)
- **Situación laboral** (workStatus)
- **Tipo de trabajo** (workType)

Formación y certificaciones son opcionales. Al guardar con esos cuatro campos completos, PATCH `/api/auth/profile` actualiza `profileStatus` a **"OK"**.

### 4.4 Pantalla `/profile`

- Muestra TrustStatus y contacto (WhatsApp).
- Formulario **Perfil mínimo (obligatorio):** País, Territorio, Situación laboral, Tipo de trabajo; opcional: Formación, Certificaciones.
- Botón **“Guardar perfil”** (habilitado solo si los cuatro obligatorios están completos).
- Al guardar: PATCH `/api/auth/profile`; si todos los obligatorios están presentes, backend pone `profileStatus = "OK"`.
- Con perfil OK, el usuario puede usar Wallet, Cerebro, Chat, Video y Dashboard sin ser redirigido a `/profile`.

---

## 5. Qué queda pendiente para FASE 2

- **Verificación de email** (opcional): flujo de verificación con token/link y actualización de `emailVerified`.
- **Recuperación de contraseña en producción:** envío real de email (Resend, SendGrid, etc.) desde `/api/auth/forgot-password`; en FASE 1 solo se crea el token y en dev se devuelve `_devLink`.
- **OAuth en producción:** configurar apps en Google/Facebook/Instagram y variables `AUTH_*_ID` y `AUTH_*_SECRET` en el entorno de despliegue.
- **Páginas legales:** enlaces “Ver Política de Privacidad” y “Ver Términos” pueden apuntar a `/legal/privacy` y `/legal/terms` (contenido a definir si no existe).
- **Perfil extendido:** más campos de perfil (ej. foto, bio, preferencias) sin cambiar la regla de bloqueo por los cuatro campos mínimos.
- **Auditoría y retención:** alinear eventos de consentimiento y login con política de retención y auditoría (ya hay estructura en `src/lib/compliance`).

---

## 6. Criterio de éxito FASE 1

| Criterio                              | Estado |
|---------------------------------------|--------|
| Usuario puede registrarse             | ✅     |
| Consentimiento queda guardado        | ✅     |
| Perfil incompleto bloquea app         | ✅     |
| SAFE MODE sigue funcionando          | ✅     |
| Starter no se rompe                  | ✅     |
| App renderiza correctamente          | ✅     |

---

## 7. Referencia rápida de archivos

- **Auth (NextAuth v5):** `src/lib/auth-next/config.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **Guards:** `src/lib/auth-next/ConsentGuard.tsx`, `src/lib/auth-next/ProfileGuard.tsx`
- **Sincronización de sesión:** `src/lib/auth-next/SessionBridge.tsx`
- **Login / Registro / Consent:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/consent/page.tsx`
- **Perfil:** `src/app/profile/page.tsx`, `src/app/api/auth/profile/route.ts`, `src/app/api/auth/profile-status/route.ts`
- **Consentimiento en DB:** `src/lib/auth-next/consent.ts`
- **Schema DB:** `prisma/schema.prisma`
