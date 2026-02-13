# Estructura de UI y orden de visualización/comandos

Documento de referencia: orden de pantallas, secciones, chips y respuestas según especificación.

---

## 1. Home (`/home`) – Orden de visualización (arriba → abajo)

| # | Sección | Descripción | Interacción |
|---|---------|-------------|-------------|
| 1 | **Hero** | YAPÓ, tagline, rol, "Tocá cualquier chip o botón" | — |
| 2 | **Chips del Cerebro** | CerebroChips: intención (buscar, navegar, más opciones) | Tap → decide() → navegación o búsqueda |
| 3 | **Acciones por rol** | RoleBubbleChips (Valé, Capeto, Kavaju, Mbareté) | Tap → runWithIntent → mensaje + navegación |
| 4 | **Categorías y escudos** | BubbleChipsDynamic: oficios, movilidad, cuidados, profesional, escudos | Tabs + chips; tap → intent → resultado |
| 5 | **Top 20 profesionales por área** | Por categoría: oficios, movilidad, cuidados, profesional | Expandir "Ver los 20" por área |
| 6 | **Comunidad (apartado especial)** | Descripción + botón "Ir a Comunidad" | Link a /comunidad (interacciones, validación, ranking, referidos) |
| 7 | **Funciones disponibles** | Lista de qué podés hacer en la app | Solo lectura; visibilidad de todas las funciones |
| 8 | **Accesos rápidos** | Billetera, Cerebro, Chat, Perfil, Panel | Links a rutas |
| 9 | **Semáforo territorial** | (Si rol laboral) TerritorySemaphore | Solo lectura / según rol |
| 10 | **CTA Billetera** | Botón "Ir a Billetera" | Link a /wallet |

Origen en código: `src/data/ui-order.ts` → `HOME_SECTION_ORDER`.

---

## 2. Barra Cerebro (`/cerebro`) – Orden de chips (izq → der)

Cada chip emite un intent; el Cerebro responde con mensaje y/o navegación.

| # | Chip | Intent | Respuesta / interacción |
|---|------|--------|-------------------------|
| 1 | Mi billetera | wallet_view | Mensaje + navegación a /wallet |
| 2 | Transferir | wallet_transfer | Guard/validación + /wallet |
| 3 | Subsidios | wallet_subsidy | Mensaje + /wallet (subsidios) |
| 4 | Activar escudo | escudo_activate | Mensaje escudos + /wallet |
| 5 | Mensajes | navigate.chat | Navegación a /chat |
| 6 | Mi perfil | navigate.profile | Navegación a /profile |
| 7 | Inicio | navigate.home | Navegación a /home |
| 8 | Territorio | navigate.territory | Navegación a /dashboard (según rol) |

Origen: `src/lib/ai/knowledge/cerebro-mock-chips.ts` → `MOCK_INTENT_CHIPS`. Orden de referencia en `src/data/ui-order.ts` → `CEREBRO_BAR_CHIPS_ORDER`.

---

## 3. Los 4 escudos – Nombres y orden

Nombres oficiales (README §4, en toda la UI):

1. **Insurtech** (id: insurtech) – Salud, farmacias y clínicas; cobertura.
2. **Fintech** (id: fintech) – Pagos, ahorro y gestión financiera segura.
3. **Regalos** (id: regalos) – Beneficios, premios y reconocimientos laborales.
4. **Comunidad** (id: comunidad) – Red laboral, validación de desempeño, ranking y referidos (apartado especial).

Orden de visualización en chips y listas: **Insurtech → Fintech → Regalos → Comunidad**.

Origen: `src/features/escudos/config.ts` → `ESCUDOS_CONFIG`, `ESCUDO_IDS`. Datos chips: `src/data/bubble-chips-dynamic.ts` y `src/data/category-chips.ts`.

---

## 4. Categorías (BubbleChipsDynamic)

Orden de pestañas y bloques: **Oficios → Movilidad → Cuidados → Profesional → Escudos**.

Origen: `src/data/bubble-chips-dynamic.ts` → `CATEGORY_FILTER_ORDER`.

---

## 5. Resumen

- **Home:** respetar `HOME_SECTION_ORDER` al renderizar secciones.
- **CerebroBar:** respetar orden de `MOCK_INTENT_CHIPS` (alineado a `CEREBRO_BAR_CHIPS_ORDER`).
- **Escudos:** usar siempre los 4 nombres (Insurtech, Fintech, Regalos, Comunidad) y el orden anterior.
- **Categorías:** oficios, movilidad, cuidados, profesional, escudos.

Cambios de orden o nombres deben actualizarse en `src/data/ui-order.ts`, en la config de escudos y en los mocks de chips, para mantener una sola fuente de verdad.
