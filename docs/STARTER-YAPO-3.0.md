# YAPÓ 3.0 – Starter completo

Resumen de lo implementado según el prompt maestro: estructura, UI, seed, dashboards, legal y fricción/upgrade.

---

## 1. Estructura de carpetas y archivos

### App Router (`src/app/`)

| Ruta | Descripción |
|------|-------------|
| `/` | Redirección / landing |
| `/home` | Home con avatar, menú 3 líneas, flecha volver, chips, categorías, escudos, accesos rápidos |
| `/wallet` | Billetera, escudos, transacciones, validaciones |
| `/cerebro` | Acceso AI / Cerebro (comandos, chips) |
| `/chat` | Chat con usuario y soporte (WebSocket) |
| `/video` | VideoService (lobby + sala, socket funcional) |
| `/dashboard` | Dashboard con métricas, semáforos, calificaciones, tu plan, upgrade |
| `/profile` | Perfil mínimo obligatorio: País, Territorio, Situación laboral, Tipo de trabajo, TrustStatus, WhatsApp YAPÓ |
| `/legal/privacy` | Política de privacidad |
| `/legal/terms` | Términos de uso |
| `/legal/consent` | Consentimiento de datos |

### Componentes

- **Navbar** (`src/components/nav/Navbar.tsx`): menú hamburguesa (3 líneas) que abre panel lateral con navegación; flecha volver atrás (top-left); avatar pequeño a la derecha (carga foto desde sesión/seed).
- **Footer** (`src/components/Footer.tsx`): enlaces a Privacidad, Términos, Consentimiento.
- **PlanCard** (`src/components/dashboard/PlanCard.tsx`): tarjeta de plan (nombre, precio, beneficios, acción).
- **SubscriptionUpgrade** (`src/components/dashboard/SubscriptionUpgrade.tsx`): modal de upgrade (Valé, PyME, Enterprise) para fricción cuando el usuario quiere más recursos.
- **Avatar** (`src/components/ui/Avatar.tsx`): avatar con foto o iniciales.
- **WhatsAppButton** (`src/components/ui/WhatsAppButton.tsx`): botón/link WhatsApp (tel: o wa.me).
- **MapSemaforo** (`src/components/dashboard/MapSemaforo.tsx`): mapa/listado de semáforos por zona (verde/amarillo/rojo).
- **MetricsCard** (`src/components/dashboard/MetricsCard.tsx`): tarjeta de métrica (título, valor, tendencia).

### lib/

- `db.ts`: Prisma singleton.
- `auth-next/`: NextAuth, config, SessionBridge, ProfileGuard, ConsentGuard.
- `ai/`: Cerebro, intents, knowledge.
- `wallet/`: tipos, guard, servicio.
- `utils/`: helpers.

### prisma/

- `schema.prisma`: User, Profile, Consent, Wallet, WalletTransaction, Shield, UserShield, **SubscriptionPlan**, **Semaphore**, **Rating** (planes, semáforos, calificaciones empleado ↔ empleador).

### scripts/

- `seed.ts` / `seed.js`: carga usuarios (Admin/Mbareté, PyME, Enterprise, Valé, Capeto, Kavaju, Básico) con avatar, WhatsApp, plan, profileStatus OK; planes (Básico, Valé, Capeto, Kavaju, Mbareté, PyME, Enterprise) con precios y límites; semáforos; escudos; perfiles; consentimientos; wallets; calificaciones.
- `check-db.js`: verificación de conexión DB.
- `db:seed`: ejecuta seed (node scripts/seed.js).

---

## 2. UI y funcionalidades

- **Menú hamburguesa**: abre panel lateral; al navegar (pathname change) el panel se cierra.
- **Flecha volver**: visible en rutas distintas de `/home` y `/`; `router.back()` o `/home` si no hay historial.
- **Avatar**: en Navbar (top-right); foto desde sesión (NextAuth user.image o seed).
- **WhatsApp**: ícono/link en perfil y dashboard (soporte YAPÓ); número desde `user.whatsapp` o env.
- **Planes de suscripción**: precios y límites en BD (seed); dashboard muestra "Tu plan" y botón "Mejorar plan" que abre modal SubscriptionUpgrade.
- **Políticas**: Privacy, Terms, Consentimiento en `/legal/*` y enlazados desde el Footer.
- **Beneficios PyME/Enterprise**: visibles en dashboard (plan actual con beneficios) y en perfil (sección planes).
- **Mapas de semáforos**: GET `/api/dashboard/semaphores` desde Prisma (seed); MapSemaforo en dashboard.
- **Calificaciones empleado ↔ empleador**: GET `/api/dashboard/ratings`; listado en dashboard (recibidas y promedio).
- **Dashboard Big Data**: métricas desde GET `/api/dashboard/metrics` (ofertas, transacciones, calificación, uso chips); ranking y chips reflejados en UI.

---

## 3. Seed de datos iniciales

- **Usuarios**: Admin (Mbareté), PyME, Enterprise, Valé, Capeto, Kavaju, Básico; cada uno con imagen (dicebear), WhatsApp, subscriptionPlanId (slug del plan), profileStatus OK.
- **Planes**: Básico, Valé, Capeto, Kavaju, Mbareté, PyME, Enterprise con precios (0 o 149000/499000), period month, maxOffers/maxTransfers, benefits JSON.
- **Semáforos**: Central, Alto Paraná, Itapúa, Boquerón (green/green/yellow/red).
- **Escudos**: SALUD, FINTECH, COMUNIDAD, SUBSIDIO.
- **Consent**: privacy-v1, terms-v1, consent-login por usuario.
- **Wallets** y transacción inicial para admin.
- **Ratings**: muestras employer_to_employee y employee_to_employer.

---

## 4. Fricción / upgrade

- **Modal de upgrade**: en Dashboard, "Mejorar plan" abre SubscriptionUpgrade con planes Valé, PyME, Enterprise; botón "Pagar y activar" (simulado).
- **Límites de plan**: plan del usuario en `/api/dashboard/plan` y `/api/auth/me` (maxOffers, maxTransfers); se pueden usar en Wallet/Cerebro/Chat/Video para bloquear o mostrar modal.
- **Roles en sesión**: JWT/sesión con role; permisos por rol en guards.
- **Bloqueo por perfil**: ProfileGuard redirige a `/profile` si profileStatus !== OK al acceder a Wallet, Cerebro, Chat, Video, Dashboard.

---

## 5. Legal y consentimiento

- Consentimiento obligatorio en registro (flujo auth).
- Privacy y Terms accesibles en `/legal/privacy` y `/legal/terms`; enlazados en Footer.
- Tabla Consent en Prisma; seed de aceptación para usuarios iniciales (privacy-v1, terms-v1, consent-login).

---

## 6. DB y Prisma

- `schema.prisma` con User, Profile, Consent, Wallet, WalletTransaction, Shield, UserShield, SubscriptionPlan, Semaphore, Rating.
- `npm run db:seed` (seed.js) carga datos iniciales.
- `npm run db:check`: verifica conexión. `npx prisma migrate dev`: migraciones.

---

## 7. Desarrollo y localhost

- `npx next dev` (o `npm run dev`): app en localhost; rutas `/`, `/home`, `/wallet`, `/cerebro`, `/chat`, `/video`, `/dashboard`, `/profile` sin 404.
- Seed: `npm run db:seed` (tras migraciones). Avatar y datos de usuario se cargan desde BD al iniciar sesión con usuarios seed (ej. vale@yapo.local / Demo123!).

---

## 8. GitHub

- Estructura lista para push: `.env.example`, `package.json`, `prisma/`, `src/`, `scripts/`, `docs/`.
