# Ver los últimos cambios en Vercel (yapo-3-0-g6ufdtjws)

El código ya está subido a GitHub. Si **no ves los cambios** en:

**https://yapo-3-0-g6ufdtjws-alan-avalos-projects.vercel.app**

seguí estos pasos:

## 1. Redeploy manual en Vercel

1. Entrá a **[vercel.com/dashboard](https://vercel.com/dashboard)**.
2. Abrí el proyecto que termina en **yapo-3-0-g6ufdtjws** (o el que tenga esa URL).
3. Andá a la pestaña **Deployments**.
4. En el último deployment, clic en los **tres puntos (⋯)** → **Redeploy**.
5. Marcá **Use existing Build Cache** en *off* si querés un build limpio.
6. Confirmá **Redeploy**.

Así Vercel vuelve a construir con el último commit (`bab67ac`).

## 2. Revisar rama conectada

1. En el proyecto, andá a **Settings** → **Git**.
2. Mirá **Production Branch**. Si dice `master`, los deploys de producción usan esa rama.
3. Nosotros subimos a **main**. Si la producción está en `master`, tenés dos opciones:
   - Cambiar en Vercel la Production Branch a **main**, o
   - Hacer push de los cambios también a `master` (por ejemplo: `git push origin main:master`).

## 3. Confirmar qué repo usa el proyecto

En **Settings** → **Git** revisá el **Repository**. Puede ser:

- `lallamaqueinflamahk-max/yapo3.0` (origin)
- `lallamaqueinflamahk-max/yapo_3.0` (vercel)

Los dos remotos tienen ya el commit con los cambios. Si el proyecto está vinculado a cualquiera de esos dos y la rama es **main**, un **Redeploy** (paso 1) debería mostrar los cambios.

## 4. Caché del navegador

Después del redeploy, probá:

- **Hard refresh:** Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac).
- O abrir la URL en **ventana de incógnito**.

Si seguís sin ver los cambios, en Vercel revisá el **log del último deploy** por errores de build.
