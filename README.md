# YAPÓ 3.0 – Gobernanza Laboral Digital

YAPÓ es la **Super App paraguaya** que organiza el ecosistema laboral, conecta trabajadores con oportunidades y empresas con talento, y promueve un flujo de información confiable y validado.

Su diseño es **colorido, agradable y simple**, con identidad visual paraguaya. La app es **100% móvil** y usa **GPS** para ofrecer servicios y conexiones cercanas.

---

## Setup completo (localhost) — paso a paso

Sigue estos pasos para tener la app en **http://localhost:3000** con base de datos lista para Wallet y usuario.

1. **Variables de entorno**
   - Copiar `.env.example` a **`.env.local`** (Next.js usa este en desarrollo y tiene prioridad):
     ```bash
     cp .env.example .env.local
     ```
     En Windows (PowerShell): `Copy-Item .env.example .env.local`
   - Para que **Prisma** (migrate, db push) use la misma URL, copiar también a `.env` o asegurar que `DATABASE_URL` esté en ambos:
     ```bash
     cp .env.example .env
     ```
   - **Validar `DATABASE_URL` para PostgreSQL local:** debe apuntar a `localhost:5432` y a la base `yapo`, por ejemplo:
     ```bash
     DATABASE_URL="postgresql://postgres:MiPassword123@localhost:5432/yapo"
     ```
     Ajustá usuario (`postgres`) y contraseña (`MiPassword123`) según tu instalación local. No uses Docker ni servicios pagos; solo PostgreSQL en tu máquina.

