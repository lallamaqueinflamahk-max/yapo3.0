"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface UseGeolocationResult {
  /** Posición actual (tiempo real si realTimeEnabled, si no la última conocida). */
  position: GeoPosition | null;
  /** Error de permiso o del navegador. */
  error: string | null;
  /** Pidiendo permiso o obteniendo posición. */
  loading: boolean;
  /** Si está activa la actualización en tiempo real (watchPosition). */
  realTimeEnabled: boolean;
  /** Activar o desactivar ubicación en tiempo real. */
  setRealTimeEnabled: (enabled: boolean) => void;
  /** Pedir una sola posición actual (como WhatsApp "enviar mi ubicación"). */
  requestPosition: () => void;
  /** Última posición conocida (aunque se desactive tiempo real). */
  lastKnownPosition: GeoPosition | null;
}

const defaultOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 60_000,
};

export function useGeolocation(options: PositionOptions = {}): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [lastKnownPosition, setLastKnownPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const opts = { ...defaultOptions, ...options };

  const updatePosition = useCallback((pos: GeolocationPosition) => {
    const p: GeoPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? undefined,
      timestamp: pos.timestamp,
    };
    setPosition(p);
    setLastKnownPosition(p);
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    const message =
      err.code === err.PERMISSION_DENIED
        ? "Permiso de ubicación denegado"
        : err.code === err.POSITION_UNAVAILABLE
          ? "Ubicación no disponible"
          : "Tiempo de espera agotado";
    setError(message);
    setLoading(false);
  }, []);

  const requestPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePosition(pos);
        setLoading(false);
      },
      onError,
      opts
    );
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge, updatePosition, onError]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (!realTimeEnabled) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    setError(null);
    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        updatePosition(pos);
        setLoading(false);
      },
      onError,
      opts
    );
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [realTimeEnabled, opts.enableHighAccuracy, opts.timeout, opts.maximumAge, updatePosition, onError]);

  return {
    position: realTimeEnabled ? position : lastKnownPosition,
    error,
    loading,
    realTimeEnabled,
    setRealTimeEnabled,
    requestPosition,
    lastKnownPosition,
  };
}
