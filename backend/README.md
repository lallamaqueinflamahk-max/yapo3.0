# YAPÓ Backend

Servicios externos opcionales: **WebSocket (chat)** y **Wallet API (REST)**. En producción la API principal es Next.js (`/api/*`) con Prisma y PostgreSQL; el frontend puede usar solo Next.js o además estos servicios.

## Servicios

### 1. Chat (WebSocket)

Servidor de mensajería interna: chat privado 1 a 1, chat grupal, estados online y escribiendo.

```bash
cd backend
npm install
npm start
```

Escucha por defecto en el puerto **3001**. Para otro puerto: `WS_PORT=3002 npm start`.

Variable en el frontend: `NEXT_PUBLIC_WS_URL` (ej. `wss://tu-servidor.com` en producción).

### 2. Wallet API (REST)

API REST de billetera: balance por usuario, transferencias internas. **Store in-memory** en este servidor; **NO dinero real.**

```bash
cd backend
npm install
npm run wallet
```

Escucha por defecto en el puerto **3002**. Para otro puerto: `WALLET_API_PORT=3003 npm run wallet`.

Endpoints:

- `GET /health` — estado del servicio
- `GET /balance/:userId` — saldo del usuario
- `GET /transactions/:userId?limit=50` — historial de transacciones
- `POST /transfer` — body: `{ fromUserId, toUserId, amount }`

**Nota:** La app Next.js puede usar la wallet persistida en PostgreSQL vía `/api/wallet/transfer`, `/api/wallet/transactions`, etc. (Prisma). Este backend (`wallet-api.js`) es opcional para desarrollo o despliegue separado; si `WALLET_API_URL` está definida, parte de las rutas `/api/wallet/*` hacen proxy a este servidor.

## Arquitectura

- **mensajes**: por sala (`roomId`), con `userId`, `userName`, `text`, `createdAt`.
- **usuarios**: identificados por `userId` + `userName` (auth vía mensaje `auth`).
- **rooms**: `id`, `name`, `type` (private | group), `participants` (Set de userId).

Eventos cliente → servidor: `auth`, `get_rooms`, `join_room`, `leave_room`, `message`, `typing`.
Eventos servidor → cliente: `auth_ok`, `rooms`, `room_joined`, `messages`, `message`, `presence`.

## Frontend

La app Next.js se conecta a `ws://<hostname>:3001` (o `NEXT_PUBLIC_WS_URL` si está definida). Ejecutá el backend antes de usar el chat.

## Despliegue

| Componente | Dónde desplegar | Variables |
|------------|-----------------|-----------|
| **Next.js (API + app)** | Vercel, Node server | `DATABASE_URL`, `AUTH_SECRET`, OAuth, etc. Ver raíz del repo y `docs/BACKEND.md`. |
| **Chat (WS)** | Railway, Render, Fly.io, VPS | `WS_PORT` (ej. 3001). Exponer URL en `NEXT_PUBLIC_WS_URL` (ej. `wss://ws.tudominio.com`). |
| **Wallet API** | Opcional; mismo host que WS o separado | `WALLET_API_PORT`. Frontend/Next.js usa `WALLET_API_URL` para proxy. |

- **Requisitos:** Node >= 18.
- **Persistencia:** Chat y Wallet API en este repo son en memoria; para producción la API principal (Next.js) usa Prisma y PostgreSQL. Para alta disponibilidad del chat, considerar Redis o persistencia de mensajes en una siguiente fase.
