# Auditoría UX – Pantalla de búsqueda con mapa

**Rol:** UX Strategist Senior + Fullstack + Neuroventas  
**Objetivo:** Maximizar Task Success Rate, reducir abandono, aumentar conversión.

---

## 1. Fricciones detectadas

### Visuales
| Fricción | Componente | Impacto | Solución |
|----------|------------|--------|----------|
| Jerarquía plana | Header + SearchPillar | Bajo contraste entre “qué hacer” y “cómo” | H1 claro + subtítulo orientado a beneficio; CTA único destacado (color, tamaño) |
| Exceso de información arriba | Stats (barrios, dep., GPS) | Sobrecarga antes de la primera acción | Mover stats debajo del mapa o colapsables |
| 20 chips de oficios sin agrupación | Filtros zona | Parálisis por elección | Agrupar por categoría o mostrar “Top 6” + “Ver todos” |
| Placeholder largo | Input búsqueda | Menos escaneable | Microcopy corto: “¿Qué servicio necesitás hoy?” |

### Cognitivas
| Fricción | Componente | Impacto | Solución |
|----------|------------|--------|----------|
| Dos flujos paralelos (texto vs. selects) | Búsqueda vs. Depto/Ciudad/Barrio | Usuario no sabe si escribir o elegir | Guiar: “Escribí oficio y zona” o un solo input con sugerencias |
| Capa del mapa poco explicada | Selector capa | No se entiende qué cambia | Labels con resultado esperado: “Ver dónde se necesita [oficio]” |
| Sin feedback inmediato al buscar | Submit | ¿Funcionó? | Scroll a resultados + mensaje “Mostrando X en [zona]” |

### Funcionales
| Fricción | Componente | Impacto | Solución |
|----------|------------|--------|----------|
| Enter no siempre dispara búsqueda | Input | Expectativa incumplida | onKeyDown Enter → submit |
| GPS opcional pero prominente | LocationToggle | Confusión si no quieren dar ubicación | Texto: “Opcional: activá para ver distancia” |
| Resultados lejos del mapa | Lista abajo | Desconexión mapa ↔ lista | Anclar “En esta zona” cerca del mapa; mismo bloque visual |

---

## 2. Predicción de abandono por componente

| Componente | Riesgo abandono | Motivo | Mitigación |
|------------|------------------|--------|------------|
| Input búsqueda vacío | Alto | No sabe qué escribir | Placeholder + ejemplos inline (“plomero”, “FdM”) |
| Selects Depto/Ciudad/Barrio | Medio | Tres pasos; barrio no obvio | Default a “Cercano a mí” si hay GPS; autocompletar desde búsqueda |
| Mapa sin resultados | Alto | “No hay nadie” | Mensaje claro + CTA “Probá otra zona u oficio” |
| Lista larga sin filtro | Medio | No encuentra al que busca | Filtro rápido Certificado/Amateur ya presente; mantener visible |
| Capa del mapa | Bajo | Power users | Dejar selector; tooltip corto en primera visita |

---

## 3. Jerarquía visual y microcopy optimizados

- **H1:** “Encontrá profesionales confiables en minutos” (beneficio).
- **Subtítulo:** “Buscar por oficio y zona · Resultados en el mapa”.
- **Input:** placeholder “¿Qué servicio necesitás hoy?” (corto, orientado a necesidad).
- **CTA principal:** “Buscar profesionales cerca mío” (una sola acción; ícono lupa).
- **Prueba social bajo CTA:** “+3.200 profesionales verificados cerca tuyo” (número concreto).
- **GPS:** “Opcional: activá tu ubicación para ver distancia” (reduce fricción de privacidad).

---

## 4. Interacciones guiadas

1. **Primera visita:** Foco en input; opcionalmente tooltip: “Ej: plomero, Fernando de la Mora”.
2. **Al escribir:** Sugerencias de oficio/zona (autocomplete) para reducir clics.
3. **Al enviar:** Scroll suave a “Resultados en esta zona” + posible highlight del mapa.
4. **Si 0 resultados:** Mensaje + botones “Cambiar zona” y “Ver todos los oficios”.
5. **Al elegir un profesional:** “Contratar con 50% de Seña” siempre visible; WhatsApp secundario.

---

## 5. Priorización por impacto (plug-and-play)

| # | Acción | Impacto | Esfuerzo | Incluido en entrega |
|---|--------|--------|----------|----------------------|
| 1 | SmartSearch con H1/placeholder/CTA/microcopy | Alto | Bajo | ✅ Componente SmartSearch |
| 2 | trackUX (time_to_first_search, clicks_to_result, etc.) | Alto | Bajo | ✅ ux-tracking.ts |
| 3 | Scroll a resultados + mensaje “Mostrando X en [zona]” | Medio | Bajo | ✅ En mapa page |
| 4 | Dashboard KPIs UX (Task Success, abandono) | Medio | Medio | ✅ UXKPIDashboard |
| 5 | Tests E2E búsqueda (input → submit → resultados) | Medio | Medio | ✅ Script ux-test-search |
| 6 | Reducir chips a “Top 6” + “Ver todos” | Medio | Bajo | Opcional (no aplicado por defecto) |
| 7 | Autocomplete oficio/zona | Alto | Alto | Backlog |

---

## 6. KPIs UX propuestos (dashboard)

- **Task Success Rate:** % sesiones con al menos 1 clic en “Ver perfil” o “Contratar” desde resultados del mapa.
- **Time to first search:** Segundos desde carga hasta primer submit de búsqueda.
- **Clicks to result:** Número de clics desde carga hasta abrir un perfil.
- **Scroll depth:** % de sesiones que llegan a la lista de resultados (o al final).
- **Filter usage:** % sesiones que usan filtro Certificado/Amateur o selector de capa.
- **Abandonment probability:** Heurístico por tiempo en página sin submit (ej. >30 s sin buscar → riesgo).

Métricas definidas en `src/lib/analytics/ux-tracking.ts` y panel en `UXKPIDashboard`.
