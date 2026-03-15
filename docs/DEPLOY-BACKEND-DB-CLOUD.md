# Despliegue de backend y base de datos en la nube – YAPÓ 3.0

Guía para desplegar en **Google Cloud** o **DigitalOcean**: base de datos PostgreSQL gestionada, backend (API billetera + WebSocket), monitoreo, backups y procedimientos de mantenimiento.

---

## 1. Comparativa rápida: Google Cloud vs DigitalOcean

| Criterio | DigitalOcean | Google Cloud |
|----------|--------------|--------------|
| **Simplicidad** | Muy alta: App Platform, Managed DB en pocos clics | Mayor curva: Cloud Run, Cloud SQL, IAM |
| **Coste inicial** | Bajo (~5–25 USD/mes para DB + app) | Similar o algo mayor según región |
| **Regiones** | Varias (incl. NYC, SFO, AMS) | Muchas más; mejor si necesitás LATAM (São Paulo, etc.) |
| **Backups** | Automáticos en Managed DB (7–30 días) | Cloud SQL: automáticos, point-in-time recovery |
| **Escalabilidad** | Vertical y horizontal en App Platform / Droplets | Muy buena (Kubernetes, Cloud Run) |
| **Recomendación** | Equipos pequeños, MVP, tiempo de configuración corto | Si ya usás GCP o necesitás integración con BigQuery/Google |

**Recomendación para YAPÓ:** Empezar con **DigitalOcean** (menos fricción, documentación clara). Migrar a GCP más adelante si se necesita mayor escala o regiones específicas.

---

## 2. Arquitectura objetivo

```
[Vercel / Next.js]  ←  Frontend (ya desplegado)
        │
        ├── DATABASE_URL → [PostgreSQL gestionado]
        ├── WALLET_API_URL → [Backend: Wallet API :3002]
        └── NEXT_PUBLIC_WS_URL → [Backend: WebSocket :3001]
```

- **Base de datos:** PostgreSQL gestionado (DO Managed Database o Google Cloud SQL). Solo la app Next.js (Vercel) y, si aplica, jobs internos usan la DB; el backend en `backend/` es stateless (wallet en memoria/archivo).
- **Backend:** Servidor Node que expone Wallet API (HTTP) y WebSocket (chat). Puede ser un solo despliegue que levante ambos procesos (ver `backend/start-cloud.js` y `backend/Dockerfile`).

---

## 3. Opción A: DigitalOcean

### 3.1 Base de datos (Managed PostgreSQL)

