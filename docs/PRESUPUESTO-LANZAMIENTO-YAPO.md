# Presupuesto real — Lanzamiento YAPÓ 3.0

Documento ejecutivo: equipo, alcance pendiente, fases por hitos, capital semilla y monto total justificado.  
**Objetivo:** Dejar la aplicación lista para lanzar al mercado del consumidor y cobrar por suscripciones (Cliente PRO, Trabajador PRO, Plan DUAL).

---

## 1. Equipo (3 personas)

| Rol | Responsabilidad | Dedicación |
|-----|------------------|------------|
| **Ingeniero** | Desarrollo fullstack: pasarela de pagos, producción (auth, env, WS), onboarding, integraciones, despliegue y corrección de bugs críticos. | Tiempo completo o ¾ durante el proyecto. |
| **Producto / Coordinación (vos)** | Definición de prioridades, aceptación de hitos, pruebas de usuario, relación con sponsors/legal y toma de decisiones de producto. | Parcial (varias horas/semana). |
| **Operaciones / Soporte (tu hermano)** | QA funcional según plan de pruebas, soporte a usuarios beta, documentación de procesos y apoyo en lanzamiento (comunicación, primeros contactos). | Parcial (varias horas/semana). |

---

## 2. Estado actual (qué ya está hecho)

- **UI completa:** Home, login, registro, recuperación de contraseña, consentimiento, wallet, Buscador YAPÓ, mapa real (Leaflet), perfil, planes, escudos, chat (UI), video (UI), dashboard, legal (privacidad, términos).
- **Backend y lógica:** NextAuth, guards (consent, perfil), APIs (auth, wallet, dashboard, mapa, contrato), Prisma (User, Profile, Wallet, etc.), intents y motor del Buscador YAPÓ.
- **Documentación:** Auditoría de lanzamiento, planes y beneficios, UX, QA y arquitectura.

**Conclusión:** La base está construida; falta **producción lista para cobrar**, **chat/video en vivo** y **pulido para el usuario final**.

---

## 3. Lo que falta (punto por punto) — Alcance del presupuesto

### 3.1 Crítico (sin esto no se puede lanzar ni cobrar)

| # | Tarea | Detalle | Responsable |
|---|--------|---------|-------------|
| 1 | **Pasarela de pagos** | Integrar Stripe, Mercado Pago o pasarela local para suscripciones (Cliente PRO Gs. 15.000, Trabajador PRO Gs. 20.000, Plan DUAL Gs. 30.000). Flujo: elegir plan → checkout → webhook → activar plan en BD y en sesión. | Ingeniero |
| 2 | **Producción: Auth y variables** | SAFE_MODE en `false` en prod. Configurar OAuth (Google, Facebook, Instagram) en producción: client ID/secret y callbacks. Completar variables de entorno: NEXTAUTH_URL, NEXTAUTH_SECRET, BD PostgreSQL, etc. | Ingeniero |
| 3 | **WebSocket en producción** | Desplegar backend-ws (o equivalente) en un hosting (VPS, Railway, Render, etc.). Configurar `NEXT_PUBLIC_WS_URL` (wss) en el front. Verificar que chat 1-1, grupal y señalización de video funcionen en prod. | Ingeniero |
| 4 | **Hosting y BD en producción** | App Next.js (Vercel u otro), PostgreSQL (ej. Vercel Postgres, Neon, Supabase), dominio y HTTPS. Migraciones y seed mínimo para producción. | Ingeniero |

### 3.2 Muy recomendable (experiencia y confianza)

| # | Tarea | Detalle | Responsable |
|---|--------|---------|-------------|
| 5 | **Onboarding mínimo** | Pantalla de bienvenida (splash) con “Crear cuenta” / “Explorar”. Tras primer registro, pantalla “¿Qué te describe mejor?” (busco trabajo / contrato trabajadores / empresa) y guardar rol inicial. | Ingeniero |
| 6 | **Datos de demostración** | Seed de producción con usuarios de ejemplo, ofertas y profesionales por barrio coherentes con Paraguay, para que el mapa y el home no queden vacíos en el primer uso. | Ingeniero + Producto |
| 7 | **Textos legales finales** | Revisar Política de Privacidad y Términos con versión final; alinear versionado de consent (ej. privacy-and-terms-v1) en BD y en pantallas. | Producto + (opcional) asesor legal |

### 3.3 Recomendable (calidad y operación)

| # | Tarea | Detalle | Responsable |
|---|--------|---------|-------------|
| 8 | **Manejo de errores y monitoreo** | Error boundaries en rutas críticas; logging de errores en producción (ej. servicio externo) para detectar fallos. | Ingeniero |
| 9 | **Analytics** | Conectar eventos existentes (`lib/analytics/events.ts`) con una herramienta (ej. Google Analytics 4, Mixpanel) para registro, login y conversiones. | Ingeniero |
| 10 | **QA según plan** | Ejecutar el plan de pruebas (login, home → acción, mapa, wallet, chat/video) y corregir bugs detectados. | Hermano (ejecución) + Ingeniero (correcciones) |

