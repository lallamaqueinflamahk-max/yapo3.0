"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

const CONSENT_TEXT =
  "Acepto la Política de Privacidad y los Términos y Condiciones de YAPÓ. Entiendo que mis datos serán tratados según lo indicado y que puedo revocar el consentimiento en Configuración.";

export default function ConsentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-foreground/80">Debés iniciar sesión para continuar.</p>
        <Link href="/login" className="rounded-xl bg-[var(--yapo-blue)] px-6 py-3 font-medium text-[var(--yapo-white)]">
          Ir a login
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo registrar el consentimiento.");
        return;
      }
      router.push("/home");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--yapo-blue)]">YAPÓ</h1>
          <h2 className="text-lg font-semibold text-foreground">Consentimiento obligatorio</h2>
        </div>

        <p className="text-sm text-foreground/80">
          Para usar la plataforma tenés que aceptar la Política de Privacidad y los Términos y Condiciones.
        </p>

        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex cursor-pointer gap-3 rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-white p-4">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-2 border-[var(--yapo-blue)]/40 accent-[var(--yapo-blue)]"
              required
            />
            <span className="text-sm text-foreground/90">{CONSENT_TEXT}</span>
          </label>
          <p className="text-xs text-foreground/60">
            <Link href="/legal/privacy" className="underline">
              Ver Política de Privacidad
            </Link>
            {" · "}
            <Link href="/legal/terms" className="underline">
              Ver Términos y Condiciones
            </Link>
          </p>
          <button
            type="submit"
            disabled={!accepted || loading}
            className="w-full min-h-[48px] rounded-xl bg-[var(--yapo-red)] font-semibold text-[var(--yapo-white)] transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Aceptar y continuar"}
          </button>
        </form>
      </div>
    </main>
  );
}
