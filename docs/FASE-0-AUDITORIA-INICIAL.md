# FASE 0 — Auditoría inicial YAPÓ 3.0

**Rol:** CTO + Lead Engineer + Product Architect + Security + Legal-aware  
**Objetivo:** Entender la estructura actual del repo sin modificar código.  
**Fecha:** Auditoría pre-STARTER funcional.

---

## 1. Estructura del repo

### Raíz del proyecto (app principal)

| Elemento | Ubicación | Notas |
|----------|-----------|--------|
| **Framework** | Next.js 16.1.6 | `package.json` raíz |
| **React** | 19.2.3 | React 19 |
| **TypeScript** | ^5 | strict, paths `@/*` → `./src/*` |
| **Estilos** | Tailwind 4 + PostCSS | `globals.css`, `tailwind.css` en `src/styles` |
| **App routing** | `src/app/` | App Router (Next.js); **`app/`** en raíz es carpeta duplicada/alternativa (no usada por el build raíz) |
| **Config** | `next.config.ts`, `tsconfig.json`, `vercel.json` | React Compiler on; ESLint/TS no ignorados en build |

El **build** se ejecuta desde la **raíz** (`npm run build` → `next build`). Next resuelve `src/` por defecto, por tanto la app activa es **`src/app/`**.

### Carpetas relevantes

- **`src/app/`** — Páginas y API routes (App Router).
- **`src/components/`** — UI: auth, cerebro, chat, wallet, video, subsidy, territory, ui.
- **`src/lib/`** — Lógica: auth, ai (cerebro, intents, openai), wallet, analytics, territory, roles, biometric, etc.
- **`src/features/`** — Escudos, semáforo, wallet (WalletUI), chat.
- **`src/data/`** — Mocks, knowledge-base, chips, roles.
- **`backend/`** — Node (server.js, wallet-api.js, ws-server con TypeScript).
- **`backend-ws/`** — Servidor WebSocket (auth, chat, signaling).
- **`docs/`** — Arquitectura, legal, datos, producto, QA, validación técnica.
- **`app/`** — Copia/alternativa de front con su propio `package.json`; **no es la app que construye la raíz**.

---

## 2. Qué existe y qué no

### ✅ Existe

| Área | Qué hay |
|------|---------|
| **Framework** | Next.js 16, React 19, TypeScript, Tailwind 4. |
| **Routing** | App Router en `src/app/`: `/`, `/home`, `/login`, `/profile`, `/wallet`, `/cerebro`, `/chat`, `/dashboard`, `/video`; API: `/api/ai`, `/api/voice`, `/api/wallet/[[...path]]`. |
| **Estado global** | `SessionProvider` (`src/lib/auth/context/SessionContext.tsx`): sesión, identidad, roles, `isSafeMode`, `setSafeRole`. Sin Redux/Zustand adicional. |
| **Auth (lógica)** | Módulo completo en `src/lib/auth/`: tipos (RoleId, Identity, Session, IdentityProfile), ROLES (vale, capeto, kavaju, mbarete, cliente, pyme, enterprise), identityService (en memoria), verificationService, biometric (WebAuthn listo), dev/safeMode, dev/masterKey, dev/devMode, SessionProvider, useSession. |
| **Auth (UI)** | `(auth)/login/page.tsx`: en SAFE MODE muestra “ya autenticado” + link a /home; si no, solo texto “implementar con proveedor real”. No hay login real (Google/Facebook/Instagram/email). |
| **Perfil** | `IdentityProfile` (userId, role, verificationLevel, trustScore, badges, biometricEnabled, whatsappUnlocked). identityService en memoria (Map); sin persistencia DB. |
| **Wallet** | Ledger en memoria (`ledger.ts`), `service.ts` (requestTransfer, hold/release/block), `wallet.guard.ts`, escudos (biometrico, tiempo, monto, territorial), subsidy.service. Wallet UI: saldo, escudos, enviar/recibir, historial, SubsidyList. |
| **Cerebro** | Dos capas: (1) `src/lib/cerebro/`: engine (decide por rol/acción/monto), barEngine (query → BarResult), rules. (2) `src/lib/ai/cerebro/`: CerebroIntent, CerebroResult, decide(), runCerebroWithIntent(), catálogo de intents (wallet_transfer, navigate, escudo_activate, etc.). Chips emiten intents → decide → CerebroResult; CerebroResultHandler en UI. |
| **Roles** | Definidos en `auth/roles.ts` y `lib/ai/cerebro/types.ts` (CerebroRole). Comportamientos por rol en `lib/roles/behaviors.ts`. |
| **Chips UI** | BubbleChipsDynamic, RoleBubbleChip, CategoryBubbleChip, ChipBubble, CerebroBar, etc.; emiten CerebroIntent y reciben CerebroResult. |
| **Biometría** | Estructura en `lib/auth/biometric/` (WebAuthn, useRequireBiometric); wallet.guard y Cerebro devuelven requiresValidation/validationType biometric. |
| **Analytics / semáforo** | `lib/analytics/` (eventos); `lib/territory/semaphore.ts`; features/semaforo (compute, SemaphoreUI, useSemaphore). |
| **Dashboard** | `src/app/dashboard/page.tsx` existe pero está vacío (`<main />`). |
| **Deploy** | `vercel.json` (buildCommand, headers). `VERCEL_DEPLOY.md`. Variables en `.env.example` (WS, SAFE_MODE, AI/Voice, Wallet API, Master Key). |

