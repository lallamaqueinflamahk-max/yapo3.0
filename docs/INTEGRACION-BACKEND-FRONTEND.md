# Integración Backend–Frontend YAPÓ 3.0

**Objetivo:** Sistema completamente integrado y funcional: endpoints conectados, comunicación y manejo de errores verificados, UX sin fricciones, listo para agregar features adicionales.

---

## 1. Matriz de integración (Frontend ↔ API)

| Pantalla / Componente | Método | Endpoint | Uso | Respuesta esperada / Notas |
|----------------------|--------|----------|-----|----------------------------|
| **Auth** | | | | |
| `(auth)/register/page.tsx` | POST | `/api/auth/register` | Registro | `{ user }` o `{ error }` (409 email duplicado) |
| `(auth)/login` | — | NextAuth (credentials) | Login | Sesión cookie |
| `(auth)/forgot-password/page.tsx` | POST | `/api/auth/forgot-password` | Recuperar contraseña | 200 / error |
| `(auth)/reset-password/page.tsx` | POST | `/api/auth/reset-password` | Nueva contraseña | 200 / error |
| `(auth)/consent/page.tsx` | POST | `/api/auth/consent` | Guardar consentimientos | 200 / error |
| `LayoutClient.tsx`, `profile/page.tsx` | GET | `/api/auth/me` | Plan, badges, verified | `{ user, badges, verified }` |
| `ProfileGuard.tsx` | GET | `/api/auth/profile-status` | Estado perfil (OK/pendiente) | `{ profileStatus }` |
| `ConsentGuard.tsx` | GET | `/api/auth/consent-check` | Consentimientos actuales | `{ hasRequiredConsent }` o similar |
| **Wallet** | | | | |
| `WalletUI.tsx` | GET | `/api/wallet` (path vacío) | Saldo + escudos (vía estado local) | Usa `getWalletAccount` + refresh con datos de /api/wallet | 
| `WalletUI.tsx` | GET | `/api/wallet/acuerdos` | Lista acuerdos | `{ acuerdos }` o array |
| `WalletUI.tsx` | GET | `/api/wallet/garantias` | Lista garantías | `{ garantias }` o array |
| `wallet-client.ts` (wallet-service) | GET | `/api/wallet/balance/:userId` | Balance (formato API externa) | Solo cuando `WALLET_API_URL` apunta a backend externo; con Next.js solo, se hace proxy y puede 502 |
| `wallet-client.ts` | GET | `/api/wallet/transactions/:userId` | Historial | Idem: proxy a externo |
| `wallet-service.transfer` → `wallet-client` | POST | `/api/wallet/transfer` | Transferencia | Next.js: `POST /api/wallet/transfer` (ruta dedicada). Body: `{ toUserId, amount, reason? }`. Respuesta: ver sección 2. |
| **Mapa** | | | | |
| `mapa/page.tsx` | GET | `/api/mapa/profesiones?barrioId=` | Profesiones por barrio | Lista profesiones |
| `mapa/page.tsx` | GET | `/api/mapa/zonas/profesionales?barrioId=` | Profesionales en zona | Lista profesionales |
| `mapa/page.tsx` | GET | `/api/mapa/zonas/empresas?barrioId=` | Empresas en zona | Lista empresas |
| **Dashboard** | | | | |
| `dashboard/page.tsx` | GET | `/api/dashboard/metrics` | Métricas | Objeto métricas |
| `dashboard/page.tsx` | GET | `/api/dashboard/plan` | Plan de suscripción | Plan actual |
| `dashboard/page.tsx` | GET | `/api/dashboard/ratings` | Calificaciones | Ratings |
| **Perfil** | | | | |
| `profile/page.tsx` | GET | `/api/auth/me` | Usuario + perfil extendido | `{ user, profile, verified, badges, … }` |
| `profile/[userId]/page.tsx` | GET | `/api/profile/public/:userId` | Perfil público | Perfil público |
| **Trabajo / Contrato** | | | | |
| `trabajo/aceptar/page.tsx` | GET | `/api/auth/me` | Usuario actual | — |
| `trabajo/aceptar/page.tsx` | GET | `/api/profile/public/:id` | Perfil del otro usuario | — |
| `trabajo/aceptar/page.tsx` | POST | `/api/contrato/aceptar-propuesta` | Aceptar propuesta | 200 / error |
| **Adaptive UI / Cerebro** | | | | |
| `home/page.tsx` | GET | `/api/adaptive-ui/config` | Configuración UI adaptativa | Config |
| `BarraBusquedaYapo.tsx` | POST | `/api/voice` | Voz (TTS u otro) | Audio / JSON |
| `BarraBusquedaYapo.tsx` | POST | `/api/ai` | Cerebro / búsqueda | Respuesta AI |
| **Otros** | | | | |
| `yapo-sense/page.tsx` | GET | `/api/dashboard/yapo-sense?…` | Métricas Yapo Sense | Métricas |

---

## 2. Formato de respuestas clave

- **POST /api/auth/register**  
  - Éxito: `201` + `{ user: { id, email, ... } }`.  
  - Error: `400` validación, `409` email duplicado → body `{ error: "mensaje" }`.

- **GET /api/auth/me**  
  - `200` + `{ user, profile?, verified, badges?, rating?, profession?, ... }`.

