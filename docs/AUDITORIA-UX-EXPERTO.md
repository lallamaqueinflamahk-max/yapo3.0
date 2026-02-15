# Auditoría UX — YAPÓ 3.0 (Experto en Experiencia de Usuario)

Análisis de la plataforma web desde perspectiva de **arquitectura de información**, **usabilidad**, **consistencia visual**, **flujos críticos** y **accesibilidad**. Objetivo: identificar fortalezas y oportunidades para reducir fricción y alinear la interfaz con los objetivos de negocio y la psicología del usuario.

---

## 1. Resumen ejecutivo

| Dimensión | Valoración | Comentario breve |
|-----------|------------|------------------|
| **Arquitectura de información** | Buena | Navegación predecible (ActionBar + menú), rutas claras. Inconsistencias menores entre menú y barra inferior. |
| **Home y descubrimiento** | Mejorable | Muchas secciones en un solo scroll; riesgo de sobrecarga. Orden lógico (Smart-Bar → Reels → Cuadrantes → Semáforo). |
| **Consistencia visual** | Buena | Paleta y tokens coherentes, componentes reutilizables. Algunos patrones repetidos (dos accesos a Billetera). |
| **Flujos críticos** | Mejorable | Encontrar profesional y contactar está bien encadenado; landing raíz no orienta al usuario. |
| **Accesibilidad y tacto** | Buena | Zonas táctiles 44–48px, aria-labels, contraste. Algunos enlaces solo texto. |
| **Microcopy y jerarquía** | Mejorable | Títulos genéricos ("Cuadrantes de Gestión"); oportunidades de copy más orientado a acción y beneficio. |

---

## 2. Arquitectura de información y navegación

### 2.1 Estructura global

- **Layout**: Header fijo (Navbar) + contenido scroll + Footer + **ActionBar fija abajo** (4 ítems). Patrón móvil-first claro.
- **Rutas principales**: `/` (landing técnica), `/home`, `/mapa`, `/wallet`, `/profile`, más `/cerebro`, `/chat`, `/dashboard`, `/escudos`, `/comunidad`, auth y legal.

### 2.2 Puntos fuertes

- **ActionBar** con 4 ítems (Inicio, Mapa, Billetera, Perfil): ancla familiar, siempre visible, reduce carga cognitiva.
- **Menú lateral** (hamburguesa) da acceso a más destinos sin saturar la barra inferior.
- **Footer** con legal (Privacidad, Términos, Consentimiento) y enlace a home.
- **Guards** (ConsentGuard, ProfileGuard) encauzan al usuario según estado (consentimiento, perfil).

### 2.3 Inconsistencias y fricción

1. **Landing raíz (`/`)**  
   - Muestra "YAPÓ LOCAL OK" y un enlace "Ir a Inicio YAPÓ". No comunica valor ni guía a nuevo usuario (registro vs inicio).  
   - **Recomendación**: Redirigir `/` a `/home` (o a una landing con valor propuesto + CTA "Entrar" / "Registrarme").

2. **Etiquetado Mapa vs Buscar**  
   - ActionBar: "Mapa" con icono Cerebro.  
   - Navbar: "Buscar profesionales" para la misma ruta `/mapa`.  
   - **Recomendación**: Unificar (ej. "Mapa" en ambos o "Buscar" en ambos) y usar un icono de mapa/lupa para Mapa/Buscar.

3. **Doble acceso a Billetera**  
   - En Home: Chips de Intención "Mi Billetera" + sección final "Ir a Billetera".  
   - Puede ser intencional (refuerzo), pero genera redundancia visual.  
   - **Recomendación**: Mantener un CTA principal (p. ej. solo chips o solo bloque final) o diferenciar contexto (ej. "Ver saldo" en chips y "Ir a Billetera" como CTA principal).

4. **Mensajes no está en ActionBar**  
   - Chips de Intención incluyen "Mensajes" → `/chat`, pero la barra inferior no. Usuarios que esperan "Mensajes" abajo pueden no encontrarlo.  
   - **Recomendación**: Documentar la decisión (prioridad a Inicio/Mapa/Billetera/Perfil) o valorar sustituir un ítem (p. ej. Perfil por "Mi Cuenta" que agrupe perfil + mensajes) según métricas.

---

## 3. Home: jerarquía, carga cognitiva y "primero lo esencial"

### 3.1 Orden actual de secciones

