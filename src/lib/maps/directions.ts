/**
 * URLs para abrir Google Maps con direcciones (cómo llegar).
 * Estilo: descripción + rutas como cuando buscás una empresa en Google.
 */

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Genera la URL de Google Maps para "Cómo llegar" desde un origen a un destino.
 * @param origin - Coordenadas del usuario o null para "Mi ubicación" (Google pedirá permiso)
 * @param destination - Coordenadas del destino o dirección en texto
 * @param destinationLabel - Nombre del lugar (ej. "Botánico, Asunción") para mostrar
 */
export function getGoogleMapsDirectionsUrl(
  origin: Coords | null,
  destination: Coords | string,
  destinationLabel?: string
): string {
  const params = new URLSearchParams();
  params.set("api", "1");
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  } else {
    params.set("origin", "Mi+ubicación");
  }
  const dest =
    typeof destination === "string"
      ? destination
      : `${destination.lat},${destination.lng}`;
  params.set("destination", dest);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * URL para ver un punto en el mapa (sin rutas).
 */
export function getGoogleMapsPlaceUrl(coords: Coords, label?: string): string {
  const { lat, lng } = coords;
  const params = new URLSearchParams();
  params.set("api", "1");
  params.set("query", `${lat},${lng}`);
  if (label) params.set("query_place_id", label);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