2. **Levantar PostgreSQL**
   - **Con Docker** (recomendado si tenés Docker instalado):
     ```bash
     docker run --name yapo-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=MiPassword123 -e POSTGRES_DB=yapo -p 5432:5432 -d postgres
     ```
   - **Sin Docker:** instalar [PostgreSQL para Windows](https://www.postgresql.org/download/windows/) y crear una base `yapo` con usuario `postgres` y la contraseña que uses en `DATABASE_URL`.

3. **Comprobar conexión a la base de datos**
   ```bash
   npm run db:check
   ```
   Debe imprimir `OK: Conexión a la base de datos correcta.` Si falla, revisar que PostgreSQL esté corriendo y que `DATABASE_URL` en `.env` sea correcta.

4. **Instalar dependencias**
   ```bash
   npm install
   ```
   Si hay errores de paquetes: `Remove-Item -Recurse -Force node_modules, package-lock.json` (PowerShell) y volver a ejecutar `npm install`.

5. **Crear tablas (Wallet, Shield, UserShield, Auth, etc.)**
   ```bash
   npx prisma migrate dev --name init_wallet
   ```

6. **Levantar el servidor de desarrollo**
   ```bash
   npx next dev
   ```
   Abrir **http://localhost:3000**. Rutas a verificar: `/`, `/wallet`, `/cerebro`, `/chat`, `/video`, `/dashboard`, `/profile` (todas deben responder sin 404).

Con esto la app queda renderizando en localhost y la base de datos lista para registrar Wallet y datos de usuario.

---

## Configuración y despliegue

### Requisitos

- Node.js 18+ (Next 16 requiere Node >= 18)
- npm o yarn

**Verificación rápida:**

```bash
node -v   # debe ser v18.x o superior
```

**Instalar dependencias limpias (si hay problemas):**

```bash
rm -rf node_modules package-lock.json
npm install
```
En Windows (PowerShell): `Remove-Item -Recurse -Force node_modules, package-lock.json`

**Ejecutar en desarrollo:**

```bash
npx next dev
```

Si falla el compilador SWC, probar con WASM: `npm run dev` usa Next por defecto; en entornos restringidos puede requerir variables de entorno adicionales según la documentación de Next.js.

### Variables de entorno (único origen de verdad)

Todo se decide por env vars. Sin ifs hardcodeados por entorno; el mismo código corre en localhost, Vercel y ngrok.

| Variable | localhost | Vercel | ngrok |
|----------|-----------|--------|--------|
| `NEXT_PUBLIC_WS_URL` | vacío o `ws://localhost:3001` | `wss://tu-servidor-ws.com` | `wss://xxxx.ngrok.io` (túnel a 3001) |
| `NEXT_PUBLIC_SAFE_MODE` | `true` (dev) | `true` (preview) / `false` (prod) | `true` |
| `NEXT_PUBLIC_AI_MODE` | `local` | `local` o `openai` | `local` |
| `NEXT_PUBLIC_VOICE_MODE` | `local` | `local` o `elevenlabs` | `local` |
| `WALLET_API_URL` | `http://localhost:3002` | URL backend desplegado | `http://localhost:3002` |

Copiar `.env.example` a `.env.local` y ajustar. En Vercel: Settings → Environment Variables.

### WebSocket Backend (externo)

El backend WebSocket **no está en este repo**. Integración limpia vía `NEXT_PUBLIC_WS_URL`:

- **localhost:** `ws://localhost:3001` (fallback si la variable está vacía).
- **Producción (Vercel / ngrok):** `wss://...` (obligatorio si usás chat o video).

**Usado para:**

- **Chat:** mensajes en tiempo real, salas privadas/grupales, typing/online.
- **Señalización WebRTC:** videollamadas (video_join, video_offer, video_answer, video_ice).

**Levantar backend local (opcional):**

```bash
cd backend/ws-server && npm install && npm run build && npm start
```

Escucha en el puerto 3001. En producción desplegá el mismo servidor (Railway, Render, etc.) y configurá `NEXT_PUBLIC_WS_URL=wss://tu-dominio`.

### Desarrollo local

1. Clonar e instalar:
   ```bash
   git clone <repo>
   cd yapo.3.0
   npm install
   ```
2. Variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
3. Levantar la app:
   ```bash
   npm run dev
   ```
   Abrí [http://localhost:3000](http://localhost:3000).

4. **Opcional – WebSocket:** en otra terminal, backend WS en puerto 3001 (ver arriba). Si no, el chat usará fallback `ws://localhost:3001` (conectar cuando el backend esté arriba).

5. **Opcional – Billetera:** en otra terminal, `cd backend && npm run wallet`. La app usa `/api/wallet` → proxy a `WALLET_API_URL` (por defecto `http://localhost:3002`).

### Deploy en Vercel

1. Conectar el repo en [vercel.com](https://vercel.com) (Import Git Repository).
2. **Root Directory:** vacío (app Next.js en la raíz).
3. **Variables de entorno:** configurar `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_SAFE_MODE`, `NEXT_PUBLIC_AI_MODE`, `NEXT_PUBLIC_VOICE_MODE`, `WALLET_API_URL` según la tabla.
4. Deploy. `vercel.json` está limpio (sin hacks); compatible con Edge. WebRTC y APIs usadas son estándar (no dependen de APIs no soportadas en Vercel).

### Uso con ngrok

Mismo comportamiento que localhost/Vercel. HTTP y WebSocket (vía túnel separado); cámara y micrófono funcionan porque ngrok expone HTTPS (contexto seguro).

1. Instalar [ngrok](https://ngrok.com/download).
2. Levantar la app:
   ```bash
   npm run dev
   ```
3. Exponer el puerto 3000:
   ```bash
   ngrok http 3000
   ```
   Abrí la URL HTTPS que ngrok muestra (ej. `https://xxxx.ngrok.io`). La app, rutas y `/api/*` funcionan igual que en localhost. **Cámara y micrófono:** el navegador pide permisos en contexto seguro (HTTPS); ngrok provee HTTPS.

4. **Chat y video (WebSocket):** abrir un segundo túnel para el backend WS:
   ```bash
   ngrok http 3001
   ```
   Copiar la URL HTTPS (ej. `https://yyyy.ngrok.io`) y en `.env.local`:
   ```bash
   NEXT_PUBLIC_WS_URL=wss://yyyy.ngrok.io
   ```
   Reiniciar `npm run dev` para que tome la variable. Chat y señalización WebRTC usan esa URL.

5. **Billetera:** el cliente llama a `https://xxxx.ngrok.io/api/wallet`; Next hace proxy a `WALLET_API_URL` (localhost:3002) en tu máquina.

### Resumen: mismo comportamiento

| Entorno | App | Billetera | Chat / WebRTC |
|---------|-----|-----------|----------------|
| **localhost** | http://localhost:3000 | Proxy a `WALLET_API_URL` | `ws://localhost:3001` (fallback si var vacía) |
| **Vercel** | https://*.vercel.app | Proxy a `WALLET_API_URL` | `NEXT_PUBLIC_WS_URL` (wss://...) |
| **ngrok** | https://xxxx.ngrok.io | Proxy a `WALLET_API_URL` | `NEXT_PUBLIC_WS_URL` = túnel a 3001 (wss://...) |

### Validación (checklist)

Ejecutar la checklist automática (verifica que las variables estén documentadas y que el build pase):

```bash
npm run validate
```

**Checklist manual** (mismo comportamiento en celular o desktop):

- [ ] **App abre** en el navegador (localhost, Vercel o URL ngrok).
- [ ] **Cerebro responde** (barra de búsqueda / overlay): escribe una consulta y recibís respuesta (local o OpenAI según `NEXT_PUBLIC_AI_MODE`).
- [ ] **Chat conecta** (si `NEXT_PUBLIC_WS_URL` está configurado y el backend WS está arriba): lista de conversaciones y envío de mensajes en tiempo real.
- [ ] **Video solicita permisos** (cámara y micrófono) al entrar a Videollamada; si el backend WS está arriba, crear/unir sala y señalización WebRTC funcionan.
- [ ] **Wallet muestra balance** (si `WALLET_API_URL` está configurado y el backend está arriba): tarjeta de saldo y lista de transacciones.

---

## 1️⃣ Concepto central

YAPÓ transforma el trabajo informal y formal en un ecosistema organizado y meritocrático:

- **Feed audiovisual laboral:** Solo videos y fotos de desempeño laboral, validando la reputación y habilidades del trabajador.  
- **Escudos:** Validan productos, servicios y salud (Insurtech, Fintech, Regalos, Comunidad).  
- **Referidos:** Sistema de crecimiento y reputación de usuarios basado en niveles jerárquicos.  
- **Rangos de usuarios:** Cada nivel tiene funciones y privilegios definidos.  

---

## 2️⃣ Tipos de usuario y funciones

### 2.1 Vale (usuario básico)
- Crear perfil laboral con foto y cédula validada.  
- Subir **video/foto de desempeño** laboral.  
- Consultar trabajos cercanos vía GPS.  
- Postear en el feed de su categoría laboral.  
- Recibir ranking y calificación por desempeño.  
- Interactuar con la comunidad (comentarios y likes de trabajo).  

### 2.2 Capeto
- Todo lo del Vale.  
- Liderar una pequeña cuadrilla de Vales.  
- Validar desempeño de su equipo y subir contenido audiovisual de su trabajo.  
- Recibir métricas de rendimiento de su cuadrilla.  
- Organizar mini-retos o desafíos laborales dentro de su equipo.  

### 2.3 Kavaju
- Todo lo del Capeto.  
- Supervisar varias cuadrillas o Capetos de una zona.  
- Moderar contenido y desempeño de Vales y Capetos.  
- Recibir reportes avanzados de métricas de desempeño de su área.  
- Gestionar incentivos y reconocimientos dentro de su red de usuarios.  

### 2.4 Mbareté
- Todo lo del Kavaju.  
- Control total del territorio laboral (visualización de cuadrillas y mapas de rendimiento).  
- Gestionar la **Beca Laboral** (beneficios de salud, cursos, insumos) para su base.  
- Prioridad en ofertas laborales grandes y contratos de empresas.  
- Calificar y validar Kavajus, Capetos y Vales.  
- Acceso al **Semáforo de Gestión Territorial** (Verde / Amarillo / Rojo).  
- Supervisión de la reputación y ranking de toda la comunidad local.  

---

## 3️⃣ Acciones clave por tipo de usuario

| Usuario   | Acciones principales |
|-----------|-------------------|
| Vale      | Crear perfil, subir video/foto laboral, buscar trabajos cercanos, participar en feed de su rubro. |
| Capeto    | Todo lo de Vale + liderar cuadrilla, validar desempeño de su equipo, organizar mini-retos. |
| Kavaju    | Todo lo de Capeto + supervisar varias cuadrillas, moderar contenido, recibir métricas de desempeño. |
| Mbareté   | Todo lo de Kavaju + control total del territorio, asignación de becas, prioridad en licitaciones, semáforo de gestión. |

---

## 4️⃣ Escudos

- **Insurtech:** Salud y acceso a farmacias y clínicas privadas.  
- **Fintech:** Pagos, ahorro y gestión financiera segura.  
- **Regalos:** Beneficios, premios y reconocimientos laborales.  
- **Comunidad:** Conexión y soporte dentro de la red laboral.  

> Cada escudo asegura que los servicios o productos publicados sean confiables y validados.

---

## 5️⃣ Navegación / UI Flow

1. **Cabecera “Cerebro”:** Búsqueda predictiva + chips inteligentes.  
2. **Cuatro categorías laborales:** Con subcategorías, feed audiovisual y top 20 profesiones por rubro.  
3. **Perfil de trabajador:** Escudos, videos/fotos de desempeño, ranking y premios.  
4. **Feed audiovisual laboral:** Trending, cercanía, novedades de empresas y trabajadores.  
5. **Botón posteo rápido:** Subir video/foto laboral.  
6. **Comunidad:** Interacciones entre usuarios y validación de desempeño.  
7. **Referidos / Sistema de rangos:** Vale → Capeto → Kavaju → Mbareté.  
8. **Sponsors:** Solo contenido laboral y productos/servicios verificados.  

> Todo el contenido audiovisual es **exclusivamente laboral**, para garantizar confianza y reputación.

---

## 6️⃣ Sistema de Referidos

- Cada usuario puede invitar a otros:  
  - Vale invita → Capeto  
  - Capeto supervisa → Kavaju  
  - Kavaju supervisa → Mbareté  
- Cada invitación validada suma reputación y premios.  
- Visualización clara en **UI de la comunidad**: progreso, ranking y premios por referidos.  

---

## 7️⃣ Prioridad para MVP

### Crítico
- Búsqueda predictiva “Cerebro” con chips inteligentes.  
- Registro y validación de usuarios (Vale, Capeto, Kavaju, Mbareté).  
- Subida de fotos y videos de desempeño laboral.  
- Feed audiovisual por cercanía (GPS).  
- Escudos funcionales (Fintech, Insurtech, Comunidad, Regalos).  
- Botón de posteo rápido.  
- Sistema básico de referidos y ranking.  

### Después
- Analytics avanzadas para empresas y sponsors.  
- Integración de pagos y beneficios vía escudos.  
- Semáforo de Gestión Territorial completo para Mbareté.  
- Microcapacitaciones y cursos integrados.  
- Gamificación avanzada: concursos y premios por desempeño.  

---

## 8️⃣ Diseño y estética

- **Colorido y Paraguay-friendly:** Colores vivos y distintivos del país.  
- **Sencillo y usable:** App móvil con navegación intuitiva.  
- **Atractivo visual:** Feed de videos y fotos destacadas de trabajo.  
- **Elementos UI destacados:** Chips, escudos, badges, ranking y mapas de proximidad.  

---

## 9️⃣ Conclusión

YAPÓ no es solo una app: es un **ecosistema de gobernanza laboral digital**, donde cada usuario tiene su rol, responsabilidad y reconocimiento. Desde el Vale hasta el Mbareté, todos participan de manera transparente, meritocrática y confiable, con **herramientas para visibilidad, productividad y crecimiento laboral**.  

