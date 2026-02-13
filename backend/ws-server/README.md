# YAPÓ WebSocket Server

Servidor WebSocket independiente para:

- **Chat** — mensajes en rooms (privado 1-1, grupal)
- **Eventos del sistema** — reenvío de eventos (ej. `wallet_event`, `user_online`)
- **Signaling WebRTC (video)** — `video_join`, `video_offer`, `video_answer`, `video_ice`

El servidor **no decide lógica**: solo enruta mensajes entre clientes.

## Stack

- Node.js (>=18)
- TypeScript
- `ws`

## Configuración

| Variable       | Descripción                                      | Por defecto |
|----------------|--------------------------------------------------|-------------|
| `WS_PORT` / `PORT` | Puerto del servidor (WS_PORT tiene prioridad) | `3001`      |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma). `*` = todos (desarrollo) | `*` |
| `CORS`         | Alternativa a `CORS_ORIGINS`                     | —           |
| `NODE_ENV`     | `production` reduce logs de debug                | —           |

Copia `.env.example` a `.env` y ajusta si hace falta. Para desarrollo, CORS abierto (`*`) está bien.

## Cómo levantar el servidor

```bash
cd backend/ws-server
npm install
npm run build
npm start
```

O en una sola línea:

```bash
cd backend/ws-server && npm install && npm run build && node dist/index.js
```

Desarrollo con watch:

```bash
npm run dev
# En otra terminal:
node dist/index.js
```

Con `ts-node` (sin compilar):

```bash
npx ts-node src/index.ts
```

## Rooms

- **Privado 1-1**: `roomId` ej. `dm:user1:user2` (convención del cliente).
- **Grupal**: `roomId` ej. `group:groupId`.
- **Video**: `roomId` ej. `video-room:roomId`.

El servidor no interpreta el formato; solo reenvía por `roomId` y/o `toUserId`.

## Identificación por userId

1. Conectar al WebSocket (`ws://localhost:3001` o `wss://...`).
2. Enviar primero: `{ "type": "auth", "payload": { "userId": "user-1" } }`.
3. El servidor responde: `{ "type": "auth_ok", "userId": "user-1" }`.
4. Luego: `{ "type": "join_room", "payload": { "roomId": "room-1" } }` para entrar a un room.

Opcional: `userName` en auth para reenviarlo en signaling (`video_join`, etc.). Sin `auth` previo, los mensajes que requieran `userId` no se enrutarán bien.

### Health (producción)

- `GET /health`, `GET /healthz`, `GET /ready` → `200` + `{ "ok": true, "service": "yapo-ws" }` para probes y load balancers.

### Graceful shutdown

- En `SIGTERM` / `SIGINT` el servidor cierra todas las conexiones WebSocket y el HTTP server de forma ordenada.

## Eventos que reenvía

El servidor **solo reenvía** estos tipos (no los genera ni decide lógica):

| Tipo           | Uso                         |
|----------------|-----------------------------|
| `chat_message` | Chat; reenvío al `roomId`   |
| `user_online`  | Presencia; reenvío a room / usuario |
| `user_typing`  | Escribiendo; reenvío al room |
| `typing`       | Alias de `user_typing`      |
| `wallet_event` | Eventos de billetera        |
| `video_join`   | Entrada a video-room        |
| `video_leave`  | Salida de video-room        |
| `video_offer`  | WebRTC SDP offer            |
| `video_answer` | WebRTC SDP answer           |
| `video_ice`    | WebRTC ICE candidate        |

Mensajes con `toUserId` (ej. `video_offer`, `video_answer`, `video_ice`) se reenvían a ese usuario; el resto por `roomId`.

## Flujo típico del cliente

1. Conectar: `new WebSocket("ws://localhost:3001")`.
2. Auth: `send(JSON.stringify({ type: "auth", payload: { userId: "user-1" } }))`.
3. Unirse a room: `send(JSON.stringify({ type: "join_room", payload: { roomId: "room-1" } }))`.
4. Enviar evento: `send(JSON.stringify({ type: "chat_message", payload: { roomId: "room-1", text: "Hola" } }))`.

El servidor reenvía a todos los miembros del room (excepto el emisor).

## Sin frontend

Este repo solo incluye el servidor WebSocket. El frontend (Next.js, etc.) vive en la raíz del monorepo y se conecta a este servidor vía `NEXT_PUBLIC_WS_URL`.
