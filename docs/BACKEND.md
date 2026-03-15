# Backend YAPÓ 3.0

**Objetivo:** Backend sólido, escalable y mantenible, conectado a la base de datos, con validaciones, manejo de errores y seguridad, listo para producción e integración con frontend y medios de pago.

---

## 1. Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                         │
│  /home, /mapa, /wallet, /profile, /chat …                        │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES (REST)                       │
│  /api/auth/*, /api/wallet/*, /api/mapa/*, /api/dashboard/* …    │
│  • Auth: NextAuth (JWT, Prisma adapter)                          │
│  • Validación: Zod en body/query                                 │
│  • Errores: respuestas JSON estándar                             │
│  • Seguridad: sesión, CORS mismo origen, headers                 │
└────────────────────────────┬────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Prisma       │  │  backend/       │  │  /api/voice,     │
│  (PostgreSQL)   │  │  server.js (WS) │  │  /api/ai         │
│  User, Wallet,  │  │  Chat, typing   │  │  (externos)      │
│  Profile, Mapa  │  │  puerto 3001    │  │                  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- **API principal:** Rutas bajo `src/app/api/` (Next.js Route Handlers). Conectan con Prisma y servicios en `src/lib/`.
- **WebSocket:** Servidor en `backend/server.js` (Express + ws). Chat y presencia. Variable `NEXT_PUBLIC_WS_URL`.
- **Wallet externa (opcional):** `backend/wallet-api.js` para desarrollo standalone; en producción la wallet es vía `/api/wallet/*` y Prisma.

---

## 2. Base de datos

- **Motor:** PostgreSQL.
- **ORM:** Prisma (`prisma/schema.prisma`, `src/lib/db.ts`).
- **URL:** `DATABASE_URL` en `.env`.
- **Migraciones:** `npx prisma migrate deploy` en despliegue.

Documentación detallada: `docs/datos/BASE-DATOS-YAPO.md`.

---

## 3. Autenticación y autorización

| Mecanismo | Uso |
|-----------|-----|
| **NextAuth (JWT)** | Login OAuth + credentials. Sesión en cookie; `auth()` en rutas para obtener usuario. |
| **SAFE MODE** | `NEXT_PUBLIC_SAFE_MODE=true`: sesión mock, sin DB obligatoria para desarrollo. |
| **Rol** | `User.role`: vale, capeto, kavaju, mbarete, cliente, pyme, enterprise. Usado para permisos (ej. wallet, dashboard). |
| **Consentimiento** | Rutas sensibles (wallet) verifican consent con `hasRequiredConsent(userId)`. |
| **Perfil** | Wallet exige `Profile.profileStatus === "OK"` (validado en `validateWalletAccess`). |

En rutas protegidas usar `auth()` y comprobar `session?.user?.id`; para wallet usar `validateWalletAccess()` de `@/lib/wallet-db/guard`.

---

## 4. Convenciones REST

- **JSON:** Request body y respuestas en `application/json`.
- **Códigos:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error.
- **Errores:** `{ "error": "mensaje" }` o `{ "errors": [{ "path": "campo", "message": "mensaje" }] }` para validación.
- **Éxito:** `{ "ok": true, ... }` cuando aplique; listas en `{ "items": [...] }` o nombre semántico (ej. `profesionales`, `transactions`).

---

## 5. Validación y errores

- **Validación:** Schemas Zod en `src/lib/api/schemas`; usar `validateBody(schema, request)` en POST/PUT.
- **Errores:** `ApiError` y `handleApiError` en `src/lib/api/errors.ts` para respuestas homogéneas.
- **Log:** En producción no loguear cuerpos con datos sensibles; sí código de estado y ruta.

---

## 6. Seguridad

- **CORS:** Next.js mismo origen por defecto; para dominio externo configurar headers en `next.config.ts`.
- **Headers:** Next.js incluye `X-Content-Type-Options`, etc.; reforzar en producción con `next.config` headers si se requiere.
- **Secrets:** `AUTH_SECRET`, `DATABASE_URL`, API keys solo en servidor; nunca en cliente.
- **Input:** Validar y sanear todos los inputs; usar Zod; no confiar en `userId` del cliente (usar sesión).
- **Rate limiting:** Valorar middleware o servicio externo (Vercel, Cloudflare) en producción.

---

## 7. Endpoints principales

| Grupo | Ejemplos | Auth | Descripción |
|-------|----------|------|-------------|
| **Auth** | POST /api/auth/register, POST /api/auth/[...nextauth], GET /api/auth/me | — / sesión | Registro, login, sesión |
| **Wallet** | GET/POST /api/wallet/transfer, /api/wallet/transactions, /api/wallet/shields | Sesión + consent + perfil | Saldo, transferencias, escudos |
| **Mapa** | GET /api/mapa/zonas/profesionales?barrioId=, /api/mapa/profesiones | Opcional | Profesionales y profesiones por zona |
| **Dashboard** | GET /api/dashboard/plan, /api/dashboard/ratings, /api/dashboard/metrics | Sesión | Plan, calificaciones, métricas |
| **Perfil** | GET /api/profile/public/[userId], PUT /api/auth/profile | Sesión / público | Perfil público y edición |
| **Contrato** | POST /api/contrato/aceptar-propuesta, /api/contrato/escrow/… | Sesión | Contratos y escrow |
| **AI / Voz** | POST /api/ai, POST /api/voice | Opcional | Cerebro y TTS |

---

## 8. Integración con frontend

- **Origen:** Mismo dominio (Next.js); llamadas a `/api/*` sin CORS adicional.
- **Sesión:** Cookie de NextAuth; `getServerSession` o `auth()` en server components; `useSession` en cliente.
- **Errores:** El frontend debe interpretar `error` o `errors` en el body y el status code para mostrar mensajes.

---

## 9. Medios de pago

- **Estado:** Integración preparada para Stripe y Pagopar. Wallet interna (Prisma) para saldo; acreditación vía webhooks.
- **Rutas:** POST `/api/payments/create-intent` (crear pago; devuelve checkoutUrl); POST `/api/webhooks/stripe` y POST `/api/webhooks/pagopar` (verificación de firma, idempotencia, `credit` en wallet).
- **Idempotencia:** Tabla `PaymentWebhookEvent` (provider + externalId) evita duplicar acreditaciones.
- **Documentación:** `docs/PAYMENTS-STRIPE-PAGOPAR.md` (requisitos Stripe LLC USA, Pagopar Paraguay, flujo y UX).

---

## 10. Despliegue

| Componente | Dónde | Notas |
|------------|-------|-------|
| **Next.js (API + app)** | Vercel (o Node server) | `DATABASE_URL`, `AUTH_SECRET`, env de OAuth y opcionales (OpenAI, etc.). |
| **PostgreSQL** | Vercel Postgres, Neon, Railway, etc. | Migraciones en build o paso previo al deploy. |
| **WebSocket (chat)** | Railway, Render, Fly.io, VPS | `backend/server.js`; exponer URL en `NEXT_PUBLIC_WS_URL`. |
| **Wallet API (opcional)** | Mismo servidor que WS o separado | Solo si se usa backend externo; en producción típicamente todo por Next.js API. |

**Variables de entorno mínimas (producción):**

- `DATABASE_URL`, `AUTH_SECRET`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (si usas Google)
- `NEXT_PUBLIC_WS_URL` (si usas chat)
- `NEXT_PUBLIC_SAFE_MODE=false`

Ver `.env.example` en la raíz.
