# Reporte UX — Agente Autónomo 3.0 · YAPÓ 3.0

**Entrada:** Proyecto Next.js YAPÓ 3.0 (web).  
**Salida:** Auditoría completa, fricciones, predicción de abandono, KPIs, microcopy, código plug-and-play y plan de acción.

---

## 1. Fricciones detectadas (por impacto)

### Alto impacto
| ID | Ubicación | Fricción | Causa probable |
|----|-----------|----------|----------------|
| F1 | Home — scroll largo | Sobrecarga cognitiva: muchas secciones con peso visual similar | Usuario no sabe dónde actuar primero; aumenta Time on Task y abandono. |
| F2 | Login / Register | Un solo CTA principal poco diferenciado; "Iniciar sesión" / "Crear cuenta" genéricos | Bajo CTR en conversión; urgencia y beneficio no comunicados. |
| F3 | Flujo profesional → contactar | Tras "Contactar" en `/profesionales/[id]` no hay feedback inmediato (ej. "Mensaje enviado") | Usuario duda si la acción funcionó; puede repetir clic o abandonar. |

### Medio impacto
| ID | Ubicación | Fricción |
|----|-----------|----------|
| F4 | Home — QuickActionBar vs Chips | Solapamiento: Billetera/Escudos en chips y en barra por rol; dos barras de "atajos" | Confusión sobre qué usar primero. |
| F5 | Formularios (registro) | Consentimiento obligatorio con copy legal; sin resumen amigable | Aumenta fricción percibida en registro. |
| F6 | Profesionales por área | Chips de oficio con count (1) pueden parecer poco útiles | Oportunidad de mostrar "más cerca" o "recomendado" para reducir decisión. |

### Bajo impacto
| ID | Ubicación | Fricción |
|----|-----------|----------|
| F7 | ActionBar | Icono "Buscar" usa IconCerebro; patrón mental "mapa" podría esperar icono de mapa/lupa | Inconsistencia menor. |
| F8 | Footer Home | "Ver mi Billetera" es solo texto; zona táctil menor que 44px en móvil | Accesibilidad táctil. |

---

## 2. Predicción de abandono

| Punto del flujo | Prob. abandono (estimada) | Causa principal | Intervención sugerida |
|------------------|---------------------------|------------------|------------------------|
| Después del primer scroll en Home | Media (35%) | Demasiadas opciones; no hay "siguiente paso" claro | Un CTA hero debajo de Reels: "Encontrá tu próximo trabajo" / "Contratá con confianza". |
| Formulario de registro (antes de enviar) | Alta (45%) | Campos + consentimiento; sin progreso visible | Progress bar "Paso 2 de 3", microcopy "Quedan 30 segundos". |
| Después de "Contactar" en perfil profesional | Media (25%) | Falta de confirmación | Toast o estado "Enviado ✓ Te respondemos pronto". |
| Login tras error de credenciales | Alta (50%) | Mensaje genérico; sin recuperación clara | "¿Olvidaste tu contraseña?" prominente + link a recuperación. |

---

## 3. KPIs asociados y objetivos

| KPI | Objetivo | Cómo medir (conceptual) |
|-----|----------|-------------------------|
| **Task Success Rate (TSR)** | >90% completan perfil / primera contratación | Evento "profile_completed", "first_contact_click". |
| **Time on Task** | <60 s desde Home hasta primer clic en profesional o oferta | Timestamp en "card_click" / "reel_click" − load. |
| **Clicks to Conversion** | ≤3 clics desde Home a "Contactar" o "Aceptar propuesta" | Conteo de navegación en sesión hasta conversión. |
| **Retention (D1)** | >40% vuelven al día siguiente | Session con gap 24h. |
| **Engagement Score** | Promedio de secciones vistas por sesión >3 | Scroll depth o sección vista (Reels, Cuadrantes, Profesionales). |
| **Alertas de fricción** | Abandono en registro >40%; rebote en Home >50% | Funnel registro; bounce en /home. |

---

## 4. Oportunidades de mejora (prioridad de acción)

### Alta prioridad
1. **CTA hero en Home** (reduce F1, abandono post-scroll): un solo bloque destacado debajo de Reels con botón único por rol (ej. "Ver ofertas para vos" / "Publicar mi primera oferta").
2. **Feedback post-Contactar** (F3): en `/profesionales/[id]` o en el handler de "Contactar", mostrar toast o mensaje "Enviado ✓" y opcionalmente redirigir a `/chat?to=id`.
3. **Login: recuperación de contraseña visible** (abandono post-error): enlace "¿Olvidaste tu contraseña?" junto al mensaje de error, min-h 44px.

