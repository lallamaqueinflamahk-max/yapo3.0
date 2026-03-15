# Auditoría UX YAPÓ — Framework 7 leyes Silicon Valley

**Fecha:** Febrero 2026  
**Versión app:** YAPÓ 3.0  
**Metodología:** UX Strategist Auditor (7 leyes de Silicon Valley)

---

## Resumen ejecutivo

YAPÓ es una plataforma de servicios locales en Paraguay que conecta profesionales verificados con usuarios. Esta auditoría aplica el framework de las 7 leyes para evaluar el producto, identificar fricciones y proponer prioridades.

**Score global:** 72/100

---

## 1. Análisis por ley

### Ley 1 — Usuario = Rey

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| El usuario sabe qué puede hacer en menos de 5 s | ✅ | Root redirige a `/home`. HeroSection + CerebroBarHomeSection visibles de inmediato. Microcopy "Encontrá profesionales confiables en minutos" orientado a beneficio. |
| Un solo CTA por pantalla en pantallas clave | ⚠️ | **Home:** CerebroBar (buscar) + QuickActionsGrid (múltiples acciones) + Recommendations. Varios CTAs compiten. **Mapa:** SmartSearch tiene CTA único "Buscar profesionales cerca mío" ✅. |
| Información orientada a beneficio, no a producto | ✅ | SmartSearch: "Encontrá profesionales confiables en minutos", "+3.200 profesionales verificados cerca tuyo". CerebroBar: "Escribí o usá el micrófono". |
| Lenguaje inclusivo, cercano | ✅ | Voz "vos" ("¿Qué necesitás?", "Encontrá", "Buscá"). Consistente en mapa y home. |

**Puntuación Ley 1:** 78/100

---

### Ley 2 — Menos es más

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Pocos elementos por pantalla en pantallas críticas | ⚠️ | **Mapa:** SmartSearch + LocationToggle + Mapa + Filtros (oficio + zona) + Resultados. Densidad alta pero jerarquizada. **Navbar:** Menú lateral con ~11 ítems. Puede abrumar. |
| Información gradual | ✅ | Filtros "¿Qué necesitás?" / "¿Dónde?" en secciones. Resultados ordenados por verificación/rating. Chips de oficio mostrados tras elegir zona. |
| Elementos visuales reducidos | ✅ | Colores YAPÓ (petroleo, cta, azul) controlados. Iconos emoji en oficios. Sin decoraciones innecesarias. |

**Puntuación Ley 2:** 72/100

---

### Ley 3 — Jerarquía visual clara

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| CTA destacado | ✅ | Botón "Buscar profesionales cerca mío" en SmartSearch: bg-yapo-cta, h-14, shadow. CerebroBar: lupa y micrófono visibles. |
| Headlines claros | ✅ | "Encontrá profesionales confiables en minutos", "En {barrio}", "¿Qué necesitás?", "¿Dónde?". |
| Progresión lógica | ✅ | Búsqueda → Filtros → Resultados → Card profesional con link a perfil, WhatsApp, contratar. |

**Puntuación Ley 3:** 82/100

---

### Ley 4 — Fricción mínima

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Pocos campos en formularios | ⚠️ | **Login:** Email, contraseña, masterKey (opc.). Campos aceptables. **Register:** Nombre (opc), email, password, checkbox consent. **Mapa:** Depto/Ciudad/Barrio (3 selects). Sin autocompletar de zona en SmartSearch — hay que elegir manualmente o escribir texto libre. |
| Autocompletar / sugerencias | ⚠️ | SmartSearch detecta oficio y zona en texto libre (aliases). No hay autocompletar en el input. |
| Accesos rápidos | ✅ | QuickActionsGrid, ActionBar (Inicio/Buscar/Billetera/Perfil). Chips de oficio. |
| Reducción de pasos | ⚠️ | Para contratar: Home → Mapa → Elegir zona + oficio → Resultados → Perfil → `/trabajo/aceptar`. Flujo largo. En home hay "Contratar" directo en YapoCardFeed. |

**Puntuación Ley 4:** 68/100

---

