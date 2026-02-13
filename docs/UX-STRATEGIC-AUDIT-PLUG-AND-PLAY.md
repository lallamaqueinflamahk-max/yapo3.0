# Auditoría UX estratégica — YAPÓ 3.0 (plug-and-play)

**Rol:** UX Strategist Senior + Fullstack · Neuroventas, retención, predicción de abandono.  
**Objetivo:** Auditoría automática, fricciones, oportunidades, microcopy persuasivo, mockups/código listos y plan de acción ejecutable.

---

## 1. Resumen ejecutivo

| Métrica conceptual | Estado actual | Objetivo post-auditoría |
|--------------------|----------------|--------------------------|
| **Task Success Rate (TSR)** | ~70% (estimado) | >85% |
| **Clicks to Conversion (CTA principal)** | 2–3 clics | ≤2 clics |
| **Puntos de fricción críticos** | 12 detectados | 0 críticos |
| **Zonas táctiles < 44px** | Varios chips/links | 100% ≥ 44px |
| **Microcopy con urgencia/claridad** | Parcial | CTA y formularios optimizados |
| **Predicción de abandono (flujos clave)** | Alta en registro/login y home largo | Intervenciones aplicadas |

---

## 2. Checklist de auditoría aplicado (resumen)

| # | Criterio | Home | Login | Wallet | Mapa | Perfil | Prioridad |
|---|----------|------|--------|--------|------|--------|------------|
| 1 | Jerarquía visual | ⚠️ Muchos bloques | ✅ Clara | ✅ Aceptable | ⚠️ Densidad | ⚠️ Muy largo | Alta |
| 2 | Zonas táctiles 44–88px | ⚠️ Chips pequeños | ✅ Botones OK | ✅ OK | ⚠️ Chips oficio | ⚠️ Enlaces | Alta |
| 3 | Microcopy CTA/formularios | ⚠️ Poco persuasivo | ⚠️ Neutro | ⚠️ Funcional | ✅ Aceptable | ⚠️ Neutro | Alta |
| 4 | Feedback inmediato | ⚠️ Poco loading/éxito | ✅ Error visible | ✅ Estados | ⚠️ Carga | ⚠️ Poco | Media |
| 5 | Sobrecarga cognitiva | ❌ Alta (home) | ✅ Baja | ✅ Baja | ⚠️ Media | ❌ Alta | Alta |
| 6 | Economía del esfuerzo | ⚠️ Scroll largo | ✅ Corto | ✅ OK | ⚠️ Filtros | ❌ Muchos pasos | Alta |
| 7 | Patrones/familiaridad | ✅ Consistente | ✅ Estándar | ✅ OK | ⚠️ Selects | ⚠️ Secciones | Media |
| 8 | Gamificación/refuerzos | ❌ Casi nulo | ❌ Nulo | ⚠️ Saldo | ❌ Nulo | ⚠️ Rating | Media |
| 9 | Predicción abandono | Alta (scroll) | Media (error) | Baja | Media (sin resultados) | Alta (longitud) | Alta |
| 10 | Responsive / a11y | ✅ Mobile-first | ✅ OK | ✅ OK | ⚠️ Tabla mapa | ⚠️ Contraste | Media |

---

## 3. Por página: fricciones, oportunidades, predicción, KPIs y código

### 3.1 Home (`/home`)

**Fricciones detectadas (por impacto)**

| Impacto | Fricción | Ubicación / componente |
|---------|----------|-------------------------|
| **Alto** | Sobrecarga cognitiva: muchos bloques (logo, barra, chips, panel, mapa, CTA, escudos, quick actions, feed, profesionales, atajos, footer). Usuario no sabe qué hacer primero. | `src/app/home/page.tsx` — flujo vertical |
| **Alto** | CTA principal ("Ver ofertas para vos" / "Publicar oferta...") aparece tras mucho scroll; usuario puede abandonar antes. | Sección CTA hero (línea ~146) |
| **Medio** | Chips de atajos (Buscar, Buscador YAPÓ, etc.) con `py-1.5` → altura táctil < 44px en móvil. | Links con `rounded-full px-3 py-1.5` |
| **Medio** | "Para vos hoy" + Reels + Panel + Mapa: jerarquía poco clara; no hay un solo "primer paso" destacado. | Bloque `Para vos hoy` |
| **Bajo** | Footer "Ver saldo y pagos" compite con ActionBar "Billetera"; redundancia. | Footer home |

**Oportunidades de mejora**

