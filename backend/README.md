# YAPÓ Backend

## Servicios

### 1. Chat (WebSocket)

Servidor de mensajería interna: chat privado 1 a 1, chat grupal, estados online y escribiendo.

```bash
cd backend
npm install
npm start
```

Escucha por defecto en el puerto **3001**. Para otro puerto: `WS_PORT=3002 npm start`.

### 2. Wallet API (REST)

API REST de billetera interna: balance por usuario, transferencias internas. Store in-memory; balance cifrado en reposo; transacciones firmadas. **NO dinero real.**

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

La app Next.js usa `/api/wallet/*` como proxy a este backend (variable `WALLET_API_URL` o `http://localhost:3002`).

## Arquitectura

- **mensajes**: por sala (`roomId`), con `userId`, `userName`, `text`, `createdAt`.
- **usuarios**: identificados por `userId` + `userName` (auth vía mensaje `auth`).
- **rooms**: `id`, `name`, `type` (private | group), `participants` (Set de userId).

Eventos cliente → servidor: `auth`, `get_rooms`, `join_room`, `leave_room`, `message`, `typing`.
Eventos servidor → cliente: `auth_ok`, `rooms`, `room_joined`, `messages`, `message`, `presence`.

## Frontend

La app Next.js se conecta a `ws://<hostname>:3001` (o `NEXT_PUBLIC_WS_URL` si está definida). Ejecutá el backend antes de usar el chat.