### Media prioridad
4. **Microcopy de conversión en Login/Register**: sustituir "Iniciar sesión" por "Entrar a YAPÓ" o "Ver mis ofertas"; "Crear cuenta" por "Empezar gratis" o "Registrarme en 1 minuto".
5. **Unificar atajos en Home** (F4): una sola barra de acciones rápidas por rol (Chips o QuickActionBar), no ambas con solapamiento.
6. **Registro: barra de progreso** (F5): "Paso 1 de 3 — Datos básicos"; "Paso 2 — Contraseña"; "Paso 3 — Listo".

### Baja prioridad
7. **Footer "Ver mi Billetera"** (F8): convertir en botón min-h-[44px] con mismo estilo que chips.
8. **Icono Buscar** (F7): añadir IconMap o IconSearch y usarlo en ActionBar para `/mapa`.

---

## 5. Microcopy dinámico sugerido (plug-and-play)

Reemplazos listos para copiar/pegar según contexto.

| Ubicación | Actual (ejemplo) | Sugerido (persuasivo/urgente) |
|-----------|-------------------|-------------------------------|
| Login — título | "Iniciar sesión" | "Entrá a tu cuenta" o "Volvé a tus ofertas" |
| Login — botón submit | "Iniciar sesión" | "Entrar" o "Ver mi panel" |
| Register — título | "Crear cuenta" | "Empezar gratis" o "Creá tu cuenta en 1 minuto" |
| Register — submit | "Registrarme" | "Crear mi cuenta" o "¡Listo, quiero empezar!" |
| Register — consent error | "Debés aceptar la Política…" | "Para seguir, aceptá la Política de Privacidad y los Términos" |
| Home — bloque Tu día | "Tu día" | "Para vos hoy" o "Tu resumen" |
| Home — CTA Billetera (footer) | "Ver mi Billetera" | "Ver saldo y pagos" |
| Perfil profesional — Contactar | "Contactar" | "Escribir mensaje" o "Contactar por chat" |
| Post-Contactar (toast) | — | "Mensaje enviado ✓ Te respondemos pronto" |

---

## 6. Mockups / código Tailwind + Next.js (listos para implementar)

### 6.1 CTA hero debajo de Reels (Home)

Objetivo: un solo CTA principal por viewport; reduce F1 y abandono.

```tsx
// Colocar justo después del cierre del bloque "Tu día", antes de Indicador de escudos.
<section className="mx-auto w-full max-w-[min(90vw,520px)] py-2" aria-label="Acción principal">
  <Link
    href={primaryRole && ["pyme", "enterprise"].includes(primaryRole) ? "/mapa" : "/profesionales"}
    className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-yapo-red px-6 py-4 text-lg font-bold text-white shadow-lg transition-[transform,box-shadow] duration-100 active:scale-[0.98] active:shadow-xl"
  >
    {primaryRole && ["pyme", "enterprise"].includes(primaryRole)
      ? "Publicar oferta o buscar talento"
      : "Ver ofertas para vos"}
  </Link>
</section>
```

### 6.2 Toast de confirmación post-Contactar

Objetivo: feedback inmediato (F3). Ejemplo con estado local en cliente.

```tsx
// En la página /profesionales/[id] o en el componente que maneja el clic a /chat?to=id
const [contactSent, setContactSent] = useState(false);
// Al hacer clic en Contactar: setContactSent(true); router.push(`/chat?to=${pro.id}`);

{contactSent && (
  <div
    role="status"
    className="fixed bottom-24 left-4 right-4 z-50 rounded-xl bg-yapo-emerald px-4 py-3 text-center font-medium text-white shadow-lg"
    aria-live="polite"
  >
    Mensaje enviado ✓ Te respondemos pronto
  </div>
)}
```

### 6.3 Login — enlace recuperación visible

```tsx
// Debajo del mensaje de error en login
{error && (
  <>
    <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">{error}</div>
    <Link
      href="/forgot-password"
      className="flex min-h-[44px] items-center justify-center rounded-xl border border-yapo-blue/20 py-2 text-sm font-medium text-yapo-blue"
    >
      ¿Olvidaste tu contraseña?
    </Link>
  </>
)}
```

### 6.4 Footer Billetera — zona táctil 44px

```tsx
// Reemplazar el <Link> actual del footer por:
<Link
  href="/wallet"
  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-yapo-blue-light/40 px-4 py-2.5 text-sm font-semibold text-yapo-blue transition-[transform,opacity] duration-75 active:scale-[0.98]"
>
  Ver mi Billetera
</Link>
```

---

## 7. Scripts automáticos UX (conceptuales)

### 7.1 Flujo: Home → primer clic en oferta/profesional

