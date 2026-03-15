"use client";

/**
 * Navegación de salida en pantallas de auth: evita quedar bloqueado.
 * - "Volver al inicio": enlace a / (siempre).
 * - En desarrollo: "Entrar en modo prueba" inicia sesión mock (safe-user) y lleva a /home sin bloquear.
 * No afecta seguridad en producción: el botón de modo prueba solo se muestra en dev.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import { createSafeSessionForClient } from "@/lib/auth";

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

export function AuthExitNav() {
  const router = useRouter();
  const { setSession } = useSession();

  function handleModoPrueba() {
    setSession(createSafeSessionForClient());
    router.push("/home");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-3 pt-4 text-sm" aria-label="Salir de la pantalla de autenticación">
      <Link
        href="/"
        className="text-foreground/70 underline underline-offset-2 hover:text-foreground"
      >
        Volver al inicio
      </Link>
      {isDev && (
        <>
          <span className="text-foreground/40" aria-hidden>|</span>
          <button
            type="button"
            onClick={handleModoPrueba}
            className="text-amber-700 underline underline-offset-2 hover:text-amber-800"
          >
            Entrar en modo prueba (sin login)
          </button>
        </>
      )}
    </nav>
  );
}