1. Logo + Smart-Bar + Chips de Intención  
2. YAPÓ Reels (carrusel)  
3. Cuadrantes de Gestión  
4. Semáforo de Territorio (por rol)  
5. Indicador de escudos  
6. QuickActionBar (acciones por rol)  
7. Contratar con Seña Protegida (YapoCardFeed)  
8. Profesionales por área (TopProfessionalsByCategory)  
9. Beneficios (condicional)  
10. Más opciones (Buscar, Cerebro, Escudos, Planes)  
11. CTA Billetera  

### 3.2 Puntos fuertes

- **Smart-Bar** arriba: lugar esperado para búsqueda/IA; placeholder por rol mejora relevancia.
- **Reels** como descubrimiento justo debajo: contenido predictivo y enganche.
- **Cuadrantes** con 4 bloques táctiles (min-h 88px): claros y por rol.
- **Profesionales por área**: categorías clicables → oficios con cantidad → grid de cards con "Ver perfil" que lleva a `/profesionales/[id]` (flujo cerrado).

### 3.3 Oportunidades de mejora

1. **Longitud y sensación de "todo igual"**  
   - Muchas secciones con estilo similar (borde azul, fondo blanco, título en mayúsculas).  
   - **Recomendación**: Agrupar visualmente (ej. "Tu día" = Reels + Cuadrantes + Semáforo) y dar más peso visual a 1–2 bloques clave (p. ej. Reels y Cuadrantes) con tamaño o color.

2. **Títulos genéricos**  
   - "Cuadrantes de Gestión", "Más opciones" no comunican beneficio.  
   - **Recomendación**: Microcopy orientado a tarea o resultado: "Tu panel", "Atajos", "Explorar ofertas", etc.

3. **QuickActionBar vs Chips de Intención**  
   - Chips: Mi Billetera, Transferir, Activar Escudo, Mensajes.  
   - QuickActionBar: acciones por rol (Trabajo, Calificación, Escudos, Beneficios, etc.).  
   - Hay solapamiento conceptual (Escudos, Billetera).  
   - **Recomendación**: Unificar en una sola barra de atajos por rol o separar claramente "Acciones rápidas" (4 chips) vs "Tu panel" (cuadrantes).

4. **"Contratar con Seña Protegida" antes que "Profesionales por área"**  
   - El flujo "ver profesional → ver perfil → contactar" está en Profesionales por área; el feed con Seña es otro canal.  
   - **Recomendación**: Decidir qué flujo se prioriza (descubrimiento por área vs ofertas con seña) y ordenar/énfasis en consecuencia; o etiquetar cada bloque para que el usuario entienda la diferencia.

---

## 4. Consistencia visual y diseño

### 4.1 Fortalezas

- **Sistema de color** coherente: `yapo-blue`, `yapo-red`, `yapo-amber`, etc., con variantes light/dark.
- **Componentes** reutilizables: Avatar, Botones, BarraBusquedaYapo, DashboardQuadrants, YapoReels, TopProfessionalsByCategory.
- **Transiciones** cortas (duration-75, active:scale) para feedback táctil.
- **Safe areas**: `env(safe-area-inset-top/bottom)` en header y ActionBar.

### 4.2 Mejoras sugeridas

1. **Jerarquía tipográfica**  
   - Muchos títulos en `text-sm font-semibold uppercase`. Diferenciar niveles (h1/h2/h3) y tamaño para secciones principales vs secundarias.

2. **Un único CTA primario por contexto**  
   - En cards de profesionales, "Ver perfil" como enlace principal está bien. En Home, el CTA rojo "Ir a Billetera" compite con otros bloques; considerar un solo CTA principal por viewport o por sección.

3. **Estados de carga y error**  
   - Home hace fetch a `/api/adaptive-ui/config` y tiene fallback con `dashboardConfig` local; si el fetch falla, el usuario ve contenido pero no hay mensaje explícito. Considerar skeleton o mensaje sutil ("Usando configuración por defecto") en caso de error.

---

## 5. Flujos críticos

### 5.1 Encontrar un profesional y contactar

