# Auditoría: modo real y modo prueba

**Objetivo:** Que la app funcione correctamente tanto con **auth real** (login/registro/consent/perfil) como en **modo prueba** (SAFE_MODE, Master Key, “Entrar en modo prueba”), sin pantallas bloqueadas.

---

## 1. Resumen de modos

| Modo | Cómo activarlo | identity.userId | ConsentGuard | ProfileGuard | APIs (me, wallet, dashboard…) |
|------|----------------|-----------------|---------------|--------------|-------------------------------|
| **Real** | Login con email/contraseña u OAuth | ID real (cuid) | Redirige a /consent si no hay consent | Redirige a /profile si INCOMPLETO | Datos reales del usuario |
| **Master Key** | En .env `YAPO_MASTER_KEY`; en /login sección Dev ingresar clave | `dev-master` | No bloquea | No bloquea | Tratado como real (algunas rutas devuelven mock para dev-master) |
| **SAFE_MODE** | `NEXT_PUBLIC_SAFE_MODE=true` (o YAPO_SAFE_MODE en servidor) | `safe-user` | No bloquea | No bloquea | Mock/demo donde aplique |
| **Modo prueba (botón)** | Solo en dev: en login/register/consent “Entrar en modo prueba (sin login)” | `safe-user` | No bloquea | No bloquea | Igual que SAFE_MODE |

---

## 2. Flujo real (qué está auditado)

1. **Registro** → POST /api/auth/register → User + Profile (INCOMPLETO) + Consent creados → redirección a /login?registered=1.
2. **Login** → NextAuth (credentials u OAuth) → JWT → **AuthSessionBridge** sincroniza NextAuth → YAPÓ session (identity con userId real).
3. **ConsentGuard:** Si NextAuth está `authenticated` pero identity aún no tiene userId (bridge no sincronizó), **no** redirige a login (evita condición de carrera tras login). Si identity existe y no es dev-master/safe-user, consulta /api/auth/consent-check y redirige a /consent si hace falta.
4. **ProfileGuard:** Si identity es real y profileStatus INCOMPLETO, redirige a /profile al entrar a wallet/cerebro/chat/dashboard/video.
5. **Home, wallet, mapa, perfil, dashboard:** Usan `useSession()` (YAPÓ); las APIs usan `auth()` de NextAuth y devuelven datos reales.

---

## 3. Flujo modo prueba (qué está auditado)

1. **SAFE_MODE_CLIENT true:** SessionProvider inicializa con `createSafeSessionForClient()` → identity `safe-user` desde el primer render. ConsentGuard y ProfileGuard hacen return temprano (no redirigen).
2. **Master Key:** En /login, sección Dev, se ingresa YAPO_MASTER_KEY → NextAuth authorize devuelve usuario con id `dev-master` → AuthSessionBridge setSession(dev-master) → ConsentGuard y ProfileGuard ven `dev-master` y no redirigen.
3. **“Entrar en modo prueba”:** Solo en NODE_ENV=development. Llama `setSession(createSafeSessionForClient())` y router.push("/home") → identity `safe-user` → mismos guards no bloquean.
4. **APIs:** /api/auth/me, /api/auth/profile-status, /api/dashboard/*, /api/wallet (guard), etc. tratan `userId === "dev-master"` o `"safe-user"` y devuelven datos mock o permiten acceso sin perfil/consent real.

---

## 4. Puntos de salida (no bloquear pantalla)

- **Login, register, consent, forgot-password, reset-password:** Tienen **Volver al inicio** (enlace a /) y, en desarrollo, **Entrar en modo prueba (sin login)**.
- **Root (/):** Redirige a /home; si no hay sesión y no es modo prueba, ConsentGuard llevará a /login (esperado).

---

## 5. Archivos clave revisados

| Archivo | Función |
|---------|--------|
| `src/lib/auth-next/ConsentGuard.tsx` | No redirige a login si NextAuth está authenticated y identity aún no sincronizó; no bloquea dev-master ni safe-user. |
| `src/lib/auth-next/ProfileGuard.tsx` | No bloquea dev-master ni safe-user; exige perfil OK solo para usuarios reales en rutas bloqueadas. |
| `src/lib/auth-next/SessionBridge.tsx` | Sincroniza NextAuth → YAPÓ session; no toca SAFE_MODE ni sesión safe-user. |
| `src/lib/auth/context/SessionContext.tsx` | Inicializa con safe session si SAFE_MODE_CLIENT; isSafeMode = (userId === "safe-user"), isMaster = (userId === "dev-master"). |
| `src/components/auth/AuthExitNav.tsx` | “Volver al inicio” + “Entrar en modo prueba” solo en dev. |
| `src/app/api/auth/me/route.ts` | Devuelve datos mock para dev-master y safe-user. |
| `src/lib/wallet-db/guard.ts` | Permite acceso wallet para dev-master y safe-user (safeMode). |

---

## 6. Cómo probar

- **Modo real:** Desactivar SAFE_MODE (NEXT_PUBLIC_SAFE_MODE=false), registrar usuario, iniciar sesión, aceptar consent, completar perfil si se pide, navegar a home/wallet/mapa.
- **Modo prueba:** Con SAFE_MODE=true, abrir /home y navegar; o sin SAFE_MODE ir a /login y usar “Entrar en modo prueba (sin login)” y comprobar que se llega a /home sin bloqueos.
- **Master Key:** Definir YAPO_MASTER_KEY en .env, en /login abrir “Dev: Master Key”, ingresar la clave y enviar; comprobar que se llega a /home y que wallet/cerebro/dashboard no redirigen a consent ni perfil.
