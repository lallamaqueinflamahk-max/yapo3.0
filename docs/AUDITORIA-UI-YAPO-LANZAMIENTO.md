# Auditoría profunda: UI YAPÓ — Estado actual y gaps para lanzamiento al consumidor

Documento único de referencia: qué está hecho, qué está a medias y qué falta para poder lanzar al mercado del consumidor.

---

## 1. Resumen ejecutivo

| Área | Estado | Prioridad para lanzar |
|------|--------|------------------------|
| **Navegación y estructura** | ✅ Hecho | — |
| **Auth (login, registro, consent)** | ✅ Hecho | Revisar OAuth prod |
| **Home y descubrimiento** | ✅ Hecho | — |
| **Buscador YAPÓ (ex Cerebro)** | ✅ Hecho | — |
| **Mapa territorial y buscador por zona** | ✅ Hecho (mapa real) | — |
| **Wallet y escudos** | ✅ Hecho (lógica + UI) | Pagos reales pendiente |
| **Perfil y planes** | ✅ Hecho | — |
| **Chat y video** | ✅ UI lista | Backend WS en prod |
| **Legal (privacidad, términos, consent)** | ✅ Hecho | — |
| **Onboarding (splash, primer uso)** | ⚠️ Parcial | **Alta** |
| **Pagos (suscripciones, planes PRO)** | ❌ Simulado | **Alta** |
| **Datos reales / seed producción** | ⚠️ Mocks y seed dev | **Media** |
| **Producción (env, WS, OAuth)** | ⚠️ Por configurar | **Alta** |
| **QA y accesibilidad** | ⚠️ Plan existe, ejecución parcial | **Media** |

---

## 2. Lo que está hecho (hasta donde se llegó)

### 2.1 Rutas y pantallas implementadas

| Ruta | Componente / contenido | Notas |
|------|------------------------|--------|
| **/** | Redirección a `/home` | Sin landing técnica. |
| **/home** | Home completo | Hero, chips (Buscador YAPÓ), mapa territorial real, accesos (Buscar, Buscador YAPÓ, Escudos, Planes), feed YapoCard, profesionales por categoría, reels, CTA billetera. |
| **/login** | Login | Credentials + OAuth (Google, Facebook, Instagram), “¿Olvidaste contraseña?”, “Registrarse”. Master Key en dev. |
| **/register** | Registro | Email, contraseña, nombre opcional, checkbox legal obligatorio. |
| **/forgot-password**, **/reset-password** | Recuperación de contraseña | Flujo presente. |
| **/(auth)/consent** | Consentimiento | Pantalla de consentimiento legal. |
| **/wallet** | WalletUI | Saldo (disponible/protegido), Transferir/Recibir (vía intents), escudos, acuerdos, garantías, enlace a planes. |
| **/cerebro** | CerebroBar | Input + micrófono, chips de intent, historial. Copy “Buscador YAPÓ”. |
| **/mapa** | Buscador por zona | Mapa real (Leaflet/OSM), métricas, filtros oficio/zona, lista profesionales y PyMEs por barrio. |
| **/profile** | Perfil completo | Header, datos personales, rating, historial, antecedentes, PyME, sponsors, ofertas, reels, profesionales cercanos, **planes y suscripción** (con enlace a /planes), ratings, capacitaciones, currículum IA, escudos. |
| **/profile/[userId]** | Perfil público | Vista de otro usuario. |
| **/profile/curriculum**, **/profile/videos** | Subpáginas perfil | Curriculum y videos. |
| **/dashboard** | Dashboard | Métricas (ofertas, transacciones, calificación, chips), plan, **mapa territorial real**, calificaciones, WhatsApp soporte, navegación. |
| **/planes** | Planes y beneficios | Tabla Cliente PRO / Trabajador PRO / Plan DUAL, tres pilares (Vale, Insurtech, Club), Mbarete Score. |
| **/escudos** | Hub escudos | Insurtech, Fintech, Regalos, Comunidad + enlaces a subpáginas. |
| **/escudos/insurtech**, **fintech**, **regalos**, **comunidad** | Páginas por escudo | Contenido por escudo. |
| **/chat** | ChatLayout | Listado, enlaces a chat 1-1 y grupal. |
| **/chat/private**, **/chat/group** | Chat 1-1 y grupal | UI lista; depende de WebSocket. |
| **/video** | Video lobby/sala | Crear/unirse sala; señalización WebRTC. |
| **/comunidad** | Comunidad | Sección comunidad. |
| **/trabajo/aceptar** | Aceptar propuesta | Flujo de aceptación de trabajo. |
| **/legal/privacy**, **terms**, **consent** | Legal | Política de privacidad, términos, consentimiento. |
| **/yapo-sense** | YAPÓ-SENSE | Métricas por zona (PyME/Enterprise). |
| **/demo/oferta-demanda** | Demo | Oferta y demanda. |

