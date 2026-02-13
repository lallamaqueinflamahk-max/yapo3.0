/**
 * Textos legales simplificados para transacciones (Escudo YAPÓ, Compromiso de Hierro, Contrato Flash).
 * Ver docs/product/NUCLEO-OPERATIVO-ECOSISTEMA-EJECUCION.md §6.
 * Uso: pantallas de "Aceptar Trabajo", confirmación de cita, verificación de matrícula.
 */

export const TRANSACCION_LEGAL = {
  /** Título al aceptar trabajo (Escudo + Contrato). */
  tituloAceptarTrabajo: "Aceptación del trabajo y condiciones de pago en custodia",

  /** Párrafos para checkbox al "Aceptar Trabajo". */
  aceptarTrabajo: [
    "Al aceptar este trabajo, el monto acordado será descontado de mi billetera YAPÓ y retenido en custodia hasta que se cumplan los hitos de liberación (50% al inicio de obra verificada, 50% al finalizar y calificar).",
    "Recibo un contrato digital con mi identidad y la del profesional, la descripción técnica, el monto final y la garantía técnica según la categoría. No se permite modificar el monto ni la descripción después de aceptar.",
    "Acepto los Términos y Condiciones de YAPÓ y las reglas de resolución de conflictos: en caso de desacuerdo, YAPÓ retendrá el fondo hasta que un mediador resuelva con base en la evidencia (contrato, fotos, mensajes).",
  ],

  /** Label del checkbox al aceptar trabajo. */
  checkboxAceptarTrabajo: "He leído y acepto lo anterior y acepto el contrato digital.",

  /** Texto Compromiso de Hierro (cancelación tardía y Cumplidor). */
  compromisoHierro: "Si cancelo una cita confirmada con menos de 2 horas de antelación, YAPÓ debitará de mi billetera un Token de Irresponsabilidad según la política vigente. Mi índice Cumplidor se calcula por mis citas cumplidas; si baja del 80%, mis anuncios no se mostrarán durante 48 horas.",

  /** Label checkbox al confirmar cita. */
  checkboxConfirmarCita: "Entiendo las reglas de cancelación y del índice Cumplidor.",

  /** Texto uso de identidad y matrícula (Filtro Mbareté). */
  matriculaYIdentidad: "Al cargar mi C.I. y/o matrícula profesional (ANDE, MOPC u otra), autorizo a YAPÓ a verificarlas y mostrarlas en mi perfil y en el contrato digital cuando corresponda. La matrícula puede darme prioridad en búsquedas y permitir tarifas según la política de la plataforma.",
} as const;
