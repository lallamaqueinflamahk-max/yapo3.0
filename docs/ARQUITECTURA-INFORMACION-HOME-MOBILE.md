# Arquitectura de información — Home Mobile (320px)

**Fecha:** Febrero 2026  
**Rol:** Arquitecto de información senior  
**Objetivo:** Jerarquía visual mobile-first con un único CTA principal por viewport  
**Usuario objetivo:** 25–45 años, poco tiempo, busca confiabilidad rápida

---

## 1. Auditoría — CTAs visibles en el primer scroll (home actual)

| # | Componente | Elemento | Tipo | Destino | Microcopy actual |
|---|------------|----------|------|---------|------------------|
| 1 | HeroSection | Botón primario | CTA | /mapa | "Buscar trabajo" |
| 2 | HeroSection | Botón secundario | CTA | /mapa?servicios=1 | "Publicar servicio" |
| 3 | CerebroBarHomeSection | Input + lupa | CTA | Buscar (submit) | placeholder: "Preguntá lo que quieras…" |
| 4 | CerebroBarHomeSection | Micrófono | CTA | Voz (submit) | — |
| 5 | QuickActionsGrid | Link | CTA | /mapa | "Buscar empleo cerca" |
| 6 | QuickActionsGrid | Link | CTA | /home#profesionales | "Top ofertas hoy" |
| 7 | QuickActionsGrid | Link | CTA | /profile#curriculum | "Mis postulaciones" |
| 8 | QuickActionsGrid | Link | CTA | /chat | "Mensajes" |
| 9 | QuickActionsGrid | Link | CTA | /wallet | "Mi billetera" |
| 10 | QuickActionsGrid | Link | CTA | /escudos | "Activar escudo" |
| 11 | RecommendationsCards* | Card | CTA | /mapa | "Top empleos en tu zona" |
| 12 | RecommendationsCards* | Card | CTA | /mapa?habilidades=1 | "Habilidades en demanda" |
| 13 | RecommendationsCards* | Card | CTA | /comunidad | "Empresas buscando" |

\* RecommendationsCards puede entrar en viewport según altura del dispositivo.

**Conclusión:** Hay **10+ CTAs competidores** en el primer scroll. No existe un único CTA dominante.

---

## 2. Jerarquía propuesta (3 niveles máximo)

| Nivel | Rol | Cantidad | Ubicación |
|-------|-----|----------|-----------|
| **Nivel 1** | Acción principal (única) | 1 | CerebroBar unificado — buscar |
| **Nivel 2** | Acciones secundarias colapsables | 2 máx visibles | "Más opciones" / menú hamburguesa |
| **Nivel 3** | Información contextual | Hints, tooltips | Placeholders, badges, leyendas |

### Desglose

- **Nivel 1:** Un solo campo de búsqueda + CTA "Encontrar" (input + botón). Sustituye Hero CTAs duplicados, CerebroBar y primer ítem de QuickActions.
- **Nivel 2:** "Publicar oferta" + "Ver mis mensajes" como links secundarios colapsados en acordeón o bajo "Más opciones".
- **Nivel 3:** Badges (Verificados, Pago protegido), hint "Ej: plomero en Lambaré" y tooltip en micrófono.

---

## 3. Wireframe Home Mobile 320px (propuesta)

```
┌─────────────────────────────────────────┐
│ [☰]         YAPÓ              [Avatar]  │  ← Navbar (existente)
├─────────────────────────────────────────┤
│                                         │
│  Trabajá o contratá                     │  ← H1 (beneficio)
│  con confianza real                     │
│                                         │
│  Perfiles verificados, pagos            │  ← Subtítulo N3
│  protegidos y reputación transparente   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ¿Qué necesitás hoy?         [🎤] │   │  ← NIVEL 1 (único CTA)
│  │ Ej: electricista en FDM         │   │     Input + mic
│  └─────────────────────────────────┘   │
│  [  Encontrar al mejor en 2 min  ]     │  ← CTA principal
│                                         │
│  ✔ Verificados  ✔ Pago protegido       │  ← N3: trust badges
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Más opciones              [˅]   │   │  ← N2 colapsado
│  └─────────────────────────────────┘   │
│  (al expandir: Publicar oferta,        │
│   Ver mensajes, Mi billetera)          │
│                                         │
│  ─────────── scroll ──────────────     │
│  Profesionales destacados              │
│  [card] [card] [card] →                │
│                                         │
└─────────────────────────────────────────┘
│ [Inicio] [Buscar] [Billetera] [Perfil] │  ← ActionBar (existente)
└─────────────────────────────────────────┘
```

### Anotaciones de jerarquía visual

| Zona | Nivel | Peso visual | Espaciado (8px grid) |
|------|-------|-------------|----------------------|
| H1 | N3 (contexto) | 24px bold | mt-0, mb-8 |
| Subtítulo | N3 | 14px regular | mb-16 |
| Input + mic | **N1** | 48px height, borde 2px | p-16 (16px) |
| CTA "Encontrar" | **N1** | 48px, bg-yapo-cta | mt-8, p-16 |
| Trust badges | N3 | 12px | mt-16 |
| "Más opciones" | N2 | 14px, link style | mt-24 |

---

## 4. CTAs consolidados (propuesta)

