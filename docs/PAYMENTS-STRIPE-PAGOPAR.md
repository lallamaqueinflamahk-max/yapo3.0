# Integración de pagos: Stripe y Pagopar

**Objetivo:** Plataforma con pagos funcionales (Stripe para USD/global, Pagopar para Paraguay), validaciones, idempotencia y UX segura.

---

## 1. Arquitectura

```
Cliente (Wallet / Cargar saldo)
    → POST /api/payments/create-intent { amountCents, currency, provider }
    ← { checkoutUrl } o { clientSecret }
    → Redirección a Stripe Checkout o Pagopar
Usuario paga en la página del proveedor
    → Proveedor envía webhook a /api/webhooks/stripe o /api/webhooks/pagopar
    → Verificación de firma → Idempotencia (PaymentWebhookEvent) → credit(userId, amount, reason)
    → Wallet acreditada
```

- **Idempotencia:** Cada evento de webhook se guarda por `(provider, externalId)`. Si llega dos veces, no se acredita de nuevo.
- **Validación:** Monto mínimo/máximo, moneda (PYG, USD), sesión obligatoria en create-intent.
- **Errores:** Respuestas JSON con `error` y opcionalmente `code` (PAYMENT_CREATE_FAILED, PAYMENT_ERROR).

---

## 2. Stripe

### 2.1 Configuración

- **Variables de entorno:** `STRIPE_SECRET_KEY` (sk_...), `STRIPE_WEBHOOK_SECRET` (whsec_...).
- **Checkout:** Se usa Stripe Checkout (hosted). create-intent devuelve `checkoutUrl` para redirigir al usuario.
- **Webhook:** En el Dashboard de Stripe, configurar la URL (ej. `https://tu-dominio.com/api/webhooks/stripe`) y el evento `checkout.session.completed`. Copiar el signing secret a `STRIPE_WEBHOOK_SECRET`.

### 2.2 Requisitos legales (USA / LLC)

Para operar con Stripe desde USA como LLC:

- **Cuenta Stripe USA:** La empresa debe estar registrada en USA; dirección física (no solo PO Box) donde se realiza la actividad.
- **Verificación 2024:**
  - Entidad legal: nombre, tipo (LLC, Sole Prop, etc.), EIN, dirección del negocio.
  - Representante: email, últimos 4 dígitos del SSN/ITIN en onboarding; para dueños, al superar cierto volumen (~$500K) pueden pedir últimos 4 del SSN.
  - Sole props y LLC de un solo miembro: deben indicar dirección del negocio.