Todas estas rutas existen y tienen UI montada (no son placeholders vacíos).

### 2.2 Lógica y backend

- **Auth:** NextAuth (credentials + OAuth), ConsentGuard, ProfileGuard. Perfil incompleto bloquea Wallet, Cerebro, Chat, Video, Dashboard.
- **Wallet:** Modelo y servicio (balance, transacciones, custodia), guard (permisos, escudos, territorio), intents (wallet_view, wallet_transfer, etc.).
- **Buscador YAPÓ:** Catálogo de intents, decide(), navegación y mensajes desde chips.
- **Mapa:** Coordenadas reales por barrio, Leaflet + OSM, puntos rojo/amarillo/verde por estado.
- **APIs:** auth (me, register, consent, profile, forgot/reset), dashboard (metrics, plan, ratings, semaphores, yapo-sense), wallet (transfer, transactions, acuerdos, garantías, shields), mapa (profesiones, zonas profesionales/empresas, censo, funcionalidades), contrato (aceptar-propuesta, escrow, PDF), adaptive-ui config, ai, voice.
- **Prisma:** User, Profile, Consent, Wallet, WalletTransaction, Shield, UserShield, SubscriptionPlan, Semaphore, Rating, etc. Migraciones y seed para desarrollo.

### 2.3 UX y copy

- Copy “Cerebro” reemplazado por “Buscador YAPÓ” en navegación, chips, leyendas y aria-labels.
- Planes y beneficios: tabla y pilares (Vale, Insurtech, Club) en `/planes` y referencias en perfil, escudos y billetera.
- Mapa territorial reemplaza la sección “semáforo territorial” en Home y Dashboard (mapa real visible).

---

## 3. Lo que está a medias o es parcial

### 3.1 Onboarding (primer uso)

- **Documentado:** `docs/product/ONBOARDING-YAPO-V2.md` define Capa 0 (splash, reels guest), Capa 1 (login social, consent, “¿Qué querés hacer?”), Capa 2 (perfil mínimo, ubicación), Capa 3 (verificación/biometría).
- **En la app:** No hay splash ni feed Reels para invitados. Entrada actual: `/` → `/home` (o `/login` si no hay sesión). No hay pantalla explícita “¿Qué te describe mejor?” (rol) post-registro; el rol por defecto es “vale”.
- **Gap:** Implementar al menos: splash/bienvenida (opcional “Explorar” / “Crear cuenta”) y, si se desea onboarding corto, una pantalla única de “¿Qué querés hacer?” tras el primer login.

### 3.2 Datos y mocks

- **Mapa:** Barrios y profesionales por barrio vía APIs que pueden usar mocks o seed (`/api/mapa/zonas/profesionales`, etc.).
- **Home:** Feed y profesionales pueden depender de mocks (ej. `YAPO_PERFILES_MOCK`, `getProfessionalsNearbyMock`).
- **Dashboard:** Métricas, plan y ratings desde API; plan y ratings dependen de seed/BD.
- **Gap:** Definir si el lanzamiento es con “datos de demostración” (seed rico) o con integraciones reales (ej. censo, ofertas). En cualquier caso, seed de producción con datos coherentes para Paraguay.

### 3.3 Chat y video en producción

- **UI:** Lista de chats, private y group con ChatLayout; video con lobby y sala.
- **Backend:** `backend-ws` (o equivalente) para WebSocket (chat y señalización WebRTC). En local se usa `NEXT_PUBLIC_WS_URL` (ej. `ws://localhost:3001`).
- **Gap:** Desplegar backend WebSocket en producción y configurar `NEXT_PUBLIC_WS_URL` (wss). Sin esto, chat y video no funcionan en prod.

### 3.4 Biometría y validación

- **Guard y flujo:** Semáforo amarillo puede exigir biometría; CerebroResult con `validationType: "biometric"`; modal biométrico.
- **Implementación:** Provider biométrico en stub/simulación.
- **Gap:** Para lanzamiento con “validación real”, integrar proveedor biométrico real (ej. WebAuthn o SDK nativo) y conectar con el guard.

---

## 4. Lo que falta para lanzar al consumidor

### 4.1 Crítico (bloquean lanzamiento comercial)