### ❌ No existe o está incompleto

| Área | Estado |
|------|--------|
| **Base de datos** | Sin PostgreSQL ni ORM (Prisma/Drizzle/etc.). identityService y wallet son en memoria. |
| **Login real** | Sin OAuth (Google/Facebook/Instagram) ni email/password ni “recuperar contraseña” ni registro nuevo. |
| **Consentimiento obligatorio** | Sin flujo “acepto Privacy + Consentimiento” que bloquee acceso. |
| **Persistencia de usuario** | No se guarda en DB: ID único, nombre, email, método de login, fecha consentimiento, país, rol inicial, flags biometría. |
| **Perfil obligatorio (DB)** | No hay modelo de perfil con campos mínimos (situación laboral, formación, certificaciones, intereses, historial, consentimientos) ni bloqueo de funciones clave si no está completo. |
| **Dashboard vendible** | Página vacía; no hay pantallas de estadísticas laborales, formación, actividad económica, tendencias, segmentación. |
| **Build verificable** | `next` no encontrado en PATH en el entorno de auditoría (posible falta de `npm install`); no se pudo ejecutar `npm run build`. |

---

## 3. Framework, routing, estado global, auth

### Framework

- **Next.js 16.1.6** (App Router), React 19, TypeScript strict, Tailwind 4.
- Path alias: `@/*` → `./src/*`.
- Build: `next build` desde raíz; no usa la carpeta `app/` como app (esa es otra copia).

### Routing

- **Raíz:** `src/app/page.tsx` → redirect a `/home`.
- **Rutas:** `/home`, `/(auth)/login`, `/profile`, `/wallet`, `/cerebro`, `/chat` (y group/private), `/dashboard`, `/video`.
- **API:** `src/app/api/ai/route.ts`, `api/voice/route.ts`, `api/wallet/[[...path]]/route.ts` (proxy al backend Wallet).

### Estado global

- **SessionProvider** (auth): `session`, `identity`, `roles`, `isVerified`, `isMaster`, `isSafeMode`, `setSafeRole`.
- **CerebroResultHandlerProvider**: `handleCerebroResult`, `pendingValidation`, `clearPendingValidation`.
- No hay store global adicional (Redux/Zustand) para el flujo actual.

### Auth actual

- **SAFE MODE** (default en .env.example): sesión mock `safe-user` con rol configurable (`NEXT_PUBLIC_SAFE_ROLE` / `setSafeRole`).
- **Dev mode**: usuario `dev-master` (Mbareté) si se activa.
- **Master Key**: si se define `YAPO_MASTER_KEY`, login con esa clave puede devolver sesión master (lógica en `dev/masterKey.ts`).
- **Sin login real**: no hay UI de Google/Facebook/Instagram ni email/password; no hay registro ni recuperar contraseña; no hay guardado de consentimiento ni usuario en DB.

