# Onboarding completo — YAPÓ v2

**Rol:** Product Manager senior + UX Architect mobile-first.  
**Objetivo:** Onboarding progresivo en 4 capas, captura de datos reales sin fricción, consentimientos legales, beneficios visibles y UX estilo app (no web).

---

## 1. Capas del onboarding (resumen)

| Capa | Nombre | Qué desbloquea | Datos que se piden | Biometría |
|------|--------|----------------|--------------------|-----------|
| **0** | Entrada abierta | Navegar landing, ver ofertas (solo lectura), FAQ | Ninguno | No |
| **1** | Login social | Feed, aplicar a ofertas, chat básico, perfil mínimo | Email, nombre, avatar (del proveedor, con consentimiento) | No |
| **2** | Perfil mínimo funcional | Ofertas personalizadas, notificaciones, ubicación (si acepta) | Teléfono opcional, rol/interés, ubicación (con consentimiento) | No |
| **3** | Verificación completa | Wallet, transferencias, contratos, roles laborales (vale/capeto/etc.), subsidios | Documento (cédula/RUC según rol), verificación de identidad | **Sí**, antes de wallet/transferencias |

---

## 1.1 Pantallas obligatorias (resumen)

| Elemento | Requisito |
|----------|-----------|
| **Logo YAPÓ** | Visible en Splash (0.1), header del onboarding y en pantallas de login. Tamaño y posición coherentes; contraste adecuado. |
| **Login social + email opcional** | Botones "Continuar con Google", "Facebook", "Instagram"; opción "O continuar con email" (campo email + flujo sin OAuth). Email opcional para recuperación o notificaciones. |
| **Flujo claro y guiado** | Un paso por pantalla; título + subtítulo + CTA principal; sin pasos ocultos ni saltos inesperados. Opcional "Omitir" solo donde se defina (ej. perfil mínimo). |
| **Indicadores de progreso** | Barra o stepper ("Paso 1 de 3") en flujos multi-paso (perfil mínimo, verificación); dots o barra en feed Reels. Estado global visible en Perfil/Home (ej. "Cuenta básica" / "Perfil completo" / "Verificado"). |

---

## 2. Flujo pantalla por pantalla

### 2.1 Capa 0 — Entrada abierta (sin login)

| # | Pantalla | Objetivo | Contenido | CTA | Notas UX |
|---|----------|----------|-----------|-----|----------|
| 0.1 | **Splash / Bienvenida** | Primera impresión, identidad de marca | Logo YAPÓ, tagline ("Identidad, reputación y trabajo"), fondo con gradiente o video corto en loop (sin audio por defecto) | "Explorar" (secundario), "Crear cuenta" (primario) | Mobile-first: una sola acción principal; transición suave a 0.2 o 0.3. |
| 0.2 | **Feed tipo Reels (solo lectura)** | Mostrar valor: ofertas, testimonios, cómo funciona | Carrusel vertical (swipe): cards de ofertas resumidas, mini-videos de "Cómo funciona YAPÓ", frases de trabajadores (anonimizadas) | "Ver oferta" (abre detalle sin login), "Crear cuenta para aplicar" | Video feed: 1 card por vista, transición tipo reels; indicador de progreso (dots o barra). |
| 0.3 | **Detalle oferta (guest)** | Ver oferta sin cuenta | Título, empresa (nombre genérico si no login), zona, descripción, requisitos | "Crear cuenta para postularte" | Mensaje claro: "Para postularte necesitás una cuenta". |
| 0.4 | **Banner cookies (si aplica)** | Cumplimiento | Texto corto cookies técnicas; enlace a Política de Privacidad | "Entendido" (cierra banner) | No bloqueante; guardar preferencia. |

**Copy ejemplo — Splash:**  
- Headline: "Tu identidad y tu trabajo, en un solo lugar."  
- Sub: "Conectamos trabajadores con oportunidades. Sin complicaciones."  
- CTA primario: "Crear cuenta" | Secundario: "Explorar ofertas"