1. **Pagos reales (suscripciones)**  
   - Hoy: “Mejorar plan” y “Pagar y activar” son simulados.  
   - Falta: Pasarela (Stripe, Mercado Pago u otra) para cobro de planes (Cliente PRO, Trabajador PRO, DUAL). Flujo: elegir plan → checkout → webhook → activar plan en BD / sesión.

2. **Producción: Auth y env**  
   - SAFE MODE: en producción debe ser `false` (o equivalente) para que no entre nadie sin login real.  
   - OAuth: configurar en producción client ID/secret de Google, Facebook, Instagram (y callbacks).  
   - Variables: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, BD (PostgreSQL), y el resto de env de la app y APIs.

3. **WebSocket en producción**  
   - Desplegar servicio WebSocket (chat + señalización video).  
   - Configurar `NEXT_PUBLIC_WS_URL` (wss) en el front.  
   - Sin esto, chat y videollamadas no funcionan en prod.

### 4.2 Muy recomendable (experiencia y confianza)

4. **Onboarding mínimo**  
   - Splash/bienvenida con “Crear cuenta” / “Explorar” (si se permite modo invitado).  
   - Post-registro: una pantalla “¿Qué te describe mejor?” (busco trabajo / contrato trabajadores / empresa) y guardar rol inicial.  
   - Opcional: un solo paso de “Completá tu perfil” (teléfono opcional, zona) antes de entrar al home.

5. **Datos de demostración o reales**  
   - Seed de producción con usuarios de ejemplo, ofertas, profesionales por barrio (o integración con datos reales).  
   - Revisar que ninguna pantalla clave dependa de mocks rotos o vacíos.

6. **Legal y consent en registro**  
   - Ya existe checkbox y Consent en BD. Verificar que los textos de Privacy y Terms sean los finales y que el versionado de consent (privacy-and-terms-v1, etc.) esté alineado con legal.

### 4.3 Recomendable (calidad y operación)

7. **Monitoreo y errores**  
   - Error boundaries en rutas críticas (home, wallet, chat).  
   - Logging de errores (ej. servicio externo) para detectar fallos en prod.

8. **Analytics**  
   - Los eventos en `lib/analytics/events.ts` existen; falta conectar con herramienta (GA4, Mixpanel, etc.) y asegurar que no se pierdan eventos clave (registro, login, upgrade, transferencia).

9. **QA y accesibilidad**  
   - Ejecutar el plan de `docs/QA-TEST-PLAN.md` (Cerebro, Wallet, Chat, Video, mapa).  
   - Revisión básica de a11y (focus, contraste, etiquetas) en flujos principales.

10. **Rendimiento y SEO**  
    - Revisar LCP/CLS en home y mapa (imágenes, Leaflet).  
    - Meta tags y títulos por ruta (ya hay metadata en layout; completar en páginas importantes).

---

## 5. Checklist pre-lanzamiento (resumen)

| # | Item | Hecho |
|---|------|--------|
| 1 | Pagos reales (pasarela + activación de plan) | ❌ |
| 2 | SAFE MODE = false en prod; OAuth prod configurado | ❌ |
| 3 | WebSocket desplegado; NEXT_PUBLIC_WS_URL en prod | ❌ |
| 4 | Onboarding mínimo (splash + rol inicial) | ⚠️ Parcial |
| 5 | Seed prod o datos reales coherentes | ⚠️ |
| 6 | Textos legales finales y consent versionado | ⚠️ Revisar |
| 7 | Error handling y logging en prod | ⚠️ |
| 8 | Analytics conectado | ❌ |
| 9 | QA manual/E2E según plan | ⚠️ |
| 10 | PWA/manifest y HTTPS | ✅ Manifest; HTTPS según hosting |

---

## 6. Conclusión

- **Hasta dónde se llegó:** La UI YAPÓ está muy avanzada: navegación completa, auth, home, Buscador YAPÓ, mapa real, wallet con lógica, perfil, planes, escudos, chat/video (UI), legal y guards. Es una base sólida para lanzar.
- **Para poder lanzar al mercado del consumidor** hace falta, como mínimo: (1) pagos reales por suscripción, (2) configuración de producción (auth sin SAFE MODE, OAuth, WS), y (3) decisión sobre onboarding (mínimo recomendable: splash + rol inicial). A partir de ahí, priorizar datos de demo/real, legal final, monitoreo y QA para una salida estable.

Este documento se puede actualizar cuando se cierren ítems del checklist o cambien prioridades de producto.
