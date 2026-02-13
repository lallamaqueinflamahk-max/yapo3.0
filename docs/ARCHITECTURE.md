# Arquitectura YAPÓ 3.0

## Reglas de conexión

- **Todo pasa por el Cerebro**: Las decisiones de autorización (hold/release, permisos, feature gates) se centralizan en el Cerebro (`decidir`, `autorizar`, barEngine). La UI y la Wallet consultan o ejecutan según esa decisión.
- **La Wallet obedece decisiones**: Las operaciones sensibles (hold, release) se hacen en `src/lib/wallet/service.ts` y **solo después** de `decidir()` del Cerebro. Transfer crea estado `pending`; hold/release aplican al ledger según autorización.
- **El WebSocket solo comunica**: El servidor WS (`backend/ws-server`) reenvía mensajes (chat, typing, video signaling, wallet_event). No ejecuta lógica de negocio ni llama al Cerebro ni al ledger.
- **SAFE MODE activo**: Con `NEXT_PUBLIC_YAPO_SAFE_MODE=true` (y/o `YAPO_SAFE_MODE=true`) se inyecta sesión mock (`safe-user`) y el Cerebro Central no bloquea flujos; se sugieren pasos previos en lugar de fallar.

## Flujos

| Origen   | Pasa por Cerebro              | Resultado                    |
|----------|-------------------------------|------------------------------|
| Barra Cerebro | `runBarQuery` → `decidir`     | Respuesta, acciones, navegación |
| Wallet hold/release | `decidir(hold_payment|release_payment)` en `service.ts` | Ledger actualizado solo si autorizado |
| Feature gates / permisos | `shouldNeverBlock`, `autorizar`, `canAccessFeature` | Acceso o paso sugerido |
| WebSocket | No                            | Solo reenvío de mensajes     |

## Despliegue (Vercel, localhost, ngrok)

- **Build**: `npm run build` en la raíz (Next.js). Sin backend WS/Wallet en Vercel; opcional desplegar WS y Wallet en otro servicio y configurar `NEXT_PUBLIC_WS_URL` y `WALLET_API_URL`.
- **Localhost**: App en `localhost:3000`; WS en `localhost:3001`; Wallet API en `localhost:3002` si se usa. Mismo comportamiento con SAFE MODE.
- **ngrok**: Igual que localhost; apuntar `NEXT_PUBLIC_WS_URL` y `WALLET_API_URL` a las URLs del túnel si los backends están detrás de ngrok.
- **Mobile**: PWA (manifest, standalone); viewport y safe-area en layout; botones y áreas táctiles ≥ 44px.