- **Ruta**: Home → Profesionales por área → elegir categoría → (opcional) filtrar por oficio → tocar card → `/profesionales/[id]` → Contactar → `/chat?to=id` o Ver en el mapa → `/mapa`.  
- **Valoración**: Flujo cerrado, con cantidad por oficio y estrellas por profesional; "Ver perfil" y "Contactar" llevan a acciones concretas.  
- **Mejora**: En `/profesionales/[id]`, el botón "Contactar" podría mostrar un estado "Enviado" o redirigir a chat con un mensaje predefinido para reducir incertidumbre.

### 5.2 Primer uso (landing → registro/inicio)

- **Ruta**: `/` → enlace manual a `/home`. No hay onboarding ni explicación de valor.  
- **Recomendación**: Landing con valor propuesto + "Entrar" / "Registrarme" y redirección automática de `/` a `/home` o a esta landing.

### 5.3 Billetera y escudos

- Acceso desde Chips, QuickActionBar, ActionBar y CTA final. Múltiples entradas son válidas; conviene no duplicar el mismo texto/acción en la misma pantalla (ver sección 2.3).

### 5.4 Perfil

- Perfil propio (`/profile`) muy completo (datos, rating, planes, escudos, curriculum, videos, etc.). Buena para poder gestionar todo; riesgo de longitud. Considerar pestañas o secciones colapsables para "Datos", "Planes", "Videos", etc.

---

## 6. Accesibilidad y patrones

### 6.1 Puntos fuertes

- **Zonas táctiles**: min-h 44–48px en ActionBar, cuadrantes (88px), chips y botones principales.
- **aria-label** y **aria-current** en navegación; **aria-expanded** en acordeones/chips; **role="navigation"`, `role="main"`, `role="list"`.
- **Contraste**: fondo azul oscuro en header con texto blanco; botones rojos/azules sobre fondos claros.
- **Idioma**: `lang="es"` en `<html>`.

### 6.2 Mejoras

- Revisar contraste de texto secundario (`text-yapo-blue/70`, `text-foreground/70`) respecto a WCAG 2.1 AA.
- En carruseles (Reels, YapoCardFeed), indicar que hay más contenido (scroll horizontal) para teclado y lectores de pantalla (aria-label o texto "Deslizá para ver más").
- Formularios (login, registro): asegurar labels asociados a inputs y mensajes de error anunciados (aria-live o role="alert").

---

## 7. Métricas y objetivos UX sugeridos

| Métrica | Objetivo | Cómo apoyarlo en la UI |
|--------|----------|-------------------------|
| **Task Success Rate (TSR)** | >90% completan perfil / tarea clave | Progress bar en perfil, mensajes claros de "Guardado", menos pasos en flujos críticos. |
| **Time on Task** | Reducir tiempo para encontrar profesional | Filtros por proximidad, Reels predictivos, chips por oficio con cantidad. |
| **Retention** | Usuario vuelve al día siguiente | Notificaciones, Reels relevantes, recordatorios desde Cerebro/escudos. |
| **Fricción** | Menos clics para contactar | Un clic desde card → perfil → Contactar (ya implementado). |

---

## 8. Recomendaciones priorizadas

### Alta prioridad

1. **Landing raíz**: Redirigir `/` a `/home` o a una landing con valor propuesto y CTAs claros.  
2. **Unificar etiqueta e icono** de "Mapa" / "Buscar" entre ActionBar y menú.  
3. **Reducir redundancia** en Home: un solo CTA principal a Billetera o diferenciar claramente chips vs bloque final.

### Media prioridad

4. **Agrupar y jerarquizar** secciones del Home (agrupación visual, un solo "primer plano" por viewport).  
5. **Microcopy** más orientado a acción/beneficio en títulos de sección.  
6. **Perfil**: pestañas o acordeones para secciones largas.

### Baja prioridad

7. **Estados de carga/error** explícitos cuando falla la config adaptativa.  
8. **Accesibilidad**: revisión de contraste y anuncios en formularios y carruseles.

---

## 9. Conclusión

La plataforma tiene una **base sólida**: navegación predecible, UI adaptativa por rol, flujo de profesionales y contacto bien resuelto, y buenas prácticas táctiles y de accesibilidad. Las mejoras más impactantes son: **clarificar la entrada (landing)**, **unificar nomenclatura y accesos** (Mapa/Buscar, Billetera) y **simplificar la jerarquía del Home** para que "primero lo esencial" sea evidente sin sensación de ruido. Priorizando estas acciones se reduce la fricción percibida y se alinea mejor la experiencia con los objetivos de negocio (TSR, Time on Task, Retention).