---

## 4. Fases de desarrollo y pago por hitos

El pago al **ingeniero** y los **anticipos al equipo** se atan a hitos verificables. Así se reduce el riesgo: se paga cuando se entrega cada bloque.

### Fase 1 — Producción y cobro (crítico)

**Objetivo:** App en producción con auth real y cobro de planes PRO.

| Hito | Entregable | Criterio de aceptación | Pago ingeniero (Gs.) |
|------|------------|-------------------------|------------------------|
| **H1.1** | Entorno de producción | App desplegada (Vercel u otro), BD PostgreSQL en prod, dominio y HTTPS. Variables de entorno documentadas. | 4.000.000 |
| **H1.2** | Auth en producción | SAFE_MODE desactivado en prod. OAuth (Google y al menos uno más) funcionando en prod. Registro e inicio de sesión probados. | 3.000.000 |
| **H1.3** | Pasarela de pagos | Integración con Stripe o Mercado Pago (o pasarela acordada). Flujo: elegir plan → pago → webhook → activación de plan en BD y en sesión. Página de planes enlazada al checkout. | 8.000.000 |

**Subtotal Fase 1 (ingeniero):** **15.000.000 Gs.**

---

### Fase 2 — Chat, video y WebSocket

**Objetivo:** Chat y videollamadas operativos en producción.

| Hito | Entregable | Criterio de aceptación | Pago ingeniero (Gs.) |
|------|------------|-------------------------|------------------------|
| **H2.1** | Backend WebSocket en prod | Servicio WS desplegado (wss). Front configurado con NEXT_PUBLIC_WS_URL. Conexión estable. | 4.000.000 |
| **H2.2** | Chat 1-1 y grupal en prod | Envío y recepción de mensajes en /chat/private y /chat/group en producción. Listado de chats funcional. | 3.000.000 |
| **H2.3** | Video en prod | Crear sala y unirse; señalización WebRTC vía WS. Llamada de prueba estable. | 3.000.000 |

**Subtotal Fase 2 (ingeniero):** **10.000.000 Gs.**

---

### Fase 3 — Onboarding y datos

**Objetivo:** Primera experiencia clara y datos coherentes para demostración.

| Hito | Entregable | Criterio de aceptación | Pago ingeniero (Gs.) |
|------|------------|-------------------------|------------------------|
| **H3.1** | Onboarding mínimo | Splash/bienvenida con “Crear cuenta” y “Explorar”. Tras primer registro, pantalla “¿Qué te describe mejor?” y guardado de rol inicial. | 2.500.000 |
| **H3.2** | Seed de producción | Seed con usuarios de ejemplo, ofertas y profesionales por barrio (Paraguay). Mapa y home con datos visibles sin mocks rotos. | 2.500.000 |

**Subtotal Fase 3 (ingeniero):** **5.000.000 Gs.**

---

### Fase 4 — QA, legal y cierre para lanzamiento

**Objetivo:** Sin bugs críticos, legal alineado y listo para anunciar.

| Hito | Entregable | Criterio de aceptación | Pago ingeniero (Gs.) |
|------|------------|-------------------------|------------------------|
| **H4.1** | QA y correcciones | Plan de QA ejecutado (login, home, mapa, wallet, chat). Bugs críticos y altos corregidos. Lista de verificación pre-lanzamiento cumplida. | 3.000.000 |
| **H4.2** | Legal y analytics | Versiones finales de Privacy/Terms referenciadas en app y consent. Eventos clave (registro, login, upgrade) enviados a herramienta de analytics. | 2.000.000 |

**Subtotal Fase 4 (ingeniero):** **5.000.000 Gs.**

---

## 5. Resumen de pagos al ingeniero (por hitos)

| Fase | Concepto | Monto (Gs.) |
|------|----------|-------------|
| Fase 1 | Producción, auth y pasarela de pagos | 15.000.000 |
| Fase 2 | WebSocket, chat y video en prod | 10.000.000 |
| Fase 3 | Onboarding y seed de producción | 5.000.000 |
| Fase 4 | QA, legal y analytics | 5.000.000 |
| **Total ingeniero** | | **35.000.000** |

*Los montos son en guaraníes (Gs.) y se abonan al cumplir cada hito (entregable aceptado por producto).*

---

## 6. Pago a producto (vos) y a operaciones (tu hermano)

Se propone un **anticipo / estímulo por fase** para alinear el esfuerzo de coordinación y QA con el avance del proyecto, sin depender de un “sueldo fijo” mensual si el flujo de caja es ajustado.

