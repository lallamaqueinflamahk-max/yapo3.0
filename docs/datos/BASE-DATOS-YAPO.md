# Base de datos YAPÓ 3.0

**Objetivo:** Base optimizada, confiable y lista para integrarse con backend y frontend.

---

## 1. Stack y acceso

| Elemento | Tecnología |
|----------|------------|
| Motor | PostgreSQL |
| ORM | Prisma |
| Cliente | `src/lib/db.ts` (singleton `prisma`) |
| URL | `DATABASE_URL` en `.env` |

```bash
# Generar cliente tras cambios en schema
npx prisma generate

# Aplicar migraciones (producción)
npx prisma migrate deploy

# Desarrollo (crear migración)
npx prisma migrate dev --name nombre_cambio
```

---

## 2. Estructura y relaciones

### 2.1 Auth (NextAuth v5)

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **Account** | Cuentas OAuth (Google, etc.) | → User |
| **Session** | Sesiones activas | → User |
| **VerificationToken** | Tokens de verificación (reset password, etc.) | — (PK compuesta `identifier`, `token`) |

- **User** es el núcleo: `Account`, `Session`, `Profile`, `Consent`, `Wallet`, `UserShield`, `Rating`, `SearchHistory`.

### 2.2 Identidad y perfil

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **User** | Usuario (email, role, whatsapp, plan) | 1:1 Profile, Wallet; 1:N Account, Session, Consent, UserShield, Rating, SearchHistory |
| **Profile** | Perfil extendido (territorio, trabajo, educación) | → User |
| **Consent** | Consentimientos legales (versión, IP, userAgent) | → User |
| **SubscriptionPlan** | Planes (slug, precio, límites) | — (User.subscriptionPlanId = plan.slug) |

- **User.role:** `vale | capeto | kavaju | mbarete | cliente | pyme | enterprise`.
- **User.subscriptionPlanId:** almacena el **slug** del plan (ej. `vale`, `pyme`). Para nombre para mostrar usar `SubscriptionPlan` por slug.

### 2.3 Wallet y escudos

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **Wallet** | Billetera por usuario (balance, status) | → User; 1:N WalletTransaction |
| **WalletTransaction** | CREDIT / DEBIT / TRANSFER | → Wallet |
| **Shield** | Tipos de escudo (SALUD, FINTECH, etc.) | 1:N UserShield |
| **UserShield** | Escudo asignado a usuario | → User, → Shield |

- Transacciones sensibles: usar **transacciones Prisma** (`prisma.$transaction`) para débito/crédito atómico (ver `src/lib/wallet-db/service.ts`).

### 2.4 Calificaciones y semáforos

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **Rating** | Calificación 1-5 (empleado↔empleador) | → User (fromUser), → User (toUser) |
| **Semaphore** | Semáforo por zona (green/yellow/red) | — |

- **Rating.type:** `employee_to_employer` | `employer_to_employee`.

### 2.5 Geografía y mapa

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **GeografiaPy** | Barrios (slug, departamento, ciudad, lat/lng) | 1:N MetricasSemaforo, PedidoGeo, ProfesionalGeo |
| **MetricasSemaforo** | Métricas por barrio + rubro (densidad, demanda, nivel) | → GeografiaPy |
| **Rubro** | Categorías (nombre, slug) | 1:N PedidoGeo, ProfesionalGeo |
| **ProfesionalGeo** | Profesional en zona (rubro, barrio, calidad, userId opcional) | → GeografiaPy; → Rubro (por `nombre`) |
| **PedidoGeo** | Pedido por rubro y barrio (estado) | → GeografiaPy, → Rubro |

- **API mapa:** barrio por **slug** (ej. `asuncion-botanic`). Resolución: `GeografiaPy.slug` → `idBarrio` → filtros en `ProfesionalGeo` y `MetricasSemaforo`.
- **ProfesionalGeo.rubro** referencia **Rubro.nombre** (no `id`). Mantener coherencia con seed de rubros; a futuro valorar migrar a `rubroSlug` → `Rubro.slug`.

### 2.6 Búsqueda (placeholder adaptativo)