**Copy ejemplo — Feed Reels:**  
- Card oferta: "Oferta cerca tuyo · [Sector] · [Zona]"  
- CTA en card: "Ver oferta"  
- Footer del feed: "Crear cuenta para aplicar y chatear con empleadores."

---

### 2.2 Capa 1 — Login social

| # | Pantalla | Objetivo | Contenido | CTA | Notas UX |
|---|----------|----------|-----------|-----|----------|
| 1.1 | **Elegir cuenta** | Reducir fricción, un solo tap | **Logo YAPÓ** en la parte superior. Título: "Entrá con tu cuenta", subtítulo: "Rápido y seguro." Botones: "Continuar con Google", "Continuar con Facebook", "Continuar con Instagram". Línea: "O continuar con email" (opcional). Logo de cada red en el botón. | Un botón por red + "Continuar con email" | Mobile: botones grandes (min 44px), orden según uso en el país. Si elige email: pantalla 1.1b con campo email + "Continuar"; luego consentimiento y rol igual que post-OAuth. |
| 1.2 | **Consentimiento login social** (modal o pantalla) | Consentimiento explícito antes de guardar datos | Texto: "Al continuar, YAPÓ recibirá tu nombre, correo y foto de perfil para crear tu cuenta. Solo guardamos estos datos si aceptas. Podés revocar en Configuración." Checkbox desmarcado: "Acepto que YAPÓ use estos datos para mi cuenta." Enlace: "Política de Privacidad". | "Aceptar y continuar" (habilitado solo con checkbox) | Obligatorio; no premarcar; registrar consentVersion. |
| 1.3 | **Post-login: ¿Qué querés hacer?** | Asignar rol / interés | "¿Qué te describe mejor?" Opciones: "Busco trabajo", "Contrato trabajadores", "Soy empresa", "Quiero explorar". Ilustración o icono por opción. | "Siguiente" (una selección) | Guardar como preferencia inicial (mapear a rol: vale/cliente/pyme/enterprise). |
| 1.4 | **¡Listo!** (éxito) | Refuerzo positivo | "Tu cuenta está creada." Resumen de lo desbloqueado: "Podés ver ofertas, postularte y chatear." Ilustración de check o celebración. | "Ir al inicio" | Transición suave a Home (capa 1). |

**Datos que se piden en capa 1:** Solo los que devuelve el proveedor OAuth (nombre, email, avatar) **tras** consentimiento `login_social`. No se pide teléfono ni documento aún.

**Qué desbloquea:** Feed personalizado, postularse a ofertas, chat básico, perfil con nombre y avatar, notificaciones (si luego acepta `comunicaciones`).

---

### 2.3 Capa 2 — Perfil mínimo

| # | Pantalla | Objetivo | Contenido | CTA | Notas UX |
|---|----------|----------|-----------|-----|----------|
| 2.1 | **Completá tu perfil (opcional)** | Ofrecer valor antes de pedir datos | "Así te mostramos ofertas que encajan." Campos: Nombre (prellenado si hay), Teléfono (opcional), "¿En qué zona estás?" (selector región o "Usar mi ubicación"). Texto: "Usamos tu zona para ofertas cercanas y el semáforo. Podés cambiarlo en Configuración." | "Guardar" (puede ser "Omitir por ahora") | Si elige ubicación: modal consentimiento `datos_territoriales` (checkbox + Aceptar). Si guarda teléfono: consentimiento `datos_perfil`. |
| 2.2 | **Consentimiento ubicación** (si activó ubicación) | Consentimiento explícito | Texto corto: "Usamos tu ubicación para ofertas cercanas y el semáforo en tu zona. Podés desactivarlo en Configuración." Checkbox desmarcado. | "Aceptar" | Tipo `datos_territoriales`; registrar versión. |
| 2.3 | **Notificaciones (opcional)** | Engagement | "¿Querés que te avisemos de ofertas y mensajes?" Toggle o "Sí, avisame" / "Ahora no". | "Continuar" | Si activa: consentimiento `comunicaciones`. |