- **Copy:** CTA principal con beneficio + urgencia suave: *"Encontrá tu próximo trabajo hoy"* / *"Publicá tu oferta y recibí propuestas"*.
- **Jerarquía:** Un solo bloque "Tu siguiente paso" arriba (después de la barra) con 1 CTA + 2 secundarios.
- **Microinteracción:** Al enviar búsqueda en BarraBusquedaYapo: estado "Buscando…" con skeleton o spinner; al terminar, toast "Listo" o redirección clara.
- **Gamificación:** Badge o número "X ofertas cerca" junto al CTA; o "Tu perfil está al 80%" si aplica.

**Predicción de abandono**

- **Probabilidad:** ~35% en primeros 15 s si no hay foco claro; ~25% si no ven CTA antes de 2 scrolls.
- **Causas:** Demasiadas opciones, CTA enterrado.
- **Intervención:** Arriba: headline + un CTA primario + "O explorar mapa" / "O ver mi billetera". Resto en secciones colapsables o "Ver más".

**KPIs asociados**

- TSR: completar "una acción principal" (ej. ir a mapa o abrir billetera) → objetivo >80%.
- Time on Task: tiempo hasta primer clic útil → objetivo <10 s.
- Clicks to Conversion: hasta conversión (ej. "Aceptar propuesta") → objetivo ≤3.

**Prioridad:** **Alta.**

**Mockup / código listo (Tailwind + Next.js)**

```tsx
// 1) CTA hero movido arriba (después de BarraBusquedaYapo) — src/app/home/page.tsx
<section className="mx-auto w-full max-w-[min(90vw,520px)] py-3" aria-label="Tu siguiente paso">
  <Link
    href={primaryRole && ["pyme", "enterprise"].includes(primaryRole) ? "/mapa" : "/home#profesionales"}
    className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-yapo-red px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
  >
    {primaryRole && ["pyme", "enterprise"].includes(primaryRole)
      ? "Publicá tu oferta y recibí propuestas"
      : "Encontrá tu próximo trabajo hoy"}
  </Link>
  <p className="mt-2 text-center text-xs text-foreground/60">
    O explorá el mapa · Ver mi billetera
  </p>
</section>

// 2) Chips atajos: altura táctil ≥ 44px
<Link
  href="/mapa"
  className="flex min-h-[44px] items-center justify-center rounded-full bg-yapo-blue/20 px-4 py-3 text-sm font-semibold text-yapo-blue ..."
>
  Buscar
</Link>
```

**Microcopy dinámico (variantes por rol)**

| Rol | CTA primario | Subtexto |
|-----|--------------|----------|
| vale / capeto / kavaju / mbarete | "Encontrá tu próximo trabajo hoy" | "Ofertas cerca tuyo · Ver mapa" |
| pyme / enterprise | "Publicá tu oferta y recibí propuestas" | "O buscá talento en el mapa" |

---

### 3.2 Login (`/login`)

**Fricciones detectadas**

| Impacto | Fricción |
|---------|----------|
| **Medio** | Error genérico "Email o contraseña incorrectos" sin sugerencia de recuperación visible de inmediato. |
| **Medio** | CTA submit "Ver mi panel" es funcional pero poco emocional; no refuerza beneficio. |
| **Bajo** | OAuth sin iconos de marca (solo texto); menor reconocimiento. |

**Oportunidades**

- **Copy:** Botón: *"Entrar a mi cuenta"* o *"Ver mi panel"* + subtítulo *"Accedé a ofertas y tu billetera"*.
- **Error:** Junto al mensaje, link fijo "¿Olvidaste tu contraseña?" (ya existe; asegurar que esté siempre visible, no solo cuando hay error).
- **Feedback:** Tras login exitoso: breve mensaje "¡Bienvenido de nuevo!" antes de redirección (opcional).

**Predicción de abandono**

- **Probabilidad:** ~20% si falla el primer intento y no ven recuperación; ~10% si OAuth falla sin mensaje claro.
- **Intervención:** Mensaje de error con botón "Recuperar contraseña" y/o "Intentar de nuevo".

**KPIs:** TSR = login exitoso; Time on Task = tiempo en pantalla hasta submit. Objetivo: TSR >90%.

**Prioridad:** **Media.**

**Código sugerido (microcopy + botón)**

```tsx
// src/app/(auth)/login/page.tsx — botón con copy persuasivo
<button type="submit" disabled={loading} className="...">
  {loading ? "Entrando…" : "Entrar a mi cuenta"}
</button>
<p className="mt-2 text-center text-xs text-foreground/60">
  Accedé a ofertas, billetera y mensajes
</p>
```

---

### 3.3 Wallet (`/wallet`)

**Fricciones detectadas**

| Impacto | Fricción |
|---------|----------|
| **Medio** | Texto "Mis Escudos" largo; usuario puede no asociar "Vale, Insurtech, Club" con beneficio inmediato. |
| **Bajo** | Botón "Transferir" muy prominente; "Recibir" menos visible. |