- **POST /api/wallet/transfer**  
  - Next.js (ruta dedicada): devuelve `{ ok: true, success: true, transaction: { id, fromUserId, toUserId, amount, currency, createdAt, status }, transactionId?, debitId?, creditId?, devOnly?, message? }`.  
  - Compatible con `wallet-client` que espera `{ success: boolean, transaction?: {...}, error?: string }`.

- **GET /api/wallet** (path vacío)  
  - `200` + `{ wallet: { id, userId, balance, status, ... }, shields, devOnly? }`.  
  - Usado por la app integrada; no por `wallet-client.fetchBalance(userId)` (que usa `/api/wallet/balance/:userId` vía proxy).

- **GET /api/wallet/transactions** (ruta dedicada, sesión)  
  - `200` + `{ transactions: [...], devOnly? }`.  
  - No lleva `userId` en path; el servidor usa la sesión.

---

## 3. Bugs conocidos y comportamientos a tener en cuenta

| Bug / Comportamiento | Ubicación | Descripción | Prioridad |
|----------------------|-----------|-------------|-----------|
| **Wallet-client sin backend externo** | `wallet-client.ts` + `[[...path]]` | Con `NEXT_PUBLIC_WALLET_API_URL` no definido, `getBaseUrl()` es `/api/wallet`. Las llamadas a `GET /api/wallet/balance/:userId` y `GET /api/wallet/transactions/:userId` se envían al catch-all y se hace proxy a `WALLET_API_URL` (p. ej. localhost:3002). Si ese servidor no está levantado → 502. La UI de wallet que usa estado en memoria + `/api/wallet`, `/api/wallet/transactions` (ruta dedicada) y `/api/wallet/transfer` sí funciona sin backend externo. | Media |
| **Formato respuesta transfer** | ~~Resuelto~~ | La ruta ahora devuelve también `success: true` y `transaction` compatible con `wallet-client`. | — |
| **Mapa: errores genéricos** | `mapa/page.tsx` | En fallo de red o 5xx se muestra mensaje genérico; no se distingue “sin datos” de “error de servidor”. | Baja |
| **Profile / me: manejo de null** | Varios | Si `user` o `profile` vienen null en `/api/auth/me`, algunas pantallas pueden necesitar comprobaciones adicionales. | Baja |
| **Logs de agente en LayoutClient / profile** | `LayoutClient.tsx`, `profile/page.tsx` | Llamadas a `http://127.0.0.1:7244/ingest/...` para logging; fallan en silencio si el servicio no está. Considerar feature-flag o entorno. | Baja |

---

## 4. Mejoras de UX/UI sugeridas

| Área | Mejora | Dónde |
|------|--------|--------|
| **Registro** | Mostrar mensaje claro en 409: “Este correo ya está registrado. ¿Olvidaste tu contraseña?” con enlace a recuperar. | `(auth)/register/page.tsx` |
| **Wallet** | Si falla la carga de acuerdos/garantías, mostrar “Reintentar” y mensaje amigable en lugar de pantalla vacía o error crudo. | `WalletUI.tsx` |
| **Mapa** | Diferenciar estado “cargando”, “sin resultados” y “error” con mensajes y/o iconos distintos. | `mapa/page.tsx` |
| **Transferencia** | Tras enviar, mostrar toast o mensaje de éxito (“Transferencia enviada”) y refrescar saldo/historial. | Flujo de envío (SendFlow / wallet) |
| **Errores de red** | En flujos críticos (login, register, transfer), ofrecer “Reintentar” cuando `fetch` falle por red. | Páginas de auth y wallet |
| **Dashboard** | Si metrics/plan/ratings fallan, mostrar bloques con “No disponible” o “Reintentar” en lugar de dejar vacío. | `dashboard/page.tsx` |
| **Perfil público** | Mientras carga `/api/profile/public/:id`, mostrar skeleton o spinner; si 404, mensaje “Perfil no encontrado”. | `profile/[userId]/page.tsx` |

---

## 5. Comprobaciones recomendadas antes de producción

1. **Auth:** Registrar usuario nuevo, login, cierre de sesión, recuperación de contraseña y flujo de consent.
2. **Wallet:** Con sesión válida y perfil OK, abrir wallet, ver saldo (vía GET /api/wallet o estado local), ver transacciones (GET /api/wallet/transactions), enviar transferencia (POST /api/wallet/transfer) y comprobar que el mensaje de éxito/error se muestre correctamente.
3. **Mapa:** Seleccionar barrio y verificar que profesiones, profesionales y empresas carguen o muestren estado vacío/error adecuado.
4. **Dashboard:** Verificar que métricas, plan y ratings se carguen o muestren fallback.
5. **Perfil:** Ver perfil propio (me) y perfil público de otro usuario.
6. **Trabajo:** Flujo de aceptar propuesta (me, perfil público, aceptar-propuesta) con manejo de error en pantalla.

---

## 6. Referencias

- **Backend general:** `docs/BACKEND.md`
- **Base de datos:** `docs/datos/BASE-DATOS-YAPO.md`
- **API compartida (errores, validación):** `src/lib/api/` (`errors.ts`, `validate.ts`, `schemas/`)
