# Informe de auditoría — UI, botones, prompts y especificaciones textuales (YAPÓ 3.0)

Documento único que recopila: funcionalidades de la UI, cada botón/enlace, todos los prompts guardados y las funciones textuales que definen cómo debe funcionar la interfaz y qué ofrece la plataforma.

---

## 1. Rutas y pantallas (App Router)

| Ruta | Descripción | Origen |
|------|-------------|--------|
| `/` | Landing / "YAPÓ LOCAL OK" + enlace a /home | `src/app/page.tsx` |
| `/home` | Pantalla principal: logo, barra Cerebro, escudos, panel por rol, cuadrantes, comunidad, CTA Billetera | `src/app/home/page.tsx` |
| `/mapa` | Buscador YAPÓ: oficios (20), zona dep/ciudad/barrio, profesionales y PyMEs en la zona | `src/app/mapa/page.tsx` |
| `/cerebro` | Cerebro: barra de entrada, micrófono, historial, chips de intención | `src/app/cerebro/page.tsx` |
| `/wallet` | Billetera: saldo, transferir, acuerdos, garantías, escudos | `src/features/wallet/WalletUI.tsx` |
| `/chat` | Chat: listado de salas, crear sala, conversación (ChatLayout) | `src/app/chat/page.tsx` |
| `/chat/group` | Chat grupal (query: roomId, name) | `src/app/chat/group/page.tsx` |
| `/chat/private` | Chat privado 1-1 (query: with, name) | `src/app/chat/private/page.tsx` |
| `/dashboard` | Panel: métricas, semáforos, plan, calificaciones, YAPÓ-SENSE, WhatsApp soporte | `src/app/dashboard/page.tsx` |
| `/profile` | Perfil del usuario: datos, planes, escudos, WhatsApp, curriculum, videos | `src/app/profile/page.tsx` |
| `/profile/[userId]` | Perfil público (ver perfil de otro usuario) | `src/app/profile/[userId]/page.tsx` |
| `/profile/curriculum` | Curriculum | `src/app/profile/curriculum/page.tsx` |
| `/profile/videos`, `/profile/videos/mis-videos` | Videos / Mis videos | `src/app/profile/videos/page.tsx` |
| `/escudos` | Hub de los 4 escudos + demo oferta-demanda + Ir a Billetera | `src/app/escudos/page.tsx` |
| `/escudos/insurtech` | Insurtech: descripción, precios, activación | `src/app/escudos/insurtech/page.tsx` |
| `/escudos/fintech` | Fintech · Rueda YAPÓ | `src/app/escudos/fintech/page.tsx` |
| `/escudos/regalos` | Regalos | `src/app/escudos/regalos/page.tsx` |
| `/escudos/comunidad` | Comunidad (muro gremial, changas, SOS) | `src/app/escudos/comunidad/page.tsx` |
| `/comunidad` | Comunidad: promos, referidos, enlaces | `src/app/comunidad/page.tsx` |
| `/video` | Video: lobby + sala (WebRTC/socket) | `src/app/video/page.tsx` |
| `/trabajo/aceptar` | Aceptar propuesta (query: profesionalId, nombreProfesional) | `src/app/trabajo/aceptar/page.tsx` |
| `/demo/oferta-demanda` | Demo: oferta y demanda, activación de escudos | `src/app/demo/oferta-demanda/page.tsx` |
| `/yapo-sense` | YAPÓ-SENSE: métricas por zona (desempleo, profesionales, etc.) | `src/app/yapo-sense/page.tsx` |
| `/login` | Inicio de sesión (NextAuth + Credentials + Master Key) | `src/app/(auth)/login/page.tsx` |
| `/register` | Registro | `src/app/(auth)/register/page.tsx` |
| `/forgot-password` | Recuperar contraseña | `src/app/(auth)/forgot-password/page.tsx` |
| `/reset-password` | Restablecer contraseña | `src/app/(auth)/reset-password/page.tsx` |
| `/consent` | Consentimiento de datos | `src/app/(auth)/consent/page.tsx` |
| `/legal/privacy` | Política de privacidad | `src/app/legal/privacy/page.tsx` |
| `/legal/terms` | Términos y condiciones | `src/app/legal/terms/page.tsx` |
| `/legal/consent` | Consentimiento (legal) | `src/app/legal/consent/page.tsx` |

---

## 2. Botones y enlaces por contexto

### 2.1 Barra inferior (ActionBar) — siempre visible

