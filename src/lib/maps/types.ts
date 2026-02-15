/**
 * Tipos para el mapa con Google Maps: capas y datos de segmentación.
 */

export interface Coords {
  lat: number;
  lng: number;
}

/** Capas disponibles en el mapa (enlazadas con búsqueda y API). */
export type MapLayerId =
  | "zonas"                      // Barrios con estado semáforo (verde/amarillo/rojo)
  | "segmentacion-oficio"       // Dónde se necesita un oficio (ej. costurera, albañil)
  | "saturacion"                // Zonas saturadas de profesionales
  | "empresas"                  // Empresas en el mapa
  | "profesionales"             // Profesionales con geolocalización
  | "mas-trabajo"               // Dónde hay más trabajo para mí (demanda alta)
  | "menos-demanda"             // Dónde hay menos competencia (menos demanda de mi oficio)
  | "empresas-buscan-mi-servicio"; // Empresas que buscan mi servicio en tiempo real

export interface BarrioPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  state: "green" | "yellow" | "red";
  /** Para capa segmentación: cantidad de profesionales de ese oficio (demanda = poco → "se necesita"). */
  countByOficio?: number;
  /** Para capa saturación: total profesionales en el barrio. */
  totalProfesionales?: number;
  /** Para mas-trabajo / menos-demanda: demanda estimada (ofertas/vacantes). */
  demanda?: number;
}

export interface EmpresaMarker {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  buscan: string[];
  type: "pyme" | "enterprise";
}

export interface ProfesionalMarker {
  userId: string;
  name: string;
  profession: string;
  lat: number;
  lng: number;
  rating?: number;
  /** Si tiene geolocalización activada (posición real). */
  geolocationEnabled?: boolean;
}