- **Métrica:** Time on Task (desde load de /home hasta primer clic en Reel, card de profesional o cuadrante).
- **Implementación:** En Home, en eventos onClick de YapoReels, TopProfessionalsByCategory y DashboardQuadrants, enviar evento con `timestamp - sessionStart` (sessionStart en localStorage o en analytics).
- **Objetivo:** <60 s.

### 7.2 Flujo: Registro completo

- **Métrica:** TSR (registro completado / registro iniciado).
- **Eventos:** `register_start`, `register_step_2`, `register_complete`; en fallo `register_abandon` con step.
- **Objetivo:** >90% TSR.

### 7.3 Punto de fricción: rebote en Home

- **Métrica:** Usuario entra a /home y sale sin clic en ningún CTA (ni Reels, ni cuadrantes, ni profesionales).
- **Implementación:** Contar clics en secciones principales; si session termina sin ninguno, marcar "bounce_home".
- **Objetivo:** reducir bounce_home <50%.

---

## 8. Dashboard conceptual de KPIs (visualización)

Vista conceptual para un dashboard interno (no código completo; estructura sugerida).

| Panel | Métrica | Tipo | Alerta si |
|-------|---------|------|-----------|
| TSR Registro | % completados / iniciados | Número + tendencia | <85% |
| Time on Task (Home → primer clic) | Segundos promedio | Histograma / P50, P90 | P50 >90 s |
| Clicks to Conversion | Promedio de clics hasta "Contactar" o "Aceptar" | Número | >4 |
| Retention D1 | % sesiones con vuelta a 24h | Número | <35% |
| Fricción: abandono en registro | % abandonos en paso 2 | Funnel | >45% |
| Fricción: bounce Home | % salidas sin clic | Número | >50% |

**Prioridad de acción en dashboard:** Ordenar por "Alerta activa" y por impacto (TSR, Time on Task, Retention).

---

## 9. Plan de acción automatizado (orden de ejecución)

| Orden | Acción | Archivo(s) | Esfuerzo |
|-------|--------|------------|----------|
| 1 | Añadir CTA hero debajo de "Tu día" (por rol) | `src/app/home/page.tsx` | Bajo |
| 2 | Añadir toast "Mensaje enviado ✓" al hacer Contactar | `src/app/profesionales/[id]/page.tsx` o handler de navegación a chat | Bajo |
| 3 | Mostrar "¿Olvidaste tu contraseña?" en login cuando hay error | `src/app/(auth)/login/page.tsx` | Bajo |
| 4 | Reemplazar microcopy Login/Register (tabla §5) | `src/app/(auth)/login/page.tsx`, `register/page.tsx` | Bajo |
| 5 | Footer Billetera: botón 44px (snippet §6.4) | `src/app/home/page.tsx` | Bajo |
| 6 | Unificar atajos (quitar QuickActionBar o Chips; dejar uno por rol) | `src/app/home/page.tsx`, config por rol | Medio |
| 7 | Registro: barra de progreso "Paso 1 de 3" | `src/app/(auth)/register/page.tsx` | Medio |
| 8 | Eventos analytics (Time on Task, TSR, bounce) | Nuevo módulo o integración (ej. GTM, Vercel Analytics) | Medio |

---

## 10. Checklist de auditoría automática (estado actual YAPÓ 3.0)

| # | Criterio | Estado | Nota |
|---|----------|--------|------|
| 1 | Jerarquía visual | Mejorable | CTA hero único reduce ruido. |
| 2 | Zonas táctiles 44–88px | Cumple | ActionBar, cuadrantes, chips OK; footer Billetera mejorar. |
| 3 | Microcopy estratégico | Mejorable | Aplicar tabla §5. |
| 4 | Feedback inmediato | Mejorable | Toast post-Contactar; loading en formularios OK. |
| 5 | Sobrecarga cognitiva | Mejorable | Menos secciones competidoras; CTA hero ayuda. |
| 6 | Economía del esfuerzo | Cumple | Flujo profesional → contactar en pocos clics. |
| 7 | Patrones y familiaridad | Cumple | ActionBar y menú coherentes. |
| 8 | Gamificación / refuerzos | Oportunidad | Badges, "Perfil 80% completo", Reels guardados. |
| 9 | Predicción de abandono | Incluida | Ver §2. |
| 10 | Responsive y accesibilidad | Cumple | Safe areas, aria-labels; revisar contraste textos secundarios. |

---

**Resumen:** Este reporte es la salida plug-and-play del agente UX autónomo sobre YAPÓ 3.0. Las secciones 5 (microcopy), 6 (código) y 9 (plan) son directamente implementables; las secciones 7 y 8 definen scripts de testing y dashboard conceptual para métricas y alertas de fricción.
