# Disputas y pagos en custodia — algoritmo YAPÓ

## En disputa

- **YAPÓ retiene el fondo** hasta que un mediador revise la evidencia (contrato, fotos).
- Los pagos en custodia **aparecen en el historial** cuando se liberan (mismo flujo que transacciones liberadas).

## Regla del 50% mínimo

- Es **obligatorio** que al menos el **50%** se pague según los hitos acordados.
- Si una parte **no cumple** (ej. no paga la totalidad o no libera según evidencia):
  - Se **sanciona en YAPÓ** (reputación, visibilidad, posible bloqueo).
  - Al afectado se le da **opción de elegir otro trabajo**.
  - **Bonificaciones por cumplimiento de ética profesional**: quien cumple suma puntos/cumplidor % y puede recibir beneficios (visibilidad, prioridad, bonos).

## Flujo técnico

1. Creación de garantía (escrow) con hitos (ej. 50% inicio, 50% finalización).
2. En **disputa**: estado `disputa`; el fondo no se libera hasta resolución del mediador.
3. Mediador revisa contrato y fotos/evidencia; resuelve liberación total, parcial o devolución.
4. Al liberar cada hito, la transacción correspondiente aparece en el **historial** de la billetera (estado "Liberado").
5. Si se constata incumplimiento (ej. no pagar el 50%): aplicación de sanción al incumplidor y opción + bonificación al cumplidor según reglas de reputación.