**Datos que se piden en capa 2:** Teléfono (opcional), región o ubicación (con consentimiento), preferencia de notificaciones. No se pide documento ni biometría.

**Qué desbloquea:** Ofertas filtradas por zona, semáforo territorial, notificaciones push/email (si acepta), mejor matching.

---

### 2.4 Capa 3 — Verificación completa

| # | Pantalla | Objetivo | Contenido | CTA | Notas UX |
|---|----------|----------|-----------|-----|----------|
| 3.1 | **¿Para qué verificar?** (valor) | Explicar beneficio antes de pedir documento | "Desbloqueá billetera, transferencias y contratos." Lista: "Cobrar y pagar seguro", "Firmar acuerdos", "Acceder a subsidios", "Roles de confianza (vale, capeto…)". Ilustración. | "Verificar mi identidad" | Mostrar solo cuando el usuario intenta una acción que requiere verificación (wallet, transferencia) o desde Perfil > Verificación. |
| 3.2 | **Consentimiento verificación + biometría** | Consentimiento explícito | Texto: "Vamos a pedirte tu documento y una verificación con tu rostro. No guardamos la foto ni el documento en crudo; solo el resultado. Es para proteger tu cuenta y las operaciones." Checkbox: "Acepto el uso de mis datos y biometría para verificación." Enlace: Política de Privacidad. | "Aceptar y continuar" (solo con checkbox) | Tipos: consentimiento verificación + `biometria`; registrar versión. |
| 3.3 | **Subir documento** | Captura de documento | "Subí una foto de tu cédula (frente y dorso)" o según rol (RUC si PyME/Enterprise). Cámara o galería. Indicador de progreso: paso 1 de 2. | "Continuar" (tras captura válida) | Validación básica (que se vea documento); no guardar sin consentimiento ya dado. |
| 3.4 | **Verificación biométrica** | Captura facial | "Mirá a la cámara" / "Verificación con tu rostro para mayor seguridad." Guía visual (óvalo de rostro). Cámara frontal. | "Verificar" (tras captura) | Enviar a backend; resultado pass/fail; no guardar imagen en crudo. |
| 3.5 | **Resultado verificación** | Feedback claro | Éxito: "Identidad verificada. Ya podés usar billetera y contratos." Error: "No pudimos verificar. Podés reintentar o contactar soporte." | "Ir a inicio" / "Reintentar" | Transición a Home con capacidades desbloqueadas. |

**Datos que se piden en capa 3:** Documento (cédula o RUC según rol), resultado de verificación biométrica (no la biometría en crudo). Todo **después** de consentimientos en 3.2.

**Cuándo se exige biometría:** Antes de la primera operación que requiera verificación: abrir wallet con saldo, primera transferencia, firma de contrato, activación de rol laboral (vale/capeto/kavaju/mbarete). Se puede pedir en el mismo flujo de verificación (documento + biometría en secuencia).

**Qué desbloquea:** Wallet, transferencias, contratos, subsidios, roles laborales completos.

---

## 3. Indicadores de progreso

- **Capa 0 → 1:** En "Crear cuenta" / "Elegir cuenta": no hace falta barra; el progreso es implícito (splash → login → consent → rol → listo).
- **Capa 1 → 2:** En "Completar perfil": barra o steps "Perfil · Ubicación · Notificaciones" (2–3 pasos); opcional "Omitir".
- **Capa 2 → 3:** En flujo de verificación: "Paso 1 de 2" (documento) y "Paso 2 de 2" (biometría); barra superior o stepper.
- **Global:** En Perfil o Home, badge o texto: "Cuenta básica" / "Perfil completo" / "Identidad verificada" para que el usuario sepa en qué capa está y qué le falta para desbloquear algo.

---

## 4. Decisiones UX