| Rol | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Total (Gs.) |
|-----|--------|--------|--------|--------|-------------|
| **Producto (vos)** | 2.000.000 | 1.500.000 | 1.000.000 | 1.500.000 | **6.000.000** |
| **Operaciones (hermano)** | 1.500.000 | 1.500.000 | 1.000.000 | 2.000.000 | **6.000.000** |

**Justificación breve:**  
- Producto: mayor peso en Fase 1 (definir prioridades, validar pasarela y flujos) y Fase 4 (cierre y decisión de lanzamiento).  
- Operaciones: mayor peso en Fase 2 y 4 (QA y pruebas de chat/video; ejecución del plan de QA y soporte pre-lanzamiento).

**Total equipo (vos + hermano):** **12.000.000 Gs.**

---

## 7. Capital semilla (reserva operativa)

Según el documento de producto (*Planes y beneficios*), el **capital semilla** de **Gs. 45.000.000** (~USD 5.800) cubre:

- Reserva para siniestros (daños materiales y urgencias médicas de trabajadores).
- Fondo para garantizar vales a los primeros sponsors.
- Operación inicial antes de alcanzar los primeros 1.000 suscriptores.

En este presupuesto, el capital semilla **no se usa para pagar al ingeniero ni al equipo**, sino como **reserva de la operación YAPÓ** (Insurtech, Vale, sponsors).  
Si se dispone de otro fondo para desarrollo, se recomienda mantener los 45.000.000 Gs. para ese uso operativo. Si no, se puede destinar una parte a desarrollo y otra a reserva (queda a decisión del producto).

---

## 8. Monto total del proyecto (desarrollo hasta lanzamiento)

| Concepto | Monto (Gs.) | Notas |
|----------|-------------|--------|
| Ingeniero (4 fases, por hitos) | 35.000.000 | Pagos al aprobar cada hito. |
| Producto (vos) | 6.000.000 | Anticipos por fase. |
| Operaciones (hermano) | 6.000.000 | Anticipos por fase. |
| **Subtotal equipo** | **47.000.000** | |
| Contingencia / imprevistos (≈ 6 %) | 3.000.000 | Herramientas, dominio extra, pequeños ajustes. |
| **Total desarrollo y equipo** | **50.000.000 Gs.** | |

**Capital semilla (reserva operativa YAPÓ, opcional en este presupuesto):** 45.000.000 Gs.  
**Total si se incluye capital semilla:** 95.000.000 Gs.

---

## 9. Por qué se pide esta plata (justificación)

1. **Ingeniero (35.000.000 Gs.):**  
   Cubre integración de pasarela de pagos, puesta en producción (auth, env, hosting, BD), despliegue y mantenimiento del WebSocket (chat y video), onboarding, seed de datos y QA técnica. Equivale a unos 4–5 meses de trabajo especializado por hitos, con riesgo limitado: solo se paga lo entregado y aceptado.

2. **Producto y operaciones (12.000.000 Gs.):**  
   Reconocimiento por coordinación, definición de prioridades, aceptación de hitos, pruebas de usuario, QA funcional y apoyo al lanzamiento. Mantiene al equipo alineado con las fases sin depender de un sueldo mensual fijo desde el día uno.

3. **Contingencia (3.000.000 Gs.):**  
   Dominio, herramientas de monitoreo o analytics, y margen para correcciones o cambios menores sin renegociar el alcance.

4. **Capital semilla (45.000.000 Gs., opcional aquí):**  
   Reserva operativa para Insurtech, vales y sponsors según el modelo de negocio ya documentado; no es costo de desarrollo sino fondo de operación.

---

## 10. Forma de pago sugerida

- **Ingeniero:** transferencia o acuerdo al **aprobar cada hito** (H1.1, H1.2, H1.3, H2.1, …). Se recomienda un contrato o acuerdo por escrito con la lista de hitos y montos de este documento.
- **Producto y operaciones:** pagos al cierre de cada fase (o al mismo ritmo que los hitos del ingeniero, según preferencia).
- **Capital semilla:** se mantiene en una cuenta/custodia separada para uso operativo (siniestros, vales, sponsors) según lo definido en el modelo de negocio.

---

## 11. Resumen en una página

| Ítem | Monto (Gs.) |
|------|-------------|
| Ingeniero (por hitos, 4 fases) | 35.000.000 |
| Producto (vos) | 6.000.000 |
| Operaciones (hermano) | 6.000.000 |
| Contingencia | 3.000.000 |
| **Total desarrollo** | **50.000.000** |
| Capital semilla (reserva operativa) | 45.000.000 (opcional en este presupuesto) |

**Alcance:** Dejar YAPÓ 3.0 en producción con auth real, cobro de planes PRO (pasarela), chat y video operativos, onboarding mínimo, datos de demostración y QA listo para lanzamiento.

Este documento puede usarse como base para un acuerdo con el ingeniero y para presentar el presupuesto a un inversor o socio.
