# Política de Privacidad Base y Consentimientos — YAPÓ

Documento de referencia para implementación legal. Ajustar con asesoría jurídica antes de publicación oficial.

---

## 1. Política de privacidad (esqueleto)

### 1.1 Responsable del tratamiento

- Nombre o razón social de la entidad que opera YAPÓ.
- Domicilio y contacto (email de privacidad / DPO si aplica).
- Referencia a normativa aplicable (Ley de Protección de Datos Personales, etc.).

### 1.2 Datos que recabamos

| Origen / capa | Datos | Finalidad |
|---------------|--------|-----------|
| Uso sin cuenta | Ninguno que identifique a una persona; opcionalmente cookies técnicas. | Navegación y preferencias básicas. |
| Inicio de sesión social | Nombre, email, foto de perfil (según lo que autorices al conectar). | Crear y gestionar tu cuenta. |
| Perfil y verificación | Teléfono, dirección, documento de identidad, resultado de verificación biométrica (no la biometría en crudo). | Verificar identidad y habilitar servicios sensibles. |
| Uso de la app | Actividad en wallet, ofertas, chat, ubicación (si autorizas). | Prestación del servicio y mejora (con datos anonimizados). |

### 1.3 Finalidad y base legal

- Prestación del servicio: ejecución del contrato / consentimiento.
- Verificación de identidad y prevención de fraude: obligación legal y legítimo interés dentro del marco normativo.
- Comunicaciones y marketing: solo con consentimiento.
- Estadísticas y mejora del producto: datos anonimizados; cuando haya datos identificables, con consentimiento.

### 1.4 Conservación

- Los datos personales se conservan mientras sea necesario para las finalidades indicadas y para cumplir obligaciones legales.
- Política de retención por categoría (identidad, wallet, chat, etc.) documentada internamente; el usuario puede solicitar eliminación dentro del marco legal.

### 1.5 Derechos

- Acceso, rectificación, supresión, limitación del tratamiento, portabilidad, oposición.
- Ejercicio: mediante sección en la app (perfil / privacidad) o email de contacto.
- Reclamación ante autoridad de control de datos personales.

### 1.6 Transferencias y terceros

- Si se usan servicios en la nube o proveedores fuera del país, indicar garantías (cláusulas tipo, certificaciones).
- No se venden datos personales; reportes a PyME/Enterprise/Gobierno según consentimiento y bajo propósito limitado o anonimización.

### 1.7 Cookies y tecnologías similares

- Cookies técnicas: necesarias para el funcionamiento (sesión, preferencias).
- Cookies analíticas: solo con consentimiento.
- Enlace o sección para gestionar preferencias de cookies.

---

## 2. Textos de consentimiento por tipo

Usar estos textos (o versiones aprobadas legalmente) en los flujos de la app; registrar versión y timestamp al otorgar.

### 2.1 Cookies técnicas

> "YAPÓ usa cookies técnicas para que la app funcione correctamente (sesión e idioma). No requieren tu consentimiento; puedes bloquearlas desde tu navegador si lo deseas."

### 2.2 Login social (Google / Facebook / Instagram)

> "Al continuar con [Google / Facebook / Instagram], YAPÓ recibirá tu nombre, correo y foto de perfil para crear tu cuenta. Solo guardamos estos datos si aceptas. Puedes revocar el acceso desde la configuración de tu cuenta o desde la configuración de la red social."

### 2.3 Datos de perfil

> "Guardaremos los datos que ingreses en tu perfil (teléfono, dirección, etc.) para ofrecerte un mejor servicio y contactarte cuando sea necesario. Puedes actualizarlos o pedir su eliminación en cualquier momento."

### 2.4 Biometría

> "Usamos tu rostro [y/o huella] únicamente para verificar que eres tú y así proteger operaciones sensibles. No guardamos la imagen ni la huella; solo el resultado de la verificación. Es necesario para usar funciones como transferencias o contratos."

### 2.5 Datos territoriales (ubicación)

> "Usamos tu ubicación para mostrarte ofertas y servicios cercanos y el estado del semáforo en tu zona. Puedes desactivar el acceso a la ubicación en cualquier momento desde la configuración del dispositivo o de la app."

### 2.6 Uso de IA (Cerebro)

> "El asistente de YAPÓ (Cerebro) procesa tus consultas para guiarte dentro de la app. Las conversaciones pueden usarse de forma anonimizada para mejorar el servicio. Puedes revocar este consentimiento en Configuración > Privacidad."

### 2.7 Comunicaciones (emails / notificaciones)

> "Podemos enviarte correos y notificaciones sobre tu cuenta, ofertas y novedades del servicio. Puedes darte de baja en cualquier momento desde el enlace en los correos o en Configuración."

### 2.8 Reportes para PyME / Enterprise

> "Tus datos laborales podrán incluirse en reportes para tu empleador o la empresa con la que tienes relación, según tu contrato y esta autorización. Solo se comparte lo necesario para ese propósito."

### 2.9 Reportes para Gobierno

> "Podemos incluir datos anonimizados (sin identificar a personas) en estadísticas para entes públicos, con el fin de políticas de empleo y formalización. No se comparte tu identidad."

---

## 3. Registro de consentimientos (implementación)

- Cada consentimiento debe guardarse con: `userId`, `consentType`, `granted` (true/false), `timestamp`, `consentVersion`.
- Antes de guardar cualquier dato personal, el sistema debe comprobar que existe consentimiento activo para el tipo correspondiente.
- La revocación se registra con `granted: false`; a partir de ese momento no se deben guardar nuevos datos bajo ese tipo y se aplica la política de retención/eliminación según corresponda.

Referencia técnica: `src/lib/compliance/consent.service.ts` y tipos en `compliance.types.ts`; ampliar `ConsentType` según los tipos anteriores.