| Decisión | Elección | Razón |
|----------|----------|--------|
| **Orden de capas** | Abierto → Social → Perfil mínimo → Verificación | Alinear con arquitectura de datos y fricción creciente; verificación solo cuando hay beneficio claro. |
| **Consentimientos** | Siempre en pantalla/modal propio, checkbox desmarcado, CTA habilitado solo al marcar | Cumplimiento legal y transparencia. |
| **Perfil mínimo** | Opcional "Omitir" en primer uso; recordar más adelante con mensaje contextual ("Completá tu zona para ofertas cercanas") | No bloquear; incentivar con beneficio. |
| **Verificación** | No forzar al registrarse; activar cuando intente wallet/transferencia o desde Perfil | Reducir abandono; pedir en momento de valor. |
| **Feed tipo Reels** | Carrusel vertical, una card por vista, swipe | Familiar en mobile; buen soporte para video y ofertas. |
| **Copy** | Tuteo, frases cortas, beneficio antes que obligación | Cercanía y claridad en LATAM. |
| **Transiciones** | Animaciones suaves (fade, slide) entre pantallas; sin saltos bruscos | Sensación de fluidez mobile-first. |

---

## 5. Integración consentimientos y datos

- **Por pantalla:** En el flujo se indica qué consentimiento se pide (login_social, datos_perfil, datos_territoriales, biometria, comunicaciones). Usar textos de `docs/legal/CONSENTIMIENTOS-ESTRUCTURA.md` o `src/lib/compliance/consentTexts.ts`.
- **Explicación de uso de datos:** En cada modal de consentimiento: una línea de "Para qué": "Para crear tu cuenta", "Para ofertas cercanas", "Para verificar que sos vos".
- **Beneficios para el usuario:** En la misma pantalla o justo antes: "Así podés…" / "Desbloqueá…" (ver CTAs y copy por pantalla arriba).

---

## 6. UX mobile-first, Reels y transiciones

- **Mobile-first:** Diseño en viewport pequeño primero; botones ≥ 44px; texto legible sin zoom; zonas seguras (safe area).
- **Video feed tipo Reels:** Contenedor a altura de viewport; scroll vertical (snap por card); una oferta o un "reel" por vista; **formato 9:16 (1080×1920)** para video/historias; indicador de progreso (dots o barra) si hay varias cards; opcional autoplay muted en loop para videos.
- **Transiciones:** Entre pantallas del onboarding: fade + slide suave (ej. 200–300 ms); al pasar de capa (ej. "Ir al inicio"): transición a Home sin modal pesado. Considerar `framer-motion` o CSS `view-transitions` en Next.js.
- **Estilo app (no web):** Navegación tipo app (bottom tabs o gestos); sin asumir layout de escritorio; contenido full-screen en feed (9:16).

---

## 7. Datos por etapa (obligatorio)

| Etapa | Qué se pide | Qué se desbloquea | Cuándo se exige verificación |
|-------|-------------|-------------------|------------------------------|
| **Entrada abierta** | Nada (opcional cookies) | Ver ofertas (solo lectura), feed Reels, FAQ | Nunca |
| **Login social** | Nombre, email, avatar (del proveedor o email si "continuar con email"); consentimiento login_social | Feed personalizado, postularse, chat, perfil con nombre/avatar | Nunca |
| **Perfil mínimo funcional** | Teléfono (opcional), región/ubicación, notificaciones; consentimientos datos_perfil, datos_territoriales, comunicaciones | Ofertas por zona, semáforo, notificaciones (si acepta) | Nunca |
| **Verificación completa** | Documento (cédula/RUC según rol), verificación biométrica (resultado, no imagen); consentimiento verificación + biometria | Wallet, transferencias, contratos, subsidios, roles laborales | **Sí:** al intentar wallet/transferencia/contrato o al activar rol laboral; no antes de login ni en perfil mínimo |

---

## 8. Qué se desbloquea en cada paso (resumen)

