#!/usr/bin/env node
/**
 * QA Checklist – Starter YAPÓ 3.0
 * Ejecutar: node scripts/qa-checklist.js
 * Ver detalles en docs/QA-TEST-PLAN.md
 */

const checklist = `
╔══════════════════════════════════════════════════════════════════════╗
║  QA CHECKLIST – Starter YAPÓ 3.0 (mobile-first)                     ║
╚══════════════════════════════════════════════════════════════════════╝

Variables de entorno (copiar .env.example → .env.local):
  [ ] localhost: NEXT_PUBLIC_WS_URL vacío o ws://localhost:3001
  [ ] Vercel:   NEXT_PUBLIC_WS_URL=wss://tu-servidor-ws.com
  [ ] ngrok:    ngrok http 3001 → NEXT_PUBLIC_WS_URL=wss://xxxx.ngrok.io

Cerebro – Intents mock:
  [ ] wallet_view:    Chip "Mi billetera" → mensaje + navegación a /wallet
  [ ] wallet_transfer: Chip "Transferir"  → guard/applyTransaction o validación
  [ ] escudo_activate: Chip "Activar escudo" → mensaje + /wallet
  [ ] Chips UI:       Todos clickeables; consola [CerebroEngine] intent/resultado

Wallet y Escudos:
  [ ] /wallet: saldo disponible y protegido visibles
  [ ] Enviar/Recibir; subsidios; semáforo en Home (Verde/Amarillo/Rojo)

Chat:
  [ ] /chat: listado; enlaces "Chat 1-1" y "Chat grupal"
  [ ] /chat/private: envío mensaje; mock o backend; "en línea" / "escribiendo"
  [ ] /chat/group: mismo flujo; consola [ChatService] si usás ChatService

Video:
  [ ] /video: crear sala / unirse; join/leave; consola [VideoService] video_join/video_leave
  [ ] Cámara local y remotos; controles mic/cámara/colgar

Consola esperada:
  [ ] [CerebroEngine] intent emitido / resultado
  [ ] [ChatService] WS_URL, join_room, send message (con backend)
  [ ] [VideoService] signaling WS_URL, createRoom/joinRoom, video_leave

Móvil:
  [ ] UI usable en 320px+; colores Paraguay (rojo #D52B1E, azul #002395)
  [ ] Safe area en barras fijas (chat input, controles video)

Backend WebSocket (opcional):
  [ ] backend/ws-server: npm run dev en puerto 3001
  [ ] Logs del servidor: auth, join_room, chat_message, typing, video_*

Base para OpenAI + ElevenLabs:
  [ ] NEXT_PUBLIC_AI_MODE=local (cambiar a openai cuando tengas API key)
  [ ] NEXT_PUBLIC_VOICE_MODE=local (cambiar a elevenlabs cuando tengas API key)

Detalle completo: docs/QA-TEST-PLAN.md
`;

console.log(checklist);
