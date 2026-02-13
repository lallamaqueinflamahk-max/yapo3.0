# Base de conocimiento YAPÓ (JSON)

Base estructurada para que el Cerebro pueda:

- **Responder preguntas** sobre la plataforma (qué es YAPÓ, roles, escudos, categorías).
- **Guiar al usuario** a la pantalla correcta (`screen` en cada entrada).
- **Sugerir acciones** según contexto (`suggestedActions`, `context` en acciones).

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `platform.json` | Qué es YAPÓ (descripción, keywords, pantalla, acciones sugeridas). |
| `roles.json` | Valé, Capeto, Kavaju, Mbareté: descripción, funciones, pantalla. |
| `escudos.json` | Insurtech, Fintech, Regalos, Comunidad. |
| `categories.json` | Categorías laborales y subcategorías. |
| `actions.json` | Acciones posibles en la app (label, pantalla, context, roleRequired). |

## Schema para reemplazo por OpenAI

Cada entrada debe poder mapearse a:

- `id`, `type`, `keywords[]`
- `content` (o equivalente: texto para responder).
- `screen` (ruta a la que guiar).
- `suggestedActions[]` (acciones a sugerir).

El loader (`load.ts`) expone `searchKnowledgeBase(query)`, `getScreenForQuery(query)` y `getSuggestedActionsForQuery(query)`. Una API o respuesta de OpenAI puede devolver el mismo tipo `KnowledgeSearchResult[]` para reemplazar la búsqueda local sin cambiar el Cerebro.
