# Solución: 404 en localhost (This page can not be found)

## Causa

En la raíz del proyecto hay **dos** ubicaciones para el App Router:

- **`app/`** (carpeta en la raíz) – Next.js la usa **primero**. Dentro tiene otro proyecto (`app/src/app/`), no tiene `app/page.tsx` en la ruta que Next espera, por eso devuelve **404**.
- **`src/app/`** – Aquí está la app real (layout, page con "YAPÓ LOCAL OK"). Next.js **no** la usa mientras exista la carpeta `app` en la raíz.

## Solución (una sola vez)

1. **Cerrar el servidor de desarrollo**  
   En la terminal donde corre `npx next dev`, pulsar **Ctrl+C**.

2. **Renombrar la carpeta conflictiva**  
   - En el Explorador de archivos, ir a `c:\Users\lalla\projects\yapo.3.0\`
   - Renombrar la carpeta **`app`** a **`app-standalone`**  
   (Clic derecho → Renombrar)

3. **Volver a levantar el servidor**
   ```powershell
   npx next dev
   ```

4. **Abrir en el navegador**  
   http://localhost:3000  

Deberías ver **"YAPÓ LOCAL OK"** y dejar de tener 404.

## Opcional

Si no necesitás el proyecto que está dentro de `app/`, después de renombrarlo a `app-standalone` podés borrarlo. El proyecto principal es el que está en **`src/`**.