| Botón | Ruta | aria-label |
|-------|------|------------|
| Inicio | `/home` | Inicio |
| Buscar | `/mapa` | Buscar |
| Billetera | `/wallet` | Billetera |
| Perfil | `/profile` | Perfil |

Origen: `src/components/ActionBar.tsx`.

### 2.2 Navbar (header) — menú hamburguesa

| Elemento | Acción / Ruta |
|----------|----------------|
| Flecha atrás | `router.back()` o `/home` (si no hay historial) |
| Menú (hamburguesa) | Abre panel lateral con NAV_LINKS |
| Inicio | `/home` |
| Buscar profesionales | `/mapa` |
| Billetera | `/wallet` |
| Cerebro | `/cerebro` |
| Chat | `/chat` |
| Panel | `/dashboard` |
| Perfil | `/profile` |
| Suscripción y planes | `/profile#planes` |

Origen: `src/components/nav/Navbar.tsx` (NAV_LINKS).

### 2.3 Footer — en todas las páginas

| Enlace | Ruta |
|--------|------|
| YAPÓ 3.0 | `/home` |
| Privacidad | `/legal/privacy` |
| Términos | `/legal/terms` |
| Consentimiento | `/legal/consent` |

Origen: `src/components/Footer.tsx`.

### 2.4 Home (`/home`)

- **BarraBusquedaYapo**: input + micrófono (Cerebro en línea).
- **EscudosIndicator**: estado de escudos (según rol).
- **QuickActionBar**: acciones rápidas por rol (Buscar_Chamba, Mi_Calificacion, Mis_Escudos, Beneficios_Sponsors, Mis_Ruedas, Mi_Territorio, Panel_Ganancias, etc.) → rutas `/mapa`, `/profile`, `/escudos`, `/comunidad`, `/dashboard`, `/wallet`.
- **DashboardQuadrants**: 4 cuadrantes por rol (trabajador: Chamba, Calificación, Escudos, Beneficios; Mbareté: Ruedas, Territorio, Ganancias, Reclutamiento; PyME/Enterprise: Vacante, Talentos, Pagos, Analytics).
- **Comunidad**: enlace "Ir a Comunidad" → `/comunidad`.
- **Más opciones**: Buscar → `/mapa`, Cerebro → `/cerebro`, Mis Escudos → `/escudos`, Planes → `/profile#planes`.
- **CTA Billetera**: "Ir a Billetera" → `/wallet`.
- **Semáforo territorial** (si rol laboral): TerritorySemaphore (solo lectura / según rol).

Origen: `src/app/home/page.tsx`, `src/components/adaptive-ui/QuickActionBar.tsx`, `src/lib/adaptive-ui/dashboardConfig.ts`.

### 2.5 Mapa (`/mapa`)

- **SearchPillar**: input búsqueda + "Buscar" (`handleBuscarSubmit`: detecta zona y oficio).
- **Oficios (20)**: botones por categoría (Electricista, Plomería, Limpieza, etc.) → `handleOficioClick`: filtra y fija zona por defecto si no hay barrio.
- **Selects**: Departamento, Ciudad, Barrio.
- **Chips "Filtrar por oficio"**: por profesión en la zona (con count).
- **Cada profesional**: "Ver →" → `/profile/[userId]`, "Aceptar propuesta" → `/trabajo/aceptar?profesionalId=...`.
- **Empresas en la zona**: enlace a perfil de empresa.
- **"← Volver al Dashboard"** → `/dashboard`.

Origen: `src/app/mapa/page.tsx`, `src/data/mapa-funcionalidades-busqueda.ts` (OFICIOS_20).

### 2.6 Cerebro (`/cerebro`)

- Barra de entrada (CerebroBarInput) + micrófono + historial (CerebroBarHistory) + resultado (CerebroBarResult).
- Chips de intención (orden): Mi billetera, Transferir, Subsidios, Activar escudo, Mensajes, Mi perfil, Inicio, Territorio → navegación o mensaje según intent.

Origen: `src/app/cerebro/page.tsx`, `src/data/ui-order.ts` (CEREBRO_BAR_CHIPS_ORDER), `src/lib/ai/knowledge/cerebro-mock-chips.ts` (MOCK_INTENT_CHIPS).

### 2.7 Chat (listado y salas)

- **ChatLayout (listado)**: "Inicio YAPÓ" → `/home`, botón "+" (nueva conversación), RoomList (tap → entra a sala), footer "Inicio YAPÓ" → `/home`, "Volver al listado", "Chat 1-1", "Chat grupal".
- **Dentro de sala (ChatWhatsAppUI)**: "YAPÓ" (link) → `/home`, flecha atrás → listado, "Inicio YAPÓ" (header), ícono WhatsApp (abre en nueva pestaña).
- **GroupChat / PrivateChat**: footer "← Volver al listado" → `/chat`, "Inicio YAPÓ" → `/home`.