1. Entrá a [DigitalOcean](https://cloud.digitalocean.com) → **Databases** → **Create Database Cluster**.
2. Elegí **PostgreSQL** (versión 15 o 16).
3. Plan: **Basic** (1 nodo, 1 vCPU, 1 GB RAM) para desarrollo/staging; **Production** para producción.
4. Región: la más cercana a tus usuarios (ej. NYC, SFO).
5. Creá el cluster y anotá:
   - **Host** (ej. `db-postgresql-xxx.db.ondigitalocean.com`)
   - **Port** (25060 por defecto)
   - **Database** (por defecto `defaultdb`; podés crear una `yapo` desde la consola)
   - **User** y **Password** (o certificado)

**Connection string (SSL obligatorio):**

```
postgresql://USUARIO:PASSWORD@HOST:PORT/defaultdb?sslmode=require
```

Crear base `yapo` (desde la pestaña "Connection" o con cliente):

```sql
CREATE DATABASE yapo;
```

Y usar:

```
postgresql://USUARIO:PASSWORD@HOST:PORT/yapo?sslmode=require
```

**Backups:** En Managed DB, DigitalOcean hace backups automáticos (conservación según plan). Podés hacer restores desde el panel.

### 3.2 Backend (App Platform o Droplet)

**Opción 3.2.1 – App Platform (recomendado)**

1. **Create App** → conectar repo GitHub (carpeta `backend` o repo que contenga `backend/`).
2. **Source:** directorio `backend`, branch `main`.
3. **Build:** Docker (usar `backend/Dockerfile`) o **Native** con:
   - Build command: `npm install`
   - Run command: `node start-cloud.js` (o `npm run cloud`; levanta WS en 3001 y Wallet API en 3002)
4. **Env vars:** `WS_PORT=3001`, `WALLET_API_PORT=3002`. No hace falta `DATABASE_URL` en el backend si la wallet es en memoria; si en el futuro la wallet usa DB, añadirla.
5. **Resources:** 512 MB RAM mínimo.
6. **HTTP/Routes:** exponer puerto 3002 como servicio público (Wallet API). Para WebSocket, exponer puerto 3001; App Platform soporta TCP/WebSocket en el mismo servicio.

Si usás un solo componente en App Platform que escucha en dos puertos, configurá **dos puertos** (3001 y 3002) y asigná el dominio o subdominio al que corresponda (ej. `api.tudominio.com` → 3002, `ws.tudominio.com` → 3001).

**Opción 3.2.2 – Droplet + Docker**

1. Crear Droplet (Ubuntu 22.04, plan básico).
2. Instalar Docker: `curl -fsSL https://get.docker.com | sh`.
3. Clonar repo, construir imagen en `backend/`: `docker build -t yapo-backend ./backend`
4. Ejecutar:
   ```bash
   docker run -d --restart unless-stopped \
     -p 3001:3001 -p 3002:3002 \
     -e WS_PORT=3001 -e WALLET_API_PORT=3002 \
     --name yapo-backend yapo-backend
   ```
5. Configurar Nginx (o Caddy) como reverse proxy con SSL (Let’s Encrypt) para `api.tudominio.com` (3002) y `ws.tudominio.com` (3001).

### 3.3 Variables en Vercel (frontend)

En el proyecto Next.js en Vercel, configurá:

- `DATABASE_URL` = connection string de Managed PostgreSQL (con `?sslmode=require`).
- `WALLET_API_URL` = `https://api.tudominio.com` (o la URL pública del Wallet API).
- `NEXT_PUBLIC_WS_URL` = `wss://ws.tudominio.com` (o la URL pública del WebSocket).
- El resto según `VERCEL_DEPLOY.md` y `.env.example`.

---

## 4. Opción B: Google Cloud

### 4.1 Base de datos (Cloud SQL)

1. [Cloud Console](https://console.cloud.google.com) → **SQL** → **Create Instance**.
2. Elegí **PostgreSQL** (15 o 16).
3. **Instance ID:** p. ej. `yapo-db`. Región recomendada si hay usuarios en LATAM: `southamerica-east1` (São Paulo).
4. **Configuration:** Machine type pequeño (1 vCPU, 3.75 GB) para empezar; activar **Storage auto-increase**.
5. **Connections:** **Private IP** (recomendado si la app corre en GCP) o **Public IP** con autorización de redes. Para Vercel usás IP pública y lista de redes autorizadas (o 0.0.0.0/0 solo si se protege con usuario/contraseña fuerte y SSL).
6. Crear usuario y base: en la instancia, **Databases** → crear `yapo`; **Users** → crear usuario y contraseña.

**Connection string:**

```
postgresql://USUARIO:PASSWORD@IP_PUBLICA:5432/yapo?sslmode=require
```

**Backups:** Cloud SQL hace backups automáticos; podés activar point-in-time recovery en **Backups**.

### 4.2 Backend (Cloud Run)

1. Construir imagen y subir a Artifact Registry (o Container Registry):
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/TU_PROYECTO/yapo-backend
   ```
2. **Cloud Run** → **Create Service**:
   - Imagen: `gcr.io/TU_PROYECTO/yapo-backend`
   - Puerto: 3002 (Wallet API). Para WebSocket, Cloud Run no soporta WS largo de la misma forma; opción: desplegar el WS en **Compute Engine** o **GKE** (un solo VM con Docker que exponga 3001 y 3002), o usar un servicio solo para WS.
3. Variables de entorno: `WALLET_API_PORT=3002`, `WS_PORT=3001` (si el contenedor levanta ambos, Cloud Run usará el puerto configurado para HTTP).
4. Autoscaling: mínimo 0, máximo 5 para empezar.

**Nota:** Si necesitás WebSocket estable, en GCP suele desplegarse el servidor WS en una VM (Compute Engine) o en GKE; Cloud Run está pensado para HTTP request/response.

### 4.3 Variables en Vercel

Igual que en DO: `DATABASE_URL` (Cloud SQL), `WALLET_API_URL` (URL de Cloud Run o del backend), `NEXT_PUBLIC_WS_URL` (URL del servicio WS si va aparte).

---

## 5. Monitoreo básico

- **Health checks:** El Wallet API expone `GET /health`. Configurar en la plataforma (DO App Platform, Cloud Run o load balancer) un health check a `https://api.tudominio.com/health` cada 1–2 minutos.
- **Logs:** Revisar logs del backend en el panel (DO: App Platform / Droplet; GCP: Cloud Logging). Buscar errores 5xx y excepciones.
- **Uptime externo (opcional):** [Uptime Robot](https://uptimerobot.com) o similar: monitorear cada 5 min la URL del frontend, `DATABASE_URL` (vía un endpoint que haga una query simple) y `WALLET_API_URL/health`. Alertas por email o Slack.
- **Métricas:** En DO/GCP ver uso de CPU, memoria y disco del backend y de la DB; definir umbrales (ej. >80 % CPU) y alertas.

---

## 6. Backups

- **PostgreSQL gestionado (DO o GCP):** Los backups automáticos están activos por defecto. Revisar en el panel la ventana de retención (7–30 días) y hacer al menos una restauración de prueba por trimestre.
- **Backup manual (opcional):** Ejecutar desde un job o cron (en tu máquina o en un worker en la nube):
  ```bash
  pg_dump "postgresql://..." -Fc -f yapo_$(date +%Y%m%d).dump
  ```
  Subir el `.dump` a un bucket (S3, DO Spaces, GCS) con rotación (ej. conservar últimos 7 días).
- **Wallet/archivos:** Si el backend persiste datos en disco (ej. `wallet-store` en archivos), incluir ese volumen en snapshots del servidor (Droplet snapshot o disco persistente en GCP) o replicar a un bucket.

---

## 7. Escalabilidad

- **Base de datos:** Escalar verticalmente (más RAM/CPU en el plan Managed DB / Cloud SQL). Si en el futuro hay muchas lecturas, considerar réplicas de solo lectura.
- **Backend:** En DO App Platform o Cloud Run podés subir el número de instancias (escala horizontal). En Droplet, primero escalar verticalmente; luego, si hace falta, añadir más Droplets detrás de un load balancer.
- **WebSocket:** Mantener afinidad por sesión (sticky sessions) si usás más de una instancia del servidor WS; si no, todos los clientes deben conectarse al mismo nodo (un solo contenedor/VM para WS es habitual al inicio).

---

## 8. Acceso y procedimientos de mantenimiento

### 8.1 Acceso al equipo

- **DigitalOcean:** Invitar miembros al equipo (Settings → Team). Roles: solo lectura o billing/admin según responsabilidad.
- **Google Cloud:** IAM por proyecto; asignar roles (Viewer, Cloud SQL Client, etc.) por cuenta o grupo.
- **Vercel:** Invitar al equipo al proyecto; permisos de deploy según rol.
- **Secrets:** Guardar `DATABASE_URL`, API keys y secrets en un gestor (1Password, Vault, o variables de entorno del proyecto) y limitar quién puede verlas. No subir `.env` al repo.

### 8.2 Procedimientos habituales

| Tarea | Procedimiento |
|-------|----------------|
| **Cambiar variable de entorno** | Vercel: Project → Settings → Environment Variables. Backend: en DO App Platform o Cloud Run, editar env vars y redesplegar si aplica. |
| **Ver logs del backend** | DO: App → Runtime Logs. GCP: Cloud Logging, filtrar por recurso del servicio. |
| **Restaurar base de datos** | DO: Databases → cluster → Backups → Restore. GCP: Cloud SQL → Backups → Restore. Luego ejecutar migraciones si hace falta: `npx prisma migrate deploy`. |
| **Desplegar nueva versión del backend** | Push a `main` si está conectado el repo; o build local + `docker push` y actualizar imagen en Cloud Run / App Platform. |
| **Aplicar migraciones Prisma** | Desde máquina con acceso a red de la DB o desde un job temporal: `DATABASE_URL=... npx prisma migrate deploy` (en la raíz del repo Next.js). |
| **Incidente: backend no responde** | 1) Revisar logs. 2) Reiniciar servicio (App Platform / Cloud Run / Droplet). 3) Revisar health check y reinicios automáticos. 4) Si es DB, revisar conexiones activas y reinicio de instancia DB solo si es necesario. |

