# YAPÓ 3.0 – Starter completo

Starter listo para localhost y GitHub con UI, rutas, seed, dashboards, legal y fricción/upgrade.

## Estructura

- **src/app/** – App Router: `/home`, `/wallet`, `/cerebro`, `/chat`, `/video`, `/dashboard`, `/profile`, `/legal/privacy`, `/legal/terms`, `/legal/consent`
- **src/components/** – Navbar (menú 3 líneas, flecha atrás), Avatar, Footer (con links legales), PlanCard, SubscriptionUpgrade, WhatsAppButton, MapSemaforo, MetricsCard
- **lib/** – db.ts, auth-next/, ai/, wallet/, subscription/usePlanLimit
- **prisma/** – schema con User, Profile, Consent, Wallet, WalletTransaction, Shield, UserShield, SubscriptionPlan, Semaphore, Rating
- **scripts/** – check-db.js, seed.js (usuarios, planes, semáforos, consentimientos, wallets, ratings)

## Cómo levantar en localhost

1. Variables: copiar `.env.example` a `.env.local`, configurar `DATABASE_URL` (PostgreSQL).
2. DB: `npm run db:check` → `npx prisma migrate dev` (crea tablas).
3. Seed: `npm run db:seed` (carga usuarios, planes, semáforos, consentimientos).
4. App: `npm run dev` → http://localhost:3000

Rutas sin 404: `/`, `/home`, `/wallet`, `/cerebro`, `/chat`, `/video`, `/dashboard`, `/profile`, `/legal/privacy`, `/legal/terms`, `/legal/consent`.

## Usuarios seed (contraseña: Demo123!)

- admin@yapo.local (Mbareté)
- pyme@yapo.local, enterprise@yapo.local
- vale@yapo.local, capeto@yapo.local, kavaju@yapo.local
- basico@yapo.local (Valé, plan Básico)

Todos con profileStatus OK, avatar (DiceBear), WhatsApp y consentimientos.

## Planes y precios (seed)

- Básico, Valé, Capeto, Kavaju, Mbareté: 0 PYG
- PyME: 149.000 PYG/mes
- Enterprise: 499.000 PYG/mes

## Legal y consentimiento

- Footer: enlaces a Privacidad, Términos, Consentimiento.
- Consent en Prisma; seed registra privacy-v1, terms-v1, consent-login para cada usuario.

## Fricción / upgrade

- `SubscriptionUpgrade`: modal para pagar upgrade cuando el plan no permite más recursos.
- `usePlanLimit`: hook para comprobar límites (ofertas, transferencias) y abrir modal.
- Bloqueo por perfil: ProfileGuard redirige a `/profile` si profileStatus !== OK.

## GitHub

Estructura lista para push: `.env.example`, `package.json`, `prisma/`, `src/`, `scripts/`, `docs/`. No commitear `.env` ni `.env.local`.