| Modelo | Descripción | Relaciones |
|--------|-------------|------------|
| **SearchHistory** | Historial de búsquedas por usuario y rol | → User |

- Uso: sugerencias en barra de búsqueda, placeholder “Continuar con: X” por rol y última búsqueda.

---

## 3. Índices (rendimiento)

| Tabla | Índice | Uso |
|-------|--------|-----|
| User | `role` | Filtros por rol |
| Session | `(userId, expires)` | Limpieza de sesiones vencidas |
| Consent | `(userId, version)` | Comprobar versión aceptada |
| Rating | `(fromUserId, toUserId, type)` | Listados y dedup |
| WalletTransaction | `(walletId, createdAt)` | Historial por billetera |
| ProfesionalGeo | `(id_barrio, rubro)` | Búsqueda mapa por zona y oficio |
| ProfesionalGeo | `user_id` | “Mis ofertas” / perfil |
| pedidos | `(id_barrio, estado)` | Demanda activa por zona |
| SearchHistory | `(userId, createdAt)` | Últimas búsquedas |

---

## 4. Seguridad y buenas prácticas

- **Contraseñas:** solo hash en `User.passwordHash` (bcrypt/argon2 en registro y login).
- **Tokens:** `Account` (access_token, refresh_token, id_token) y `VerificationToken`; no loguear ni exponer en front.
- **Consent:** registrar versión, IP y userAgent en `Consent` para auditoría.
- **Wallet:** operaciones de dinero siempre en transacción; no confiar solo en checks en aplicación.
- **RLS (Row Level Security):** para multi-tenant estricto, valorar políticas por `userId` en tablas sensibles (User, Wallet, Profile, Consent). No aplicado aún en este esquema.

---

## 5. Integración con backend y frontend

### APIs que usan Prisma

- **Auth:** `src/lib/auth-next/config.ts` (adapter Prisma), `register`, `login`, `forgot-password`, `reset-password`, `me`, `profile`, `profile-status`, `consent`.
- **Wallet:** `src/lib/wallet-db/service.ts`, `guard.ts`, `shields.ts`.
- **Mapa:** `src/app/api/mapa/zonas/profesionales`, `src/app/api/mapa/profesiones`, `src/app/api/mapa/censo`, `src/app/api/mapa/funcionalidades`.
- **Dashboard:** `src/app/api/dashboard/plan`, `ratings`, `metrics`, `semaphores`.
- **Adaptive UI:** `src/app/api/adaptive-ui/config`.
- **Perfil público:** `src/app/api/profile/public/[userId]`.

### Procedimientos clave

1. **Registro:** crear `User` + `Profile`; opcionalmente `Consent` en primer login.
2. **Wallet:** obtener o crear `Wallet` por `userId`; transacciones con `prisma.$transaction` para débito/crédito.
3. **Mapa profesionales:** `GeografiaPy` por `slug` (barrioId) → `ProfesionalGeo` por `idBarrio`; enriquecer con `User` cuando exista `userId`.
4. **Placeholder búsqueda:** leer últimas filas de `SearchHistory` por `userId` (y opcionalmente `role`) para sugerir texto en la barra.

---

## 6. Migraciones

- Historial en `prisma/migrations/`.
- **20260204000000_optimize_and_search_history:** índices, `updatedAt` en User/Profile/Wallet, FKs de Rating, tabla `SearchHistory`, PK de VerificationToken.

Tras cambiar `schema.prisma`:

```bash
npx prisma migrate dev --name descripcion_cambio
npx prisma generate
```

---

## 7. Seed (opcional)

- **SubscriptionPlan:** slugs `basico`, `vale`, `capeto`, `kavaju`, `pyme`, `enterprise`.
- **GeografiaPy:** barrios con `slug` alineados al frontend (ej. `semaphores-map.ts`).
- **Rubro:** nombres que usa `ProfesionalGeo.rubro` (ej. Plomería, Electricista).
- **Shield:** tipos SALUD, FINTECH, COMUNIDAD, SUBSIDIO.

Ejecutar seed: `npx prisma db seed` (configurar en `package.json` si se usa).