| Paso | Desbloqueado |
|------|----------------|
| **Entrada abierta** | Ver ofertas (solo lectura), explorar feed Reels, FAQ. |
| **Login social** | Feed personalizado, postularse, chat, perfil con nombre/avatar. |
| **Perfil mínimo funcional (opcional)** | Ofertas por zona, semáforo, notificaciones (si acepta). |
| **Verificación completa** | Wallet, transferencias, contratos, subsidios, roles laborales. |

---

## 9. Qué datos se piden en cada nivel (resumen)

| Nivel | Datos | Consentimiento |
|-------|--------|----------------|
| **0** | Ninguno (opcional cookies técnicas) | cookies_tecnicas (informativo) |
| **1** | Nombre, email, avatar (del proveedor o email si "continuar con email") | login_social |
| **2** | Teléfono (opcional), región/ubicación, notificaciones | datos_perfil, datos_territoriales, comunicaciones |
| **3** | Documento (cédula/RUC), resultado biometría | Verificación + biometria |

---

## 10. Cuándo se exige verificación (reglas)

- **Cuándo se exige:** Al intentar **wallet** (abrir con saldo), **transferencia**, **firma de contrato** o **activación de rol laboral** (vale, capeto, kavaju, mbarete). No se exige en entrada abierta, login social ni al completar perfil mínimo.
- **Biometría:** Dentro del flujo de verificación completa (capa 3), como **paso 2** tras subir documento. Opcional exigir de nuevo en operaciones sensibles (ej. primera transferencia alta) según política. No se exige en capas 0, 1 ni 2.
- **Copy:** "Verificación con tu rostro para mayor seguridad. No guardamos la imagen."

---

## 12. Video y contenido (formato y UX estilo app)

| Requisito | Especificación |
|-----------|----------------|
| **Feed tipo Reels / historias** | Carrusel vertical (swipe); una card o "reel" por vista; transición tipo reels; opcional autoplay muted en loop para videos. |
| **Formato video** | **9:16 (1080×1920)** para historias/reels y contenido full-screen en mobile. Mismo aspect ratio para cards de video en el feed. |
| **UX estilo app (no web)** | Viewport móvil primero; safe area (notch, barra inferior); gestos (swipe, tap); sin layout de escritorio como referencia; navegación tipo app (bottom tabs o gestos). Contenedor del feed a altura completa (100vh / 100dvh); scroll-snap vertical. |
| **Contenido** | Ofertas resumidas, mini-videos "Cómo funciona YAPÓ", testimonios anonimizados; copy claro y humano; beneficios visibles ("Ofertas cerca tuyo", "Postularte en un toque"). |

---

## 12. Master Key y modo tester

| Requisito | Implementación |
|-----------|----------------|
| **Master Key de testing** | Permite **saltar autenticación** en desarrollo: si el cliente envía el valor de `YAPO_MASTER_KEY` (solo en dev), el backend inyecta una sesión de desarrollo con todos los roles y `verified: true`. No usar en producción. Referencia: `src/lib/auth/dev/masterKey.ts` (`isMasterKeyProvided`, `createMasterIdentity`, `createMasterSession`). |
| **Navegación libre por roles en modo tester** | En **Safe Mode** (`NEXT_PUBLIC_SAFE_MODE=true` o `YAPO_SAFE_MODE=true`), se usa una sesión mock sin login real; el rol se puede elegir con `NEXT_PUBLIC_SAFE_ROLE` o `YAPO_SAFE_ROLE` (vale, capeto, kavaju, mbarete, cliente, pyme, enterprise). Así el tester puede **navegar libremente por roles** sin pasar por onboarding. Referencia: `src/lib/auth/dev/safeMode.ts` (`createSafeIdentity`, `getSafeRoleClient`). |
| **Uso en Next.js** | En layout o API route: si `isMasterKeyProvided(token)` o `SAFE_MODE_CLIENT`, inyectar identidad dev/safe y no redirigir a login; mostrar selector de rol en dev (ej. en Perfil o en header) para cambiar `SAFE_ROLE` y recargar. |