| Prioridad | CTA | Acción | Destino | Visibilidad |
|-----------|-----|--------|---------|-------------|
| **Primario** | Encontrar al mejor en 2 min | Buscar profesionales | Submit CerebroBar → /mapa con query | Siempre visible |
| Secundario 1 | Publicar mi oferta | Publicar trabajo/servicio | /mapa?servicios=1 | Colapsado en "Más opciones" |
| Secundario 2 | Ver mensajes | Ir al chat | /chat | Colapsado en "Más opciones" |

**Eliminados del primer scroll (movidos a menú / perfil):**
- Top ofertas hoy → dentro de "Profesionales destacados" (scroll)
- Mis postulaciones → Perfil
- Mi billetera → ActionBar
- Activar escudo → Menú hamburguesa

---

## 5. Documento de microcopy — Versiones A/B testeables

Fórmula: **[Beneficio] + [Acción]**

### Nivel 1 — CTA principal

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| A1 | Control | "Buscar profesionales" | Funcional, directo |
| A2 | Beneficio + tiempo | "Encontrar al mejor en 2 minutos" | Reduce ansiedad, promesa de velocidad |
| A3 | Beneficio + confianza | "Encontrar profesional verificado" | Enfatiza seguridad |
| A4 | Pregunta | "¿Qué necesitás hoy?" | Conversacional, empático |

**Recomendación inicial:** A2 o A4.

---

### Input / placeholder

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| B1 | Actual | "Preguntá lo que quieras: trabajo, billetera, escudos…" | Multiuso, largo |
| B2 | Ejemplo concreto | "Ej: plomero en Lambaré" | Reduce fricción, sugiere formato |
| B3 | Beneficio | "Decime qué buscás y te muestro opciones" | Conversacional |
| B4 | Corto | "Oficio y zona" | Mínimo |

**Recomendación inicial:** B2.

---

### Hint debajo del input (Nivel 3)

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| C1 | Actual | "Escribí o usá el micrófono" | Funcional |
| C2 | Beneficio | "Escribí o hablá — mismo resultado" | Iguala voz y texto |
| C3 | Ejemplo | "Ej: electricista FDM, empleada doméstica Central" | Guía concreta |

**Recomendación inicial:** C2.

---

### Hero — H1

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| D1 | Actual | "Trabajá o contratá con confianza real" | Dual (empleador/trabajador) |
| D2 | Solo contratar | "Contratá con confianza en 2 minutos" | Enfocado en contratación |
| D3 | Solo trabajar | "Encontrá trabajo cerca de casa" | Enfocado en búsqueda de empleo |
| D4 | Beneficio emocional | "Profesionales de confianza, sin vueltas" | Menos formal |

**Recomendación inicial:** D1 (mantener) o D2 si el segmento principal es contratador.

---

### Hero — Subtítulo

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| E1 | Actual | "Perfiles verificados, pagos protegidos y reputación transparente." | Features |
| E2 | Beneficio | "Encontrá, compará y contratá en minutos" | Orientado a acción |
| E3 | Corto | "Verificados y con pago seguro" | Mínimo |

**Recomendación inicial:** E2.

---

### Nivel 2 — "Más opciones" (acordeón)

| ID | Versión | Microcopy | Hipótesis |
|----|---------|-----------|-----------|
| F1 | Neutro | "Más opciones" | Genérico |
| F2 | Acción | "Otras acciones" | Más directo |
| F3 | Beneficio | "Ver todo lo que podés hacer" | Invita a explorar |

**Recomendación inicial:** F1.

---

### Links secundarios (dentro de "Más opciones")

| Elemento | Versión A (función) | Versión B (beneficio) |
|----------|---------------------|------------------------|
| Publicar | "Publicar servicio" | "Ofrecer mis servicios" |
| Mensajes | "Mensajes" | "Ver mis conversaciones" |
| Billetera | "Mi billetera" | "Ver mis pagos" |

---

## 6. Espaciado — 8px grid system

| Elemento | Valor | Clase Tailwind (8px base) |
|----------|-------|---------------------------|
| Padding section | 16px | p-4 |
| Gap entre bloques | 24px | gap-6 |
| Altura CTA | 48px | min-h-12 |
| Altura input | 48px | min-h-12 |
| Margen H1–subtítulo | 8px | mt-2 |
| Margen subtítulo–input | 24px | mt-6 |
| Margen input–CTA | 16px | mt-4 |
| Margen CTA–badges | 16px | mt-4 |
| Margen badges–"Más opciones" | 24px | mt-6 |

**Base:** 1 unidad = 8px → `space-1` = 4px, `space-2` = 8px, `space-4` = 16px, `space-6` = 24px.

---

## 7. Resumen de cambios propuestos

1. **Unificar CTAs:** Un solo CTA principal = CerebroBar (input + CTA "Encontrar").
2. **Colapsar QuickActions:** Mover a "Más opciones" (acordeón) o menú lateral.
3. **Simplificar Hero:** Mantener H1 y subtítulo; quitar botones "Buscar trabajo" y "Publicar servicio".
4. **Microcopy beneficio:** Sustituir "Buscar profesionales" por "Encontrar al mejor en 2 minutos".
5. **Placeholder:** Cambiar a "Ej: plomero en Lambaré".
6. **Grid 8px:** Aplicar espaciado en múltiplos de 8.
