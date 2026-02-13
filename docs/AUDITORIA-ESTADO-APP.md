# Auditoría: qué funciona y qué no (YAPÓ Starter)

## Errores corregidos en esta sesión

1. **`getBiometricValidatedForContext is not defined`**  
   - **Causa:** `cerebroEngine.ts` usaba la función sin importarla.  
   - **Fix:** Import desde `@/lib/security/biometrics`.  
   - Los chips (roles, categorías, etc.) deberían responder sin ese ReferenceError.

2. **`React is not defined` en BubbleChipsDynamic**  
   - **Causa:** Uso de `React.useState` sin importar React.  
   - **Fix:** Uso de `useState` (ya importado desde `react`).

3. **Cerebro: solo placeholder, sin barra ni micrófono**  
   - **Causa:** `/cerebro` renderizaba una página placeholder.  
   - **Fix:** La ruta `/cerebro` ahora usa el componente `CerebroBar` (barra de entrada + micrófono + historial).

4. **Selector de roles: texto en blanco, no se ve**  
   - **Causa:** Clases `text-foreground` sin definir en el tema.  
   - **Fix:** Uso de `text-gray-900` en el `<select>` y en las opciones para que el desplegable sea legible.

---

## Estado actual por pantalla

| Ruta        | Estado        | Notas |
|------------|----------------|------|
| **/**      | OK             | Página simple "YAPÓ LOCAL OK" (o redirige a /home según flujo). |
| **/home**  | OK             | Home con chips, accesos rápidos, CerebroChips, RoleBubbleChips, BubbleChipsDynamic. Tras los fixes, los chips deberían ejecutar `handleCerebroResult` y navegar. |
| **/cerebro** | OK (corregido) | Muestra **CerebroBar** (barra con input + micrófono + historial). |
| **/chat**  | Placeholder    | Solo título "Chat – Placeholder". Existe `ChatLayout` en componentes pero no está montado en esta ruta. |
| **/wallet**| Placeholder    | Solo título "Wallet – Placeholder". Existe `WalletUI` pero no está montado aquí. |
| **/profile** | Placeholder  | Solo título "Perfil – Placeholder". Falta montar la UI de perfil real. |
| **/dashboard** | Placeholder | Solo placeholder. |

---

## Lo que sí funciona

- Servidor Next.js en localhost.
- Layout global: Header (YAPÓ + selector de rol), ActionBar (navegación abajo), contenido central.
- Auth en SAFE MODE (sesión mock, selector de rol en header).
- **Home:** chips del Cerebro (CerebroChips, RoleBubbleChips, BubbleChipsDynamic) que llaman a `runWithIntent` / `handleCerebroResult`.
- **Cerebro:** barra de búsqueda con input y micrófono (CerebroBar).
- Ruta de auth envuelta para devolver JSON en errores (evita ClientFetchError).
- Rutas de wallet unificadas (sin conflicto catch-all).

---

## Lo que sigue siendo placeholder o pendiente

- **Chat:** la ruta `/chat` no usa `ChatLayout`; habría que montar el componente real en `src/app/chat/page.tsx`.
- **Wallet:** la ruta `/wallet` no usa `WalletUI`; habría que montar el componente real en `src/app/wallet/page.tsx`.
- **Perfil:** la ruta `/profile` no usa la UI de perfil; habría que crear/montar el componente real.
- **Dashboard:** igual, solo placeholder.

---

## Cómo hacer que Chat, Wallet y Perfil usen la UI real

- **Chat:** En `src/app/chat/page.tsx`, importar y renderizar `ChatLayout` (o el contenedor que use salas/mensajes).
- **Wallet:** En `src/app/wallet/page.tsx`, importar y renderizar `WalletUI` desde `@/features/wallet/WalletUI`.
- **Perfil:** Crear o localizar el componente de perfil (por ejemplo en `@/components/auth` o `@/features`) y usarlo en `src/app/profile/page.tsx`.

Si quieres, en el siguiente paso se puede conectar solo una de estas (por ejemplo Wallet o Chat) y dejar el resto para después.