Origen: `src/components/chat/ChatLayout.tsx`, `src/components/chat/ChatWhatsAppUI.tsx`, `src/app/chat/GroupChat.tsx`, `src/app/chat/PrivateChat.tsx`.

### 2.8 Escudos

- **Hub (`/escudos`)**: 4 cards (Insurtech, Fintech, Regalos, Comunidad) → `/escudos/insurtech`, etc.
- **Demo**: "Demo: Oferta y Demanda" → `/demo/oferta-demanda`.
- **Ir a Billetera** → `/wallet`.
- **Volver al Inicio** → `/home`.
- En cada subpágina (insurtech, fintech, regalos, comunidad): "Volver" / "Inicio YAPÓ" → `/home` o `/escudos`.

Origen: `src/app/escudos/page.tsx`, `src/app/escudos/insurtech/page.tsx`, etc.

### 2.9 Dashboard (`/dashboard`)

- **PlanCard**: "Mejorar plan" → abre SubscriptionUpgrade (modal).
- **MapSemaforo**: "Ver mapa" → `/mapa`.
- **WhatsAppButton**: "Soporte YAPÓ por WhatsApp" (abre en nueva pestaña).
- **Ir a**: Inicio → `/home`, Mapa GPS → `/mapa`, y PANEL_LINKS (Billetera, Chat, Perfil, Cerebro).

Origen: `src/app/dashboard/page.tsx`.

### 2.10 Perfil (`/profile`)

- Enlaces a curriculum, videos, planes, escudos, WhatsApp YAPÓ (soporte).
- Navegación según layout (links internos y a otras rutas).

Origen: `src/app/profile/page.tsx`.

### 2.11 Auth (login, register, consent, etc.)

- **Login**: Iniciar sesión, registro, recuperar contraseña; callback a `/home`.
- **Register**: Enlace a login, términos.
- **Consent**: Aceptar → `router.push("/home")`.
- **Forgot/Reset password**: Enlaces y envío de formularios.

