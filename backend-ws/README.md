# backend-ws

WebSocket server for chat and video signaling. Pure WebSocket (no HTTP/Express).

## Run

```bash
cd backend-ws
npm install
npm run build
npm start
```

Listens on port **3001**.

## Events

| Event          | Payload                    | Behavior                          |
|----------------|----------------------------|-----------------------------------|
| auth           | `{ userId }`               | Register client, reply auth_ok    |
| chat_join      | `{ roomId }`               | Add user to chat room             |
| chat_message   | `{ roomId, message }`      | Broadcast to room (no storage)    |
| typing         | `{ roomId, isTyping? }`    | Broadcast to room                 |
| video_join     | `{ roomId, userId?, userName? }` | Add to video room, send participants + user_joined |
| video_offer    | `{ roomId, toUserId?, payload }` | Reenviar a todos los peers del room |
| video_answer   | `{ roomId, toUserId, payload }`  | Reenviar al originador (toUserId)  |
| video_ice      | `{ roomId, toUserId, payload }`   | Reenviar al peer (toUserId)        |
| video_leave    | `{ roomId, userId? }`      | Remove from room, broadcast user_left |

El servidor **no procesa media**; solo reenvía. `fromUserId` se toma del socket (auth).

### Estructura mensaje signaling

```ts
{
  type: 'video_offer' | 'video_answer' | 'video_ice',
  roomId: string,
  fromUserId?: string,  // opcional; el servidor usa el userId del socket
  toUserId?: string,   // obligatorio en video_answer y video_ice
  payload: unknown     // SDP, candidate, etc.
}
```

Múltiples participantes por room: `video_offer` se reenvía a todos los del room excepto el emisor.