- **Documentos aceptados:** [Stripe – Acceptable verification documents (US)](https://docs.stripe.com/acceptable-documentation/verification-documents?country=US).
- **Plazos:** Cuentas nuevas deben cumplir desde el onboarding. Cuentas existentes (antes de marzo 2024) tienen plazos hasta septiembre 2024 para actualizar datos.

Referencia: [Stripe Help – US verification requirements](https://support.stripe.com/questions/2024-updates-to-us-verification-requirements-faq).

### 2.3 Flujo técnico

1. **Crear intención:** `POST /api/payments/create-intent` con `provider: "stripe"`, `amountCents`, `currency` (ej. "usd"). Respuesta: `checkoutUrl`.
2. **Redirigir** al usuario a `checkoutUrl`. Tras el pago, Stripe redirige a `success_url` (ej. `/wallet?payment=success`) o `cancel_url`.
3. **Webhook:** Stripe envía `checkout.session.completed`; se verifica la firma, se comprueba idempotencia y se llama a `credit(userId, amountUnits, reason)`.

---

## 3. Pagopar (Paraguay)

### 3.1 Configuración

- **Variables de entorno:** `PAGOPAR_API_KEY`, opcionalmente `PAGOPAR_API_URL` y `PAGOPAR_WEBHOOK_SECRET`.
- **Documentación API:** [Soporte Pagopar – API integración medios de pago](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos).
- **Medios:** Tarjetas, transferencias, billeteras (Tigo Money, Personal Pay, etc.), bocas de cobranza, QR. Tarifa típica ~5,5% + IVA.

### 3.2 Integración en código

- **Crear pago:** En `src/lib/payments/pagopar.ts`, `createPaymentIntent` está preparado para llamar a la API de Pagopar. Ajustar `PAGOPAR_API_URL` y el cuerpo de la petición según la documentación oficial cuando se tengan credenciales.
- **Webhook:** `POST /api/webhooks/pagopar` recibe la notificación, opcionalmente verifica firma (`PAGOPAR_WEBHOOK_SECRET`) y parsea el body. El parser actual asume campos como `status`, `reference`/`user_id`, `amount`/`monto`; adaptar a la respuesta real de Pagopar.
- **Compatibilidad Paraguay:** Moneda PYG; montos en guaraníes. La wallet interna (Prisma) usa `balance` en unidades; al acreditar desde Pagopar usar la misma unidad (ej. guaraníes) o convertir si el webhook envía en otra unidad.

### 3.3 Flujo técnico

1. **Crear intención:** `POST /api/payments/create-intent` con `provider: "pagopar"`, `amountCents` (o monto en guaraníes según convención), `currency: "PYG"`. Respuesta: `checkoutUrl` (o el equivalente de Pagopar).
2. **Redirigir** al usuario a la URL de pago de Pagopar. Retorno vía URL de éxito/cancelación configurada en la petición.
3. **Webhook:** Pagopar notifica a `/api/webhooks/pagopar`; verificar firma si existe, idempotencia por `externalId`, y `credit(userId, amountUnits, reason)`.

---

## 4. UX y manejo de errores

- **Cargar saldo:** Botón o pantalla "Cargar saldo" que pide monto (y opcionalmente proveedor). Al confirmar se llama a create-intent; si hay `checkoutUrl` se redirige; si hay `error` se muestra en pantalla (mensaje amigable y opción de reintentar).
- **Retorno tras pago:** En `success_url` (ej. `/wallet?payment=success`) mostrar mensaje de éxito y refrescar saldo. En `cancel_url` mostrar "Pago cancelado" sin error grave.
- **Errores de API:** Códigos 400 (validación, PAYMENT_CREATE_FAILED), 401 (no autenticado), 503 (proveedor no configurado). Siempre devolver `{ error: string, code?: string }` para que el cliente muestre un mensaje claro.
- **Validaciones:** Monto mínimo 100 unidades, máximo 100.000.000; moneda PYG o USD; usuario debe estar logueado.

---

## 5. Archivos

| Archivo | Función |
|---------|---------|
| `prisma/schema.prisma` | Modelo `PaymentWebhookEvent` (idempotencia). |
| `src/lib/payments/types.ts` | Tipos (CreateIntentParams, WebhookResult, etc.). |
| `src/lib/payments/validate.ts` | validateAmountCents, validateCurrency, validateUserId. |
| `src/lib/payments/idempotency.ts` | getWebhookEvent, recordWebhookEvent. |
| `src/lib/payments/stripe.ts` | createCheckoutSession, verifyStripeWebhook, parseStripePaymentEvent. |
| `src/lib/payments/pagopar.ts` | createPaymentIntent, verifyPagoparWebhook, parsePagoparWebhook. |
| `src/app/api/payments/create-intent/route.ts` | POST create-intent (auth, validación, Stripe o Pagopar). |
| `src/app/api/webhooks/stripe/route.ts` | POST webhook Stripe → credit wallet. |
| `src/app/api/webhooks/pagopar/route.ts` | POST webhook Pagopar → credit wallet. |

---

## 6. Despliegue

- **Webhooks:** Las URLs de webhook deben ser HTTPS y accesibles por Stripe/Pagopar. En desarrollo se puede usar Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) para probar.
- **Secretos:** Nunca commitear `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAGOPAR_API_KEY`. Configurarlos en el panel de Vercel (o el host) como variables de entorno.
- **Migración:** Ejecutar `npx prisma migrate dev` para crear la tabla `PaymentWebhookEvent` antes de recibir webhooks.
