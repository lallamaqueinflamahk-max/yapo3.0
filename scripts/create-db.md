# Crear la base de datos `yapo` en PostgreSQL

Si `npm run db:check` devuelve **"Database does not exist"**, la base `yapo` no existe todavía.

## Opción 1: Línea de comandos (psql)

Con PostgreSQL en el PATH:

```bash
psql -U postgres -c "CREATE DATABASE yapo;"
```

Te pedirá la contraseña del usuario `postgres` (la misma que en `DATABASE_URL`).

En Windows, si `psql` no está en el PATH, usá la ruta completa, por ejemplo:

```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE yapo;"
```

(Ajustá la versión `16` según tu instalación.)

## Opción 2: pgAdmin

1. Abrí pgAdmin y conectate al servidor local.
2. Clic derecho en **Databases** → **Create** → **Database**.
3. Nombre: **yapo**.
4. Save.

## Después de crear la base

```bash
npm run db:check
npx prisma migrate dev --name init_wallet
```