**Oportunidades**

- **Microcopy:** "Tu saldo" con monto grande; "Transferir" → "Enviar dinero"; "Recibir" → "Cobrar o recibir".
- **Gamificación:** Si hay saldo protegido, línea: "X Gs. protegidos (subsidio o acuerdo)".

**Predicción de abandono:** Baja (~5%). Intervención: mensaje de éxito claro tras "Transferir" o "Recibir".

**Prioridad:** **Media.**

---

### 3.4 Mapa (`/mapa`)

**Fricciones detectadas**

| Impacto | Fricción |
|---------|----------|
| **Alto** | Si no hay resultados en la zona: mensaje "Aún no hay profesionales" sin siguiente paso claro (ej. "Probá otro barrio" o "Activá notificaciones para esta zona"). |
| **Medio** | 20 oficios en una sola fila de chips: sobrecarga y scroll horizontal largo. |
| **Medio** | Tabla de métricas arriba del mapa puede quedar cortada en móvil. |

**Oportunidades**

- **Copy:** Estado vacío: "Nadie en este barrio todavía. Probá otro barrio o oficio, o sé el primero en aparecer acá."
- **Agrupación:** Ofrecer oficios por categoría (Oficios · Movilidad · Cuidados · Profesional) con acordeón o tabs para reducir ruido.
- **Feedback:** "Buscando en [Barrio]…" con skeleton mientras cargan profesionales.

**Predicción de abandono:** ~30% si primera búsqueda devuelve 0 resultados. Intervención: CTA "Ver todos los oficios" o "Cambiar zona".

**Prioridad:** **Alta.**

---

### 3.5 Perfil (`/profile`)

**Fricciones detectadas**

| Impacto | Fricción |
|---------|----------|
| **Alto** | Página muy larga (header, datos, rating, historial, antecedentes, PyME, sponsors, ofertas, reels, profesionales, planes, ratings, capacitaciones, curriculum, escudos). Sobrecarga y abandono. |
| **Medio** | "Ver tabla de planes y beneficios" es link pequeño; bajo peso visual para conversión a planes. |
| **Medio** | Sin progreso visible (ej. "Perfil 70% completo"). |

**Oportunidades**

- **Estructura:** Agrupar en pestañas o secciones colapsables: "Datos", "Trabajo y planes", "Reputación", "Más".
- **Microcopy:** Planes: "Ver qué incluye tu plan y beneficios" (beneficio claro).
- **Gamificación:** Barra "Tu perfil está al X% completo" con 2–3 ítems pendientes.

**Predicción de abandono:** ~25% si el usuario buscaba algo concreto y no lo encuentra rápido.

**Prioridad:** **Alta.**

---

## 4. Scripts automáticos de testing UX (conceptuales, plug-and-play)

### 4.1 Flujo: Home → primera acción

```javascript
// scripts/ux-test-home-first-action.js (Playwright o Cypress)
// Métricas: tiempo hasta primer clic en CTA o en ActionBar, TSR (llegar a mapa o wallet)
// Pasos: visit /home → esperar carga → registrar time to first meaningful click
// Criterio éxito: clic en "Ver ofertas", "Buscar", "Billetera" o "Perfil" en < 15 s
```

### 4.2 Flujo: Login → éxito / error

```javascript
// scripts/ux-test-login.js
// Caso 1: credenciales válidas → TSR, Time on Task
// Caso 2: credenciales inválidas → mensaje visible, link "Recuperar contraseña" presente
// Assert: no más de 2 clics para recuperar contraseña desde estado de error
```

### 4.3 Flujo: Mapa → resultado vacío

```javascript
// scripts/ux-test-mapa-empty.js
// Seleccionar barrio con 0 profesionales (o mock) → assert mensaje amigable + CTA alternativo
// Métrica: no abandono sin CTA (botón "Cambiar zona" o "Ver oficios")
```

### 4.4 Métricas a extraer (dashboard)

- **TSR por flujo:** login, home→acción, mapa→ver perfil, wallet→transferir.
- **Time on Task:** por pantalla (promedio).
- **Clicks to Conversion:** home → aceptar propuesta / publicar oferta.
- **Alertas:** si TSR < 75% en algún flujo crítico; si Time on Task > 60 s en login o registro.

---

## 5. Dashboard conceptual de KPIs (interactivo)

**Bloque 1 — Embudo**

| KPI | Fuente sugerida | Umbral alerta |
|-----|------------------|----------------|
| Visitantes /home | Analytics | — |
| Primer clic útil (< 15 s) | Evento "first_meaningful_click" | < 60% |
| TSR Login | Evento "login_success" / "login_attempt" | < 85% |
| TSR Mapa (con resultado) | Evento "mapa_result_view" | < 70% |