---

## 13. Recomendaciones de implementación en Next.js

### 13.1 Rutas sugeridas

| Ruta | Uso |
|------|-----|
| `/` | Landing / Splash (capa 0); si ya hay sesión → redirect a `/home`. |
| `/onboarding` | Layout del onboarding (progress, sin footer completo). |
| `/onboarding/welcome` | Splash bienvenida (0.1). |
| `/onboarding/feed` | Feed Reels guest (0.2). |
| `/onboarding/login` | Elegir cuenta (1.1). |
| `/onboarding/consent-login` | Consentimiento login social (1.2). |
| `/onboarding/role` | ¿Qué te describe? (1.3). |
| `/onboarding/complete` | Listo (1.4). |
| `/onboarding/profile` | Perfil mínimo (2.1). |
| `/onboarding/verify` | Inicio verificación (3.1). |
| `/onboarding/verify/consent` | Consentimiento verificación + biometría (3.2). |
| `/onboarding/verify/document` | Subir documento (3.3). |
| `/onboarding/verify/biometric` | Verificación facial (3.4). |
| `/onboarding/verify/result` | Resultado (3.5). |

Alternativa: un solo segmento dinámico `/onboarding/[[...step]]` con `step` en query o estado (ej. `step=login`, `step=consent-login`) para menos rutas.

### 13.2 Componentes sugeridos

- `OnboardingLayout`: wrapper con barra de progreso opcional y safe area.
- `ConsentModal` o `ConsentScreen`: checkbox + texto + CTA; recibe `consentType`, `onAccept`, `onDecline`; usa `getConsentText(consentType)` y envía `consentVersion` al backend.
- `ReelsFeed`: contenedor con scroll vertical tipo reels; children = cards de ofertas o slides; soporte para video con autoplay muted.
- `StepIndicator`: barra o dots para "Paso X de Y".
- `VerificationFlow`: orquestador de pasos 3.1–3.5 (consent → document → biometric → result).

### 13.3 Estado y persistencia

- **Session:** Usar sesión existente (ej. NextAuth o contexto) para saber si está en capa 0, 1, 2 o 3 (`registration_layer` o `verification_level`).
- **Redirects:** Si usuario en capa 0 intenta "Aplicar a oferta" → redirect a `/onboarding/login`. Si en capa 1 intenta "Abrir wallet" → redirect a `/onboarding/verify`.
- **Consentimientos:** Tras cada "Aceptar", llamar a API que registre `giveConsent(userId, consentType, { consentVersion })` antes de guardar datos o avanzar.

### 13.4 Animaciones y transiciones

- Entre pantallas del onboarding: `<motion.div>` (framer-motion) con `initial={{ opacity: 0, x: 8 }}`, `animate={{ opacity: 1, x: 0 }}`, `exit` para salida. O CSS `@starting-style` / View Transitions API si se prefiere sin librería.
- Feed Reels: `scroll-snap-type: y mandatory` en contenedor; cada card `scroll-snap-align: start` y altura 100vh (o 100dvh).

### 13.5 Datos y API

- Login social: OAuth con NextAuth (Google, Facebook, Instagram); en callback, si es primer login, redirect a `/onboarding/consent-login` con `provider` en estado; tras consentimiento registrar y crear usuario.
- Perfil mínimo: `PATCH /api/profile` con teléfono, región; validar `hasConsent(datos_perfil)` o `datos_territoriales` antes de guardar.
- Verificación: `POST /api/verification/document`, `POST /api/verification/biometric` (envío de resultado, no imagen en crudo); backend actualiza `verification_level` y asocia documento/evento.

---

*Documento de diseño para YAPÓ v2. Alineado a `docs/arquitectura/REGISTRO-IDENTIDAD-DATOS.md` y `docs/legal/CONSENTIMIENTOS-ESTRUCTURA.md`. Implementación en Next.js según estructura actual de `src/app`.*
