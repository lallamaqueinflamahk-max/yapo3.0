# Comandos para levantar YAPÓ 3.0 en localhost

Ejecutá estos comandos en orden desde la raíz del proyecto (`yapo.3.0`).

---

## 1. Variables de entorno

```bash
# Copiar ejemplo a .env.local (Next.js usa este en desarrollo)
copy .env.example .env.local

# En PowerShell:
Copy-Item .env.example .env.local
```

Abrí `.env.local` y configurá al menos:

- `DATABASE_URL` → PostgreSQL local, ej: `postgresql://postgres:TU_PASSWORD@localhost:5432/yapo`
- Opcional: `NEXT_PUBLIC_YAPO_WHATSAPP=595981555555` (número soporte)
- Opcional: `YAPO_WHATSAPP_NUMBER=595981555555` (para seed)

Para que Prisma use la misma URL, podés tener también `.env` con el mismo `DATABASE_URL`, o asegurarte de que esté en `.env.local` y que Prisma lo lea (Next/Prisma suelen leer `.env` y `.env.local`).

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Base de datos

**Crear la base (si no existe):**

En PostgreSQL (psql o pgAdmin):

```sql
CREATE DATABASE yapo;
```

**Verificar conexión:**

```bash
npm run db:check
```

Debe mostrar algo como: `OK: Conexión a la base de datos correcta.`

**Crear tablas (Prisma):**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Si preferís no usar migraciones:

```bash
npx prisma db push
```

**Cargar datos iniciales (seed):**

```bash
npm run db:seed
```

Deberías ver: `✓ Planes`, `✓ Semáforos`, `✓ Escudos`, `✓ Usuarios`, `✓ Perfiles`, `✓ Consentimientos`, `✓ Wallets`, `✓ Calificaciones`, `✅ Seed completado.`

---

## 4. Levantar la app

```bash
npm run dev
```

Abrí **http://localhost:3000**.

Rutas para probar: `/`, `/home`, `/wallet`, `/cerebro`, `/chat`, `/video`, `/dashboard`, `/profile`, `/legal/privacy`, `/legal/terms`, `/legal/consent`.

---

## 5. Login con usuarios del seed

Contraseña de los usuarios seed: **`Demo123!`**

| Email                 | Rol        | Plan       |
|-----------------------|------------|------------|
| admin@yapo.local      | Mbareté    | Mbareté    |
| vale@yapo.local       | Valé       | Valé       |
| capeto@yapo.local     | Capeto     | Capeto     |
| kavaju@yapo.local     | Kavaju     | Kavaju     |
| pyme@yapo.local       | PyME       | PyME       |
| enterprise@yapo.local | Enterprise | Enterprise |
| basico@yapo.local     | Valé       | Básico     |

En la app: **Iniciar sesión** → email + contraseña `Demo123!`.

---

## Resumen rápido (copy-paste)

```bash
copy .env.example .env.local
npm install
npm run db:check
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Luego abrí **http://localhost:3000** e iniciá sesión con `vale@yapo.local` / `Demo123!`.
