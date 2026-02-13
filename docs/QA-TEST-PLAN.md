# Plan de pruebas QA – Starter YAPÓ 3.0

Objetivo: validar que el starter está funcional en móvil, con intents mock, Wallet/Escudos, Chat 1-1 y grupal, videollamadas multiusuario, y base lista para OpenAI + ElevenLabs.

---

## 1. Variables de entorno (localhost, Vercel, ngrok)

| Entorno   | NEXT_PUBLIC_WS_URL              | NEXT_PUBLIC_SAFE_MODE | Notas |
|----------|----------------------------------|------------------------|--------|
| **localhost** | vacío o `ws://localhost:3001` | `true` | Fallback a `ws://localhost:3001` si vacío. Backend WS en 3001. |
| **Vercel**    | `wss://tu-servidor-ws.com`     | `true` (preview) / `false` (prod) | Obligatorio para chat/video en producción. |
| **ngrok**     | `wss://xxxx.ngrok.io`          | `true` | Túnel a backend WS (ej. `ngrok http 3001`). |

- Copiar `.env.example` → `.env.local` y ajustar.
- Revisar que la consola del navegador no muestre "NEXT_PUBLIC_WS_URL no configurada" cuando se use chat/video en Vercel.

---

## 2. Cerebro – Intents mock

### 2.1 Intents a probar

| Intent             | Acción esperada                         | Dónde probar |
|--------------------|----------------------------------------|--------------|
| **wallet_view**    | Mensaje + navegación a `/wallet`       | Chip "Mi billetera" (Home o CerebroBar) |
| **wallet_transfer**| Guard + applyTransaction (mock) o mensaje/validación | Chip "Transferir" (CerebroBar) |
| **wallet_subsidy** | Navegación a `/wallet` (subsidios)     | Chip "Subsidios" |
| **escudo_activate**| Navegación a `/wallet` + mensaje escudos | Chip "Activar escudo" (CerebroBar) |

### 2.2 Chips UI – Todos clickeables y emitiendo intents

- **Home**: chips de CerebroChips (Mi billetera, etc.). Al tocar → `decide()` → consola `[CerebroEngine] intent emitido` y `resultado`.
- **CerebroBar** (ej. `/cerebro`): fila de MOCK_INTENT_CHIPS (Mi billetera, Transferir, Subsidios, Activar escudo, Mensajes, Perfil, Inicio, Territorio). Cada chip debe:
  - Ser clickeable (feedback visual: loading → success/denied).
  - Emitir intent (intentId + payload).
  - Mostrar resultado (mensaje + opcional navegación).

**Verificación en consola:**

- `[CerebroEngine] intent emitido` con `intentId`, `payload`, `userId`, `role`.
- `[CerebroEngine] resultado` con `allowed`, `message`, `navigationTarget`, `requiresValidation`.

---

## 3. Wallet y Escudos

- **Ruta**: `/wallet`.
- Saldo disponible y protegido visibles.
- Botones Enviar / Recibir; flujo Enviar pasa por Cerebro (guard → applyTransaction).
- Subsidios: lista, Ver condiciones, Aceptar / No aceptar.
- Semáforo territorial (Home): Verde / Amarillo / Rojo según rol; Valé solo lectura.

---

## 4. Chat 1-1 y grupal

### 4.1 Conexión WebSocket

- Con **NEXT_PUBLIC_WS_URL** configurado: conexión a backend WS.
- Consola: logs del backend según implementación (auth, join_room, chat_message, typing).

### 4.2 Chat 1-1

- **Ruta**: `/chat/private?with=user-other&name=Contacto`.
- Envío: escribir y enviar → mensaje aparece en la lista (o mock si no hay backend).
- Recepción: si el backend reenvía mensajes, ver mensajes de otro usuario.
- Estados: "en línea" en header; "escribiendo..." si el backend envía evento `typing`.

**Logs esperados (con ChatService):**

- `[ChatService] WS_URL=...`
- `[ChatService] join_room` { chatId }
- `[ChatService] send message` { chatId, text }
- `[ChatService] message received` (si hay backend)

### 4.3 Chat grupal

- **Ruta**: `/chat/group?roomId=group-demo&name=Equipo%20YAPÓ`.
- Misma lógica: envío/recepción y estados online/escribiendo.
- Mensajes mock si la sala está vacía y no hay backend.

### 4.4 Listado de chat

- **Ruta**: `/chat`.
- Enlaces "Chat 1-1" y "Chat grupal" llevan a las rutas anteriores.
- Crear sala y elegir sala: flujo existente con useChat.

---

## 5. Videollamadas multiusuario

### 5.1 Flujo

- **Ruta**: `/video`.
- Crear sala: ingresar roomId → "Crear" → entra a la sala (createRoom).
- Unirse a sala: ingresar roomId → "Unirse" → joinRoom.

### 5.2 Señalización WebRTC vía WebSocket

- **Join/Leave**: al crear/unirse → `video_join`; al salir → `video_leave`.
- **Offer/Answer**: backend reenvía ofertas y respuestas entre participantes.
- **ICE candidates**: intercambio vía WS (`video_ice`).

**Logs esperados (VideoService):**

- `[VideoService] signaling WS_URL=...`
- `[VideoService] createRoom / video_join` { roomId } o `joinRoom / video_join`
- `[VideoService] video_leave` { roomId }

### 5.3 UI

- Cámara local y remotos en grid.
- Controles: mic, cámara, colgar (mobile-first, usable en celular/emulador).

---

## 6. Render móvil y colores Paraguay

- **Colores**: rojo `#D52B1E` (yapo-red), azul `#002395` (yapo-blue), blanco. Botones y acentos coherentes.
- **Mobile-first**: vistas usables en 320px+; touch targets ≥ 44px; scroll en listas y chat.
- **Safe area**: padding bottom con `env(safe-area-inset-bottom)` en barras fijas (chat input, controles de video).

---

## 7. Resumen de verificación

| Área           | Qué revisar |
|----------------|-------------|
| **Cerebro**    | wallet_view, wallet_transfer, escudo_activate; chips clickeables; logs en consola. |
| **Wallet**     | Saldo, Enviar/Recibir, subsidios, semáforo. |
| **Chat**       | 1-1 y grupal; envío/recepción; estados online/escribiendo; logs WS. |
| **Video**      | Join/leave; offer/answer e ICE vía WS; UI de participantes y controles. |
| **Env**        | localhost (fallback 3001), Vercel (wss obligatorio), ngrok (wss túnel). |
| **Móvil**      | Navegación y acciones mock funcionando; base lista para OpenAI + ElevenLabs. |

---

## 8. Comandos útiles

```bash
# Desarrollo local (frontend)
npm run dev

# Backend WebSocket (si está en el repo, ej. backend/ws-server)
# cd backend/ws-server && npm run dev

# Túnel ngrok al WS (puerto 3001)
# ngrok http 3001
# Luego NEXT_PUBLIC_WS_URL=wss://xxxx.ngrok.io
```

Con este plan se valida el starter en móvil, la consola con intents y eventos WS, y la base para integrar OpenAI + ElevenLabs.
