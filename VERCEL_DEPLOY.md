# Deploy en Vercel – YAPÓ 3.0

La app Next.js está en la **raíz del repo**. No hace falta configurar "Root Directory".

## Crear el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (con la misma cuenta que ayer).
2. **Add New** → **Project**.
3. **Import** el repo `richitexx07/yap-.3.0` (conectar GitHub si no está conectado).
4. **Dejá "Root Directory" en blanco** (por defecto). La raíz ya tiene `package.json` y Next.js.
5. Si querés usar el chat en producción, agregá la variable de entorno:
   - **Name:** `NEXT_PUBLIC_WS_URL`
   - **Value:** `wss://tu-servidor-chat.com`
6. **Deploy**.

## Si el proyecto de ayer no aparece

- Revisá que estés en la misma cuenta/equipo (arriba a la izquierda en el dashboard).
- Si creaste el proyecto en otro equipo, cambiá de equipo en el selector.
- Si no lo encontrás, creá un proyecto nuevo (pasos de arriba); no hace falta recuperar el anterior.

## Build desde la raíz

Vercel ejecuta en la raíz del repo:

- `npm install`
- `npm run build`

Todo está en la raíz: `package.json`, `src/`, `public/`, `next.config.ts`, etc. No uses la carpeta `app/` para el deploy; quedó como copia legacy y podés borrarla más adelante.
