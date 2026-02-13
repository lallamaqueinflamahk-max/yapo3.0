# Reglas de Anonimización — Censo Digital YAPÓ

Criterios para transformar datos identificables (capa **PRIVADA** / PERSONAL) en datos estadísticos (capa **COMERCIALIZABLE** / STATS). La capa COMERCIALIZABLE contiene solo agregados anonimizados y puede usarse para censo digital, KPIs, sponsors e informes gobierno; **no** incluye datos personales ni identificadores.

---

## 1. Principios

- **No incluir** en STATS: `user_id`, `person_id`, `company_id`, documento, email, teléfono, nombre, coordenadas exactas, ni ningún identificador directo.
- **Generalizar** cuando un valor único o muy escaso permita re-identificación (ej. edad → rango, salario → intervalo, ubicación → región).
- **Suprimir** celdas con conteos muy bajos (regla k-anonimidad) antes de exponer a gobierno o sponsors.
- **Auditar** el pipeline ETL: qué tablas PERSONAL alimentan cada tabla STATS y con qué reglas.

---

## 2. Reglas por tipo de dato

### 2.1 Identificadores

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| `user_id`, `person_id`, `company_id` | **Supresión.** No se copian. | — |
| Documento (cédula, RUC) | **Supresión.** No se copian. | — |
| Email, teléfono | **Supresión.** No se copian. | — |

### 2.2 Datos demográficos y de perfil

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| Fecha de nacimiento / edad | **Generalización a rango.** Rangos de 5 o 10 años (ej. 18–24, 25–34, 35–44, 45+). | `birth_date` → `age_range`: "25-34" |
| Género | **Agregación.** Solo totales por categoría (masculino/femenino/otro/no especificado); suprimir si el conteo en una celda &lt; k. | Conteo por `gender_aggregate` |
| Dirección exacta | **Supresión.** No se copia. | — |
| Región / ciudad | **Generalización.** Usar solo códigos oficiales (departamento, distrito) o agrupaciones amplias. | `address_city` → `region_code`: "11" (Central) |

### 2.3 Territorio y GPS

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| `lat`, `lng` exactos | **Supresión.** No se copian. | — |
| Ubicación | **Generalización.** Solo `region_code` (departamento o zona oficial). Opcional: grid de celdas grandes (ej. 10 km) con conteos. | Conteo por `region_code` |
| Territorio (id de zona interna) | **Aceptable** si es zona amplia y no permite inferir domicilio. Si es muy granular, usar solo región. | `territory_id` → `region_code` |

### 2.4 Actividad laboral y económica

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| Montos (wallet, transacciones) | **Generalización a intervalos.** Rangos (ej. 0–100, 100–500, 500–1000, 1000+). No exportar montos exactos. | `amount` → `volume_bucket`: "100-500" |
| Salario (si existiera) | **Rangos.** Igual que montos; nunca valor exacto. | — |
| Nombre de oferta / empresa en evento | **Supresión.** En STATS solo sector, región, tipo de contrato. | — |
| Fechas exactas | **Generalización a período.** Mes, trimestre, año. | `created_at` → `period`: "2024-01" |

### 2.5 Formación y certificaciones

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| Nombre de institución / certificación | **Supresión o categoría.** Solo nivel (primaria, secundaria, terciaria, curso, certificación) o tipo genérico. | `level` → "terciaria"; `certification_type` → "oficio" |
| Año exacto | **Rango o período.** Ej. "2020-2024". | — |

### 2.6 Uso de plataforma

| Dato en PERSONAL | Acción en STATS | Ejemplo |
|------------------|-----------------|---------|
| `user_id` en evento | **Supresión.** No se copia. | — |
| `screen`, `event_type` | **Agregación.** Conteos por tipo de evento, pantalla, período, región (generalizada). | Conteo por `event_type`, `region_code`, `period` |
| Timestamp | **Período.** Día, semana o mes. | `created_at` → `date` o `period` |

---

## 3. K-anonimidad en tablas STATS

- **Objetivo:** En cualquier fila expuesta (dashboard, exportación gobierno/sponsors), cada combinación de atributos quasi-identificadores (región, sector, rango etario, período) debe aparecer para **al menos k** individuos (ej. k = 5).
- **Regla:** Si una celda (combinación región + período + sector + …) tiene conteo &lt; k, **suprimir** la celda o fusionar con otra categoría (ej. "Otros") hasta alcanzar k.
- **Parámetro k:** Definir por política (ej. k = 5 para reportes internos, k = 10 para gobierno). Documentar en catálogo de datos.

---

## 4. Pipeline ETL y trazabilidad

- **Origen:** Cada tabla/vista en STATS debe tener documentado: tabla(s) PERSONAL de origen, regla de agregación/generalización, frecuencia de actualización.
- **No reversible:** El proceso PERSONAL → STATS no debe permitir reconstruir individuos. No guardar en STATS hashes de `user_id` que permitan cruzar con PERSONAL en otro sistema.
- **Logs de ETL:** Registrar ejecución del job (fecha, filas leídas, filas escritas, errores) sin incluir datos personales en los logs.

---

## 5. Resumen

| Acción | Cuándo aplicar |
|--------|-----------------|
| **Supresión** | Identificadores, contacto, dirección exacta, coordenadas, nombres. |
| **Generalización** | Edad → rangos; ubicación → región; montos → intervalos; fechas → período. |
| **Agregación** | Conteos, sumas, promedios por categorías generalizadas. |
| **K-anonimidad** | Suprimir o agrupar celdas con conteo &lt; k antes de exponer. |

Documentos relacionados: `MODELO-DATOS-CENSO-DIGITAL.md`, `ESQUEMAS-SQL-NOSQL-Y-EXPORT.md`.