Origen: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/consent/page.tsx`, etc.

### 2.12 Errores y global

- **error.tsx**: "Reintentar" (reset), "Ir al inicio" → `/`.
- **global-error.tsx**: "Reintentar" (reset).

Origen: `src/app/error.tsx`, `src/app/global-error.tsx`.

---

## 3. Orden de UI y especificaciones textuales (documentos y código)

### 3.1 Orden de secciones en Home (arriba → abajo)

1. hero  
2. chips_cerebro  
3. chips_rol  
4. categorias_escudos  
5. top_profesionales  
6. comunidad  
7. funciones_disponibles  
8. accesos_rapidos  
9. semaforo  
10. cta_billetera  

Origen: `docs/ESTRUCTURA-UI-ORDEN.md`, `src/data/ui-order.ts` → `HOME_SECTION_ORDER`.

### 3.2 Orden de chips en la barra del Cerebro

| # | Label | intentId |
|---|--------|----------|
| 1 | Mi billetera | wallet_view |
| 2 | Transferir | wallet_transfer |
| 3 | Subsidios | wallet_subsidy |
| 4 | Activar escudo | escudo_activate |
| 5 | Mensajes | navigate.chat |
| 6 | Mi perfil | navigate.profile |
| 7 | Inicio | navigate.home |
| 8 | Territorio | navigate.territory |

Origen: `src/data/ui-order.ts` → `CEREBRO_BAR_CHIPS_ORDER`.

### 3.3 Los 4 escudos — nombres y orden en UI

1. **Insurtech** (id: insurtech) — Salud, farmacias y clínicas; cobertura.  
2. **Fintech** (id: fintech) — Pagos, ahorro y gestión financiera segura.  
3. **Regalos** (id: regalos) — Beneficios, premios y reconocimientos laborales.  
4. **Comunidad** (id: comunidad) — Red laboral, validación de desempeño, ranking y referidos.

Orden: Insurtech → Fintech → Regalos → Comunidad.  
Origen: `docs/ESTRUCTURA-UI-ORDEN.md`, `src/features/escudos/config.ts` → `ESCUDOS_CONFIG`, `ESCUDO_IDS`, `src/data/ui-order.ts` → `ESCUDOS_DISPLAY_ORDER`.

### 3.4 Categorías (BubbleChipsDynamic)

Orden de pestañas/bloques: **Oficios → Movilidad → Cuidados → Profesional → Escudos**.  
Origen: `docs/ESTRUCTURA-UI-ORDEN.md`, `src/data/ui-order.ts` → `CATEGORIAS_ORDER`, `src/data/bubble-chips-dynamic.ts`.

### 3.5 Acciones rápidas por rol (QuickActionBar + DashboardQuadrants)

- **Trabajador (Valé, Capeto, Kavaju)**: Buscar Chamba, Mi Calificación, Mis Escudos, Beneficios/Sponsors.  
- **Mbareté**: Mis Ruedas, Mi Territorio, Panel Ganancias, Reclutamiento.  
- **PyME/Enterprise**: Publicar Vacante, Filtro Talentos, Gestión Pagos, Analytics Marca.  
- **Cliente**: Buscar Trabajadores, Mi Perfil, Seguro Colectivo, Beneficios.

Mapeo id → ruta en `src/components/adaptive-ui/QuickActionBar.tsx` (ACTION_ID_TO_ROUTE).

---

## 4. Prompts guardados (textuales)

### 4.1 CEREBRO CENTRAL DE YAPÓ

**Ubicación:** `prompts/CEREBRO_CENTRAL_YAPO.md`

- Función: preservar y expandir el conocimiento interno de YAPÓ.
- Reglas: buscar en Base de Conocimiento YAPÓ, FAQ e historial de aprendizaje antes de responder; si no hay respuesta suficiente, usar GPT de forma económica; guardar respuestas nuevas como FAQ y etiquetar; usar GPT-4.1 nano por defecto; voz (ElevenLabs) solo para premium/PyME/Enterprise/Mbareté +500 referidos; nunca decir "No sé" — orientar o derivar dentro de YAPÓ; objetivo: conocimiento reutilizable y soberanía digital.

### 4.2 Cerebro Estratégico de Empleo Nacional (OpenAI)

**Ubicación:** `docs/ai/PROMPT-CEREBRO-EMPLEO-OPENAI.md`

- Rol: analista estratégico de empleo sobre datos anonimizados y agregados.
- Acciones: detectar patrones de empleo/desempleo, evaluar impacto de políticas, recomendar capacitaciones, proponer decisiones con evidencia.
- Restricción: nunca mostrar datos personales identificables.
- Formato de respuesta: 1) Diagnóstico, 2) Evidencia estadística, 3) Recomendación accionable, 4) Impacto esperado.

### 4.3 Prompts de implementación — Dashboard (5 prompts)

**Ubicación:** `docs/product/PROMPTS-IMPLEMENTACION-DASHBOARD.md`

1. **Motor de búsqueda semántica**: "mi heladera hace escarcha" → rubro Refrigeración, urgencia Kavaju, filtrar por profesionales en barrio con fotos/videos similares.  
2. **Gestión Mbareté**: líder ve "tropa" (referidos), orden por Productividad y Calidad, alerta si &lt;3 estrellas → Beca de Capacitación.  
3. **YAPÓ-METRIX**: cruce rubro_demanda vs barrio_oferta; ejemplo: "Existen 45 albañiles, 0 Mbaretés líderes. Brecha: falta coordinación. Recomendación: programa de fidelización en la zona".  
4. **YAPÓ Feed**: muro donde usuarios suben problemas y profesionales responden; posicionamiento orgánico por interés (ej. Escudo Insurtech → primeros 3 comentarios de profesionales que aceptan ese seguro/sponsors salud).  
5. **Flujo de pago y smart contract**: al aceptar presupuesto → link de pago; retención 50%; profesional sube foto del trabajo terminado; cliente confirma → liberar pago; disputa → biometría y fotos como evidencia para arbitraje YAPÓ.

---

## 5. Funciones textuales sobre cómo debe funcionar la UI

- **Home**: respetar `HOME_SECTION_ORDER` al renderizar; Hero con "Tocá cualquier chip o botón"; chips Cerebro → decide() → navegación o búsqueda; RoleBubbleChips → runWithIntent → mensaje + navegación; BubbleChipsDynamic con tabs y chips por categoría; "Ver los 20" por área en top profesionales; Comunidad con "Ir a Comunidad"; lista de funciones disponibles (solo lectura); accesos rápidos; semáforo territorial según rol; CTA Billetera.  
- **CerebroBar**: cada chip emite un intent; el Cerebro responde con mensaje y/o navegación; orden según `CEREBRO_BAR_CHIPS_ORDER` / `MOCK_INTENT_CHIPS`.  
- **Escudos**: usar siempre los 4 nombres (Insurtech, Fintech, Regalos, Comunidad) y el orden definido; cambios de orden/nombres deben actualizarse en `ui-order.ts`, config de escudos y mocks.  
- **Navegación WhatsApp**: enlaces de WhatsApp abren en nueva pestaña (window.open con noopener,noreferrer); texto por defecto "Hola, consulta desde YAPÓ"; no reemplazar la pestaña actual.  
- **Salida desde chat**: en header de sala "YAPÓ" → `/home`; en footer "Inicio YAPÓ" → `/home`, "Volver al listado" → `/chat`.  
- **Mapa**: al clicar un oficio sin zona seleccionada se fija la primera zona (Central → Asunción → Botánico) y se muestra lista filtrada; profesionales ficticios por oficio y barrio (mock); API profesiones devuelve todos los oficios con cantidad para chips.

Origen: `docs/ESTRUCTURA-UI-ORDEN.md`, `docs/AUDITORIA-ESTADO-APP.md`, `docs/FIX-404-ROOT-APP.md`, implementación en `src/`.

---

## 6. Resumen de lo que ofrece la plataforma (por documento y código)

- **Identidad y auth**: registro, login (Credentials + Master Key + sociales con NextAuth), recuperar/restablecer contraseña, consentimiento, perfil mínimo (país, territorio, situación laboral, tipo de trabajo), TrustStatus, WhatsApp YAPÓ.  
- **Roles**: Valé, Capeto, Kavaju, Mbareté, Cliente, PyME, Enterprise; UI adaptativa por rol (dashboard, cuadrantes, acciones rápidas).  
- **Billetera**: saldo, transferencias, acuerdos, garantías, escudos; flujo escrow (retención, liberación, disputa).  
- **Cerebro**: búsqueda por texto y voz, intents (wallet, navegación, escudos), historial, respuestas y navegación.  
- **Mapa/Buscador**: 20 oficios, filtro por departamento/ciudad/barrio, profesionales y PyMEs por zona, filtros rápido (certificado/amateur/kavaju), enlace a perfil y "Aceptar propuesta".  
- **Chat**: salas grupales y privadas, UI tipo WhatsApp, puente a WhatsApp externo, mensajes con tarjeta de perfil (YAPÓ-Community).  
- **Video**: lobby y sala (WebRTC/socket).  
- **Escudos**: Insurtech, Fintech, Regalos, Comunidad; descripción, precios, activación desde billetera; demo oferta-demanda.  
- **Dashboard**: métricas (ofertas, transacciones, calificación, chips), semáforos por zona, plan de suscripción, calificaciones empleado ↔ empleador, YAPÓ-SENSE, soporte WhatsApp.  
- **Comunidad**: promos, referidos, enlaces.  
- **Legal**: privacidad, términos, consentimiento.  
- **Perfil**: datos personales, curriculum, videos, planes, escudos, perfil público por userId.

Origen: `docs/STARTER-YAPO-3.0.md`, `docs/AUDITORIA-ESTADO-APP.md`, `docs/product/README.md`, `src/`.

---

## 7. Referencia rápida de archivos clave

| Contenido | Archivo(s) |
|-----------|------------|
| Orden Home y Cerebro | `src/data/ui-order.ts` |
| Orden y nombres escudos | `src/features/escudos/config.ts`, `docs/ESTRUCTURA-UI-ORDEN.md` |
| Config dashboard por rol | `src/lib/adaptive-ui/dashboardConfig.ts` |
| Chips Cerebro (intents) | `src/lib/ai/knowledge/cerebro-mock-chips.ts` |
| Oficios (20) | `src/data/mapa-funcionalidades-busqueda.ts` (OFICIOS_20) |
| Prompts Cerebro central | `prompts/CEREBRO_CENTRAL_YAPO.md` |
| Prompts empleo/OpenAI | `docs/ai/PROMPT-CEREBRO-EMPLEO-OPENAI.md` |
| Prompts implementación dashboard | `docs/product/PROMPTS-IMPLEMENTACION-DASHBOARD.md` |
| Estructura UI y orden | `docs/ESTRUCTURA-UI-ORDEN.md` |
| Estado de la app y placeholders | `docs/AUDITORIA-ESTADO-APP.md` |
| Producto y UX | `docs/product/README.md`, ONBOARDING, MODULOS-GARANTIA, etc. |

---

*Informe generado a partir del código y la documentación del repositorio YAPÓ 3.0.*