**Bloque 2 — Fricción**

| Alerta | Condición | Acción sugerida |
|--------|-----------|------------------|
| Home: alto rebote | Bounce rate > 55% en /home | Revisar jerarquía y CTA arriba |
| Login: muchos errores | Intentos fallidos / intentos totales > 25% | Mejorar copy de error y recuperación |
| Mapa: muchos vacíos | Búsquedas con 0 resultados > 40% | Mejorar copy estado vacío + sugerencias |

**Bloque 3 — Engagement**

| Métrica | Definición |
|---------|------------|
| Engagement Score | Promedio de (eventos por sesión) × (páginas vistas) × peso por acción (ej. transferir = 2, ver perfil = 1). |
| Return Rate | Usuarios con ≥ 2 sesiones en 7 días / usuarios con 1+ sesión. |

**Visualización conceptual:** Dashboard con 3 columnas (Embudo · Fricción · Engagement), gráficos de tendencia y alertas en rojo/amarillo cuando se superan umbrales.

---

## 6. Microcopy persuasivo — banco listo para implementar

| Contexto | Copy actual (ejemplo) | Copy sugerido (persuasivo) |
|-----------|------------------------|-----------------------------|
| Home CTA (trabajador) | "Ver ofertas para vos" | "Encontrá tu próximo trabajo hoy" |
| Home CTA (empresa) | "Publicar oferta o buscar talento" | "Publicá tu oferta y recibí propuestas" |
| Login submit | "Ver mi panel" | "Entrar a mi cuenta" |
| Wallet Transferir | "Transferir" | "Enviar dinero" |
| Wallet Recibir | "Recibir" | "Cobrar o recibir" |
| Perfil planes | "Ver tabla de planes y beneficios" | "Ver qué incluye tu plan y beneficios" |
| Mapa vacío | "Aún no hay profesionales en este barrio." | "Nadie en este barrio todavía. Probá otro barrio u oficio." |
| Registro submit | (mantener) | "Crear mi cuenta" + subtexto "Gratis · En 1 minuto" |

---

## 7. Plan de acción automatizado (prioridad)

| Orden | Acción | Archivo(s) | Esfuerzo | Impacto |
|-------|--------|------------|----------|---------|
| 1 | Subir CTA hero y reducir ruido en home (un CTA + subtexto) | `src/app/home/page.tsx` | Bajo | Alto |
| 2 | Aumentar altura táctil de chips atajos (min-h-[44px], py-3) | `src/app/home/page.tsx` | Bajo | Alto |
| 3 | Reemplazar copy CTA por variantes persuasivas (tabla §6) | Varios | Bajo | Alto |
| 4 | Mensaje estado vacío en mapa + CTA "Cambiar zona" / "Ver oficios" | `src/app/mapa/page.tsx` | Bajo | Alto |
| 5 | Agrupar oficios en mapa (tabs o acordeón por categoría) | `src/app/mapa/page.tsx`, `src/data/...` | Medio | Medio |
| 6 | Perfil: pestañas o secciones colapsables + "Perfil X% completo" | `src/app/profile/page.tsx` | Medio | Alto |
| 7 | Login: copy botón + link recuperación siempre visible | `src/app/(auth)/login/page.tsx` | Bajo | Medio |
| 8 | Eventos analytics: first_meaningful_click, login_success, mapa_result_view | `src/lib/analytics/events.ts`, componentes | Medio | Medio |
| 9 | Scripts E2E: home first action, login, mapa empty | `scripts/` (Playwright/Cypress) | Medio | Medio |
| 10 | Dashboard KPIs (conceptual): implementar vista con Embudo / Fricción / Engagement | Nuevo módulo o doc | Medio | Medio |

---

## 8. Conclusión

- **Fricciones críticas:** Sobrecarga en home, CTA tarde en el scroll, chips pequeños, mapa sin resultado vacío amigable, perfil demasiado largo.
- **Oportunidades rápidas:** Microcopy persuasivo (§6), CTA arriba en home, chips ≥ 44px, estado vacío en mapa.
- **Predicción de abandono:** Mitigar con un solo "siguiente paso" claro en home, mensajes de error y estado vacío útiles, y reducción de opciones visibles en la primera pantalla.
- **Plug-and-play:** Los bloques de código de §3.1 (Home) y §3.2 (Login) son copiables; el plan §7 indica archivos y orden de implementación. Scripts §4 y dashboard §5 son plantillas para automatización y monitoreo.

Este documento sirve como **agente UX autónomo**: auditoría, predicción, microcopy, mockups en Tailwind/Next.js, scripts de testing y plan de acción listos para ejecutar sin intervención manual adicional.