### Ley 5 — Consistencia

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Mismo patrón de navegación | ✅ | ActionBar fijo abajo. Navbar arriba con menú lateral. |
| Mismos estilos | ✅ | Tailwind + tema YAPÓ. Botones `btn-interactive`, `nav-card-interactive`. Colores consistentes. |
| Mismos patrones de búsqueda | ⚠️ | CerebroBar (home) vs SmartSearch (mapa): dos barras distintas. CerebroBar tiene IA/voice; SmartSearch texto libre. Diferentes affordances. |
| Nomenclatura coherente | ✅ | "Profesionales", "Oficios", "Zona", "Billetera", "Perfil". |

**Puntuación Ley 5:** 75/100

---

### Ley 6 — Feedback inmediato

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Estados de carga | ✅ | Spinner "Cargando resultados…" en mapa. Loading states en fetch. |
| Confirmación de acciones | ⚠️ | Login/Register: redirect sin toast. Búsqueda: resultados aparecen. No hay feedback explícito "Búsqueda enviada" antes de cargar. |
| Errores claros | ✅ | Login: "Email o contraseña incorrectos." Register: "Para seguir, aceptá la Política de Privacidad y los Términos." Mapa: "No se pudieron cargar profesionales ni empresas de la zona." |
| Microinteracciones | ✅ | `active:scale-[0.98]`, `hover:shadow-md`. Botones con transiciones. |

**Puntuación Ley 6:** 74/100

---

### Ley 7 — Mobile-first

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Diseño responsive | ✅ | Tailwind `sm:`, `md:`, `lg:`. Grid de oficios `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`. ActionBar con `pb-[max(0.5rem,env(safe-area-inset-bottom))]`. |
| Tamaños táctiles | ✅ | `min-h-[44px]` en botones. ActionBar links `min-h-[64px] min-w-[64px]`. |
| Legibilidad | ✅ | Fuentes adecuadas. Contraste texto/fondo correcto. |
| Accesibilidad | ⚠️ | `aria-label`, `role` en secciones. Falta revisar foco, lectores de pantalla completos. |

**Puntuación Ley 7:** 80/100

---

## 2. Matriz de fricción (esfuerzo vs impacto)

| Fricción | Esfuerzo para corregir | Impacto en conversión | Prioridad |
|----------|------------------------|------------------------|-----------|
| Varios CTAs compitiendo en home | Medio | Alto | **P1** |
| Menú lateral con 11 ítems | Bajo | Medio | **P2** |
| CerebroBar vs SmartSearch (patrones distintos) | Alto | Medio | P3 |
| Sin autocompletar en SmartSearch | Medio | Medio | P2 |
| Flujo largo para contratar (mapa) | Alto | Alto | P1 |
| Sin feedback "Búsqueda enviada" antes de cargar | Bajo | Bajo | P3 |
| LocationToggle como bloque separado | Bajo | Bajo | P3 |

---

## 3. Scorecard (0–100)

| Ley | Puntuación |
|----|------------|
| Ley 1 — Usuario = Rey | 78 |
| Ley 2 — Menos es más | 72 |
| Ley 3 — Jerarquía visual | 82 |
| Ley 4 — Fricción mínima | 68 |
| Ley 5 — Consistencia | 75 |
| Ley 6 — Feedback inmediato | 74 |
| Ley 7 — Mobile-first | 80 |

**Score global:** (78+72+82+68+75+74+80)/7 = **72.7 ≈ 72/100**

---

## 4. Prioridades (top 5)

1. **Simplificar CTAs en home** — Un CTA principal (buscar) y secundarios colapsados o en sección "Más acciones".
2. **Acortar flujo de contratación** — Botón "Contratar" visible desde la lista de resultados (sin entrar al perfil).
3. **Reorganizar menú lateral** — Agrupar por contexto (Buscar, Mi cuenta, Ayuda) y reducir ítems visibles.
4. **Autocompletar en SmartSearch** — Sugerencias de oficio y zona mientras escribe.
5. **Unificar patrón de búsqueda** — CerebroBar y SmartSearch con comportamiento similar (misma barra o mismo estilo de input/CTA).

---

## 5. Conclusiones

YAPÓ tiene una base UX sólida: jerarquía visual clara, mobile-first, microcopy orientado a beneficio y reducción de fricción en la búsqueda del mapa. Las áreas de mejora más impactantes son: simplificación de CTAs en home, acortamiento del flujo de contratación y consistencia entre CerebroBar y SmartSearch.

**Próximos pasos sugeridos:** aplicar prioridades P1 y P2, y re-auditar tras los cambios.
