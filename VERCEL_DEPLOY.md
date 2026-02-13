# Deploy en Vercel – YAPÓ 3.0

La app Next.js está en la **raíz del repo**. No hace falta configurar "Root Directory".

## Crear el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (con la misma cuenta que ayer).
2. **Add New** → **Project**.
3. **Import** el repo `richitexx07/yap-.3.0` (conectar GitHub si no está conectado).
4. **Dejá "Root Directory" en blanco** (por defecto). La raíz ya tiene `package.json` y Next.js.
5. Variables de entorno (mismo código en localhost, Vercel y ngrok):
   - **NEXT_PUBLIC_WS_URL**: `wss://tu-servidor-ws.com` si usás chat/video (obligatorio en prod para chat/WebRTC).
   - **NEXT_PUBLIC_SAFE_MODE**: `true` (preview) / `false` (prod con login real).
   - **NEXT_PUBLIC_AI_MODE**: `local` o `openai`.
   - **NEXT_PUBLIC_VOICE_MODE**: `local` o `elevenlabs`.
   - **WALLET_API_URL**: URL del backend de billetera (proxy vía `/api/wallet`).
   - **YAPO_SAFE_MODE** / **SAFE_MODE**: `true` para sesión mock en servidor.
6. **Deploy**. `vercel.json` está limpio (sin hacks); Edge compatible; WebRTC no se rompe.

## Si el proyecto de ayer no aparece

- Revisá que estés en la misma cuenta/equipo (arriba a la izquierda en el dashboard).
- Si creaste el proyecto en otro equipo, cambiá de equipo en el selector.
- Si no lo encontrás, creá un proyecto nuevo (pasos de arriba); no hace falta recuperar el anterior.

## Build desde la raíz

Vercel ejecuta en la raíz del repo:

- `npm install`
- `npm run build`

Todo está en la raíz: `package.json`, `src/`, `public/`, `next.config.ts`, etc. No uses la carpeta `app/` para el deploy; quedó como copia legacy y podés borrarla más adelante.

## Localhost y ngrok

- La app se comporta igual en `localhost:3000` y detrás de ngrok si las variables de entorno son las mismas.
- Para probar desde el celular: exponer con ngrok la URL de la app y, si usás chat/video, la URL del WS; configurar `NEXT_PUBLIC_WS_URL` con la URL pública del WS.
- PWA y viewport están configurados para uso en móvil (standalone, safe-area).
