# Sistema de autenticación YAPÓ 3.0

**Objetivo:** Autenticación segura, eficiente y escalable: registro, login, recuperación de contraseña, sesiones y puntos de integración para KYC y verificación facial.

---

## 1. Resumen

| Componente | Tecnología | Ubicación |
|------------|------------|-----------|
| **Login / sesión** | NextAuth v5 (Auth.js), JWT, Prisma adapter | `src/lib/auth-next/config.ts` |
| **Registro** | POST `/api/auth/register`, bcrypt, Zod | `src/app/api/auth/register/route.ts` |
| **Recuperación** | POST `/api/auth/forgot-password`, `reset-password`, VerificationToken | `src/app/api/auth/forgot-password`, `reset-password` |
| **Sesión en cliente** | SessionBridge (NextAuth → YAPÓ SessionProvider) | `src/lib/auth-next/SessionBridge.tsx` |
| **Constantes** | Sesión, contraseña, tokens | `src/lib/auth-next/constants.ts` |
| **KYC / verificación** | Niveles y hook para facial | `src/lib/auth-next/verification.ts`, `src/lib/auth/verificationService.ts` |

---

## 2. Flujos

### 2.1 Registro

1. Usuario va a `/register`, completa email, contraseña (mín. 8, máx. 128), nombre opcional y acepta términos.
2. POST `/api/auth/register` con body validado por Zod (`registerBodySchema`).
3. Backend: crea `User` (passwordHash con bcrypt 12 rondas), `Profile` (profileStatus = INCOMPLETO), `Consent`.
4. Respuesta genérica de éxito; redirección a `/login?registered=1`.
5. En login se muestra mensaje: "Cuenta creada. Iniciá sesión con tu email y contraseña."

### 2.2 Login

1. Usuario en `/login`: email + contraseña (Credentials) u OAuth (Google, Facebook, Instagram).
2. NextAuth valida credenciales; JWT con `id`, `role`, duración `SESSION_MAX_AGE_SECONDS` (30 días).
3. Cookies: en producción `useSecureCookies: true`.
4. SessionBridge sincroniza sesión NextAuth → YAPÓ Identity (userId, roles, verified).
5. Si no hay consentimiento vigente → ConsentGuard redirige a `/consent`. Si perfil incompleto → ProfileGuard redirige a `/profile`.

### 2.3 Recuperación de contraseña

1. **Solicitud:** POST `/api/auth/forgot-password` con `{ email }` (Zod). Siempre se devuelve el mismo mensaje (no revelar si el email existe). Se crea `VerificationToken` con expiración `PASSWORD_RESET_TOKEN_EXPIRY_HOURS` (24 h).
2. **En producción:** enviar email con enlace a `/reset-password?token=...&email=...`. En desarrollo se puede devolver `_devLink` para pruebas.
3. **Restablecer:** POST `/api/auth/reset-password` con `{ token, email, password }` (Zod). Token de un solo uso; tras éxito se borra y se redirige a login.

### 2.4 Sesiones

- **Estrategia:** JWT (no sesiones en DB para Credentials).
- **Duración:** `SESSION_MAX_AGE_SECONDS` (30 días).
- **Contenido del token:** `id`, `role`; extensible para `verificationLevel` cuando se persista en DB.
- **Cliente:** `useSession()` (NextAuth) + SessionBridge → `useSession()` (YAPÓ) con `identity.userId`, `identity.roles`, `identity.verified`.

### 2.5 Master Key (solo desarrollo)

- **Objetivo:** Navegar sin que el auth bloquee; probar la app con un usuario “super” sin registro real.
- **Configuración:** En `.env` definir `YAPO_MASTER_KEY` con una clave secreta (solo en desarrollo).
- **Uso:** En `/login`, en la sección colapsable **Dev: Master Key**, ingresar esa clave en el campo y enviar (no hace falta email/contraseña). NextAuth devuelve sesión con `userId: dev-master` y todos los roles.
- **Guards:** ConsentGuard y ProfileGuard **no bloquean** a `dev-master` ni a `safe-user`; podés acceder a todas las rutas sin consent ni perfil completo.
- **Producción:** No definir `YAPO_MASTER_KEY` en producción; el bloque de Master Key solo se muestra cuando `NODE_ENV === "development"`.

