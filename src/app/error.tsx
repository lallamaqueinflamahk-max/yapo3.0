"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Captura errores en la app y muestra fallback en lugar de pantalla en blanco.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Algo salió mal</h1>
      <p style={{ color: "#666", marginBottom: 24, maxWidth: 400 }}>
        {error.message || "Error al cargar la aplicación."}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "#0d9488",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "#1e40af",
            color: "white",
            textDecoration: "none",
            borderRadius: 8,
          }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
