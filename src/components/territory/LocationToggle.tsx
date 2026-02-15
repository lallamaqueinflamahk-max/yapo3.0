"use client";

import type { GeoPosition } from "@/hooks/useGeolocation";

export interface LocationToggleProps {
  /** Si está activa la ubicación en tiempo real */
  realTimeEnabled: boolean;
  /** Activar/desactivar tiempo real */
  onRealTimeChange: (enabled: boolean) => void;
  /** Pedir posición actual (como WhatsApp "enviar mi ubicación") */
  onRequestMyLocation: () => void;
  /** Posición actual (para mostrar GPS) */
  position: GeoPosition | null;
  /** Mensaje de error de geolocalización */
  error: string | null;
  /** Pidiendo permiso o obteniendo posición */
  loading: boolean;
  labelRealTime?: string;
  labelUseMyLocation?: string;
  className?: string;
}

/**
 * Activar/desactivar ubicación en tiempo real y botón "Usar mi ubicación"
 * (estilo WhatsApp: cuando querés poner tu ubicación).
 * Estado manejado por el padre (useGeolocation).
 */
export default function LocationToggle({
  realTimeEnabled,
  onRealTimeChange,
  onRequestMyLocation,
  position,
  error,
  loading,
  labelRealTime = "Ubicación en tiempo real",
  labelUseMyLocation = "Usar mi ubicación actual",
  className = "",
}: LocationToggleProps) {

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={realTimeEnabled}
            onChange={(e) => onRealTimeChange(e.target.checked)}
            className="h-4 w-4 rounded border-yapo-blue/40 text-yapo-blue focus:ring-yapo-blue/30"
            aria-describedby={error ? "location-error" : undefined}
          />
          <span className="text-sm font-medium text-yapo-petroleo">
            {labelRealTime}
          </span>
        </label>
        <button
          type="button"
          onClick={onRequestMyLocation}
          disabled={loading}
          className="btn-interactive rounded-xl border-2 border-yapo-blue/50 bg-yapo-blue-light/50 px-3 py-1.5 text-sm font-semibold text-yapo-blue shadow-sm hover:bg-yapo-blue/20 disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? "…" : labelUseMyLocation}
        </button>
      </div>
      {position && (
        <p className="text-xs text-gris-texto-light">
          GPS: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </p>
      )}
      {error && (
        <p id="location-error" className="text-xs text-yapo-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
