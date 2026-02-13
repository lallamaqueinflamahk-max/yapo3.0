"use client";

/**
 * Se muestra cuando falla el root layout o hay un error no capturado.
 * Evita pantalla en blanco y permite recargar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
        <h1>Algo salió mal</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>{error.message || "Error desconocido"}</p>
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
      </body>
    </html>
  );
}
