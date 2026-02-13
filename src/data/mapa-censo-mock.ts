/**
 * Datos mock de censo/estadísticas por barrio para las funcionalidades de búsqueda.
 * Base de datos de sentido: trabajadores por rubro, desempleados, zonas rojas, capacitación, desempeño.
 * Verde = bueno, Amarillo = medio, Rojo = prioridad/alerta.
 */

import type { MetricTypeCenso } from "./mapa-funcionalidades-busqueda";

export type EstadoSemaforo = "green" | "yellow" | "red";

export interface ZonaCensoItem {
  barrioId: string;
  barrioNombre: string;
  ciudad: string;
  departamento: string;
  state: EstadoSemaforo;
  valor?: number;
  label?: string;
}

/** Mock: estado por barrio para cada tipo de métrica (sin filtro rubro). */
const MOCK_ESTADO_POR_BARRIO: Record<string, EstadoSemaforo> = {
  "asuncion-botanic": "green",
  "asuncion-sajonia": "yellow",
  "asuncion-loma-pyta": "yellow",
  "asuncion-villa-morra": "green",
  "asuncion-carmelitas": "green",
  "asuncion-san-pablo": "yellow",
  "asuncion-recoleta": "green",
  "asuncion-centro": "green",
  "lambare-centro": "green",
  "lambare-tycua": "yellow",
  "lambare-santa-ana": "green",
  "lambare-zona-sur": "red",
  "fdm-centro": "yellow",
  "fdm-santa-rosa": "green",
  "fdm-san-miguel": "green",
  "fdm-villa-del-rosario": "yellow",
  "fdm-zona-norte": "red",
  "luque-centro": "green",
  "luque-viñas-cue": "yellow",
  "luque-santani": "green",
  "sanlorenzo-centro": "green",
  "sanlorenzo-ñemby": "yellow",
  "cde-centro": "green",
  "cde-monday": "green",
  "minga-centro": "green",
  "enc-centro": "yellow",
  "enc-san-isidro": "green",
  "camb-centro": "yellow",
  "paraguari-centro": "yellow",
  "fil-centro": "red",
};

/** Nombres de barrio y ciudad por barrioId (para labels en respuesta). */
const BARRIO_INFO: Record<string, { barrioNombre: string; ciudad: string; departamento: string }> = {
  "asuncion-botanic": { barrioNombre: "Botánico", ciudad: "Asunción", departamento: "Central" },
  "asuncion-sajonia": { barrioNombre: "Sajonia", ciudad: "Asunción", departamento: "Central" },
  "asuncion-loma-pyta": { barrioNombre: "Loma Pytã", ciudad: "Asunción", departamento: "Central" },
  "asuncion-villa-morra": { barrioNombre: "Villa Morra", ciudad: "Asunción", departamento: "Central" },
  "asuncion-carmelitas": { barrioNombre: "Carmelitas", ciudad: "Asunción", departamento: "Central" },
  "asuncion-san-pablo": { barrioNombre: "San Pablo", ciudad: "Asunción", departamento: "Central" },
  "asuncion-recoleta": { barrioNombre: "Recoleta", ciudad: "Asunción", departamento: "Central" },
  "asuncion-centro": { barrioNombre: "Centro", ciudad: "Asunción", departamento: "Central" },
  "lambare-centro": { barrioNombre: "Centro", ciudad: "Lambaré", departamento: "Central" },
  "lambare-tycua": { barrioNombre: "Tycua", ciudad: "Lambaré", departamento: "Central" },
  "lambare-santa-ana": { barrioNombre: "Santa Ana", ciudad: "Lambaré", departamento: "Central" },
  "lambare-zona-sur": { barrioNombre: "Zona Sur", ciudad: "Lambaré", departamento: "Central" },
  "fdm-centro": { barrioNombre: "Centro", ciudad: "Fernando de la Mora", departamento: "Central" },
  "fdm-santa-rosa": { barrioNombre: "Santa Rosa", ciudad: "Fernando de la Mora", departamento: "Central" },
  "fdm-san-miguel": { barrioNombre: "San Miguel", ciudad: "Fernando de la Mora", departamento: "Central" },
  "fdm-villa-del-rosario": { barrioNombre: "Villa del Rosario", ciudad: "Fernando de la Mora", departamento: "Central" },
  "fdm-zona-norte": { barrioNombre: "Zona Norte", ciudad: "Fernando de la Mora", departamento: "Central" },
  "luque-centro": { barrioNombre: "Centro", ciudad: "Luque", departamento: "Central" },
  "luque-viñas-cue": { barrioNombre: "Viñas Cué", ciudad: "Luque", departamento: "Central" },
  "luque-santani": { barrioNombre: "Santani", ciudad: "Luque", departamento: "Central" },
  "sanlorenzo-centro": { barrioNombre: "Centro", ciudad: "San Lorenzo", departamento: "Central" },
  "sanlorenzo-ñemby": { barrioNombre: "Ñemby", ciudad: "San Lorenzo", departamento: "Central" },
  "cde-centro": { barrioNombre: "Centro", ciudad: "Ciudad del Este", departamento: "Alto Paraná" },
  "cde-monday": { barrioNombre: "Monday", ciudad: "Ciudad del Este", departamento: "Alto Paraná" },
  "minga-centro": { barrioNombre: "Centro", ciudad: "Minga Guazú", departamento: "Alto Paraná" },
  "enc-centro": { barrioNombre: "Centro", ciudad: "Encarnación", departamento: "Itapúa" },
  "enc-san-isidro": { barrioNombre: "San Isidro", ciudad: "Encarnación", departamento: "Itapúa" },
  "camb-centro": { barrioNombre: "Centro", ciudad: "Cambyretá", departamento: "Itapúa" },
  "paraguari-centro": { barrioNombre: "Centro", ciudad: "Paraguarí", departamento: "Paraguarí" },
  "fil-centro": { barrioNombre: "Centro", ciudad: "Filadelfia", departamento: "Boquerón" },
};

const BARRIO_IDS = Object.keys(MOCK_ESTADO_POR_BARRIO);

/**
 * Genera datos de censo por barrio para una métrica.
 * Con rubro opcional: varía ligeramente el estado por barrio según rubro (mock).
 */
export function getZonasCensoMock(
  metricType: MetricTypeCenso,
  rubro?: string | null
): ZonaCensoItem[] {
  return BARRIO_IDS.map((barrioId) => {
    let state = MOCK_ESTADO_POR_BARRIO[barrioId] ?? "yellow";
    const conRubro = metricType === "trabajadores_por_rubro" || metricType === "desempleados_por_rubro" || metricType === "demanda_por_rubro" || metricType === "densidad_profesionales" || metricType === "profesionales_verificados_rubro";
    if (rubro && conRubro) {
      const hash = (barrioId + rubro).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      if (hash % 3 === 0) state = "green";
      else if (hash % 3 === 1) state = "yellow";
      else state = "red";
    }
    const info = BARRIO_INFO[barrioId] ?? { barrioNombre: barrioId, ciudad: "-", departamento: "-" };
    const valor = state === "green" ? 80 + Math.floor(Math.random() * 20) : state === "yellow" ? 40 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 40);
    return {
      barrioId,
      barrioNombre: info.barrioNombre,
      ciudad: info.ciudad,
      departamento: info.departamento,
      state,
      valor,
      label: rubro ? `${info.barrioNombre} (${rubro})` : info.barrioNombre,
    };
  });
}