### 2.6 Volver al inicio y modo prueba (evitar pantalla bloqueada)

- En **login, register, consent, forgot-password, reset-password** hay un enlace **Volver al inicio** que lleva a `/`.
- **Solo en desarrollo:** además se muestra **Entrar en modo prueba (sin login)**. Al usarlo se establece una sesión mock (`safe-user`) y se redirige a `/home`, sin pasar por login ni consent; así la pantalla no queda bloqueada hasta tener el flujo definitivo.
- La biometría y los datos reales siguen requiriendo login real; el modo prueba solo evita quedar atrapado en auth durante el desarrollo.

---

## 3. Seguridad

- **Contraseñas:** bcrypt 12 rondas; longitud mín. 8, máx. 128 caracteres (evitar DoS).
- **Validación:** Zod en registro, forgot y reset; mensajes de error estándar vía `handleApiError`.
- **Tokens de reset:** 32 bytes aleatorios, expiración 24 h, un solo uso.
- **Cookies:** en producción cookies seguras (HTTPS). NextAuth gestiona SameSite y HttpOnly.
- **Recomendaciones para producción:** rate limiting en login/register/forgot (p. ej. Upstash, Vercel KV); no loguear contraseñas ni tokens; considerar CAPTCHA en registro/login si hay abuso.

---

## 4. Integración KYC y verificación facial

### 4.1 Niveles de verificación

Orden ascendente (no se puede saltar): `unverified` → `basic` → `verified` → `trusted`.

- **Módulo:** `src/lib/auth-next/verification.ts` exporta `getVerificationLevel(userId)`, `canAccessKycGated(userId, minLevel)`, `KYC_LEVELS`.
- **Origen del nivel:** actualmente perfil en memoria (`identityService`). Futuro: campo en `Profile` o `User` (p. ej. `verificationLevel`, `kycStatus`).

### 4.2 Verificación por pasos

- **Módulo:** `src/lib/auth/verificationService.ts`: `verifyBasic`, `verifyDocument`, `verifyBiometric`.
- **Regla:** solo se sube de nivel si se cumple el anterior (basic → document → biometric).

### 4.3 Verificación facial (placeholder)

1. **Proveedor externo:** liveness + comparación con documento. La app llama al proveedor desde una ruta protegida (sesión obligatoria).
2. **Tras éxito:** actualizar identidad con `updateIdentity(userId, { verificationLevel: "trusted", biometricEnabled: true })` (o el nivel que corresponda).
3. **Ruta sugerida:** POST `/api/auth/verify-face` (o bajo `/api/kyc/...`) que reciba resultado firmado del proveedor, lo valide y llame a `updateIdentity` + opcionalmente persistir en DB cuando exista el campo.
4. **UI:** pantalla o modal de “Verificación facial” que redirija al proveedor o embeba el flujo; al volver, comprobar estado con `getVerificationLevel(userId)`.

### 4.4 Medios de pago

- Para operaciones que requieran alta confianza, comprobar `canAccessKycGated(userId, "verified")` o `"trusted"` antes de permitir pago o retiro.
- El mismo nivel se puede exponer en sesión/JWT cuando se persista en DB para evitar una llamada extra en cada request.

---

## 5. Referencias

- **Fase 1 (flujos detallados):** `docs/FASE-1-AUTH-REGISTRO.md`
- **Constantes:** `src/lib/auth-next/constants.ts`
- **Schemas Zod (auth):** `src/lib/api/schemas/auth.ts`
- **NextAuth config:** `src/lib/auth-next/config.ts`