---

## 4. Bugs / riesgos detectados (sin corregir en FASE 0)

1. **`src/app/wallet/page.tsx`**  
   Usa `handleAcceptSubsidy` en `<SubsidyList onAccept={handleAcceptSubsidy} />` pero **no está definido** en el componente. Se importa `acceptSubsidy` de `@/lib/wallet` pero no existe un callback que lo invoque y devuelva `{ success, error?, requiresValidation? }`. Esto puede producir error en runtime al aceptar un subsidio.

2. **BarEngine vs CerebroContext**  
   `barEngine.ts` usa `context.role` (singular) en `decidir()`; `CerebroContext` en `lib/ai/cerebro/types.ts` tiene `role: CerebroRole`. En `runBarQuery` se pasa `context.role` que no existe en `BarScreenContext` (solo `userId`, `roles`, `screen`, `amount`). Revisar si `BarScreenContext` debe incluir `role` derivado de `roles[0]` o si el llamador ya lo hace.

3. **Dos árboles de app**  
   Conviven `src/app/` (usado por el build) y `app/` con su propio `src/`. Riesgo de confusión y duplicación; dejar documentado cuál es la fuente de verdad (raíz → `src/`).

---

## 5. Resumen para las fases siguientes

| Fase | Estado actual | Acción principal |
|------|----------------|------------------|
| **1 – Auth** | Solo mock (SAFE MODE). Login UI placeholder. | Implementar login social + email, registro, recuperar contraseña, consentimiento obligatorio, persistencia en DB. |
| **2 – Perfil** | IdentityProfile en memoria; profile page con TrustStatus/WhatsApp. | Modelo de perfil en DB, campos mínimos, bloqueo de funciones clave si no está completo. |
| **3 – Wallet UI** | Ya existe: saldo, escudos, enviar/recibir, historial, subsidios. | Corregir `handleAcceptSubsidy`; mantener mock listo para escalar; no pagos reales. |
| **4 – Roles** | ROLES y permisos definidos; UI adaptada parcial (SafeModeRoleSelector). | Flags de permisos por rol, accesos diferenciados, UI por rol. |
| **5 – Cerebro** | CerebroIntent/CerebroResult, decide(), runCerebroWithIntent(); integración OpenAI en `src/ai/OpenAIEngine.ts`. | Consolidar runCerebroWithIntent + userContext; asegurar integración local + IA. |
| **6 – Chips** | Chips que emiten intents y reciben CerebroResult. | Verificar que todos sean accionables y no decorativos. |
| **7 – Biometría** | Estructura y flags; flujo de validación en guard/Cerebro. | Preparar flujo legal y UX de aceptación; sin KYC completo aún. |
| **8 – Analytics + semáforo** | Módulos presentes. | Registrar eventos (registro, actividad, wallet, interacciones); semáforo por territorio/empleo/actividad. |
| **9 – Dashboard** | Página vacía. | Pantallas mock: estadísticas laborales, formación, actividad económica, tendencias, segmentación rol/territorio. |
| **10 – Deploy** | vercel.json y docs. | Build estable, env vars, checklist final. |

---

## 6. Confirmación FASE 0

- [x] Estructura del repo analizada.
- [x] Detectado qué existe y qué no (auth real, DB, perfil persistido, dashboard, etc.).
- [x] Confirmado framework (Next.js 16, React 19, TS, Tailwind), routing (App Router en `src/app/`), estado global (SessionProvider + CerebroResultHandler), auth actual (mock + safe mode + master key; sin OAuth ni DB).
- [x] No se ha programado; solo entendimiento del proyecto.
- [x] Documentados bugs/riesgos para abordar en fases siguientes.

**Siguiente paso:** Confirmar esta auditoría y pasar a **FASE 1 — Autenticación y registro**.