### 8.3 Contactos y documentación

- Dejar documentado en el equipo: quién tiene acceso a cada plataforma (DO, GCP, Vercel) y quién es responsable de DB, backend y frontend.
- Mantener este doc actualizado cuando cambien URLs, nombres de proyectos o procedimientos.
- Enlace a documentación oficial: [DigitalOcean Docs](https://docs.digitalocean.com), [Google Cloud Docs](https://cloud.google.com/docs).

---

## 9. Resumen

| Componente | DigitalOcean | Google Cloud |
|------------|--------------|--------------|
| **DB** | Managed PostgreSQL | Cloud SQL (PostgreSQL) |
| **Backend** | App Platform o Droplet + Docker | Cloud Run (HTTP) + VM o GKE (WS si aplica) |
| **Backups** | Automáticos en Managed DB | Automáticos en Cloud SQL |
| **Monitoreo** | Logs + health check + Uptime Robot | Cloud Logging + health check + Uptime Robot |

---

## 10. Checklist de puesta en producción

- [ ] Cuenta creada en DigitalOcean o Google Cloud y facturación configurada.
- [ ] PostgreSQL gestionado creado; `DATABASE_URL` con SSL (`?sslmode=require`); base `yapo` creada.
- [ ] Migraciones aplicadas: `npx prisma migrate deploy` (desde repo Next.js con `DATABASE_URL` apuntando a la DB en la nube).
- [ ] Backend desplegado (App Platform / Cloud Run / Droplet) con `backend/Dockerfile` o `node start-cloud.js`; puertos 3001 (WS) y 3002 (Wallet API) accesibles.
- [ ] Dominios o URLs públicas asignadas al Wallet API y al WebSocket; SSL activo (HTTPS/WSS).
- [ ] En Vercel: `DATABASE_URL`, `WALLET_API_URL`, `NEXT_PUBLIC_WS_URL` y el resto de variables configuradas.
- [ ] Health check configurado sobre `GET /health` del Wallet API.
- [ ] Backups automáticos de la DB verificados; al menos una prueba de restore documentada.
- [ ] Equipo con acceso documentado (quién administra DB, backend, Vercel) y procedimientos de incidencias compartidos.

Con esto tenés el sistema de backend y base de datos desplegado en la nube, con entorno estable, monitoreo básico, backups y procedimientos de mantenimiento documentados para el equipo.
