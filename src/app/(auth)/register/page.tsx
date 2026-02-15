"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, SAFE_MODE_CLIENT } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { isSafeMode } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isSafeMode || SAFE_MODE_CLIENT) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-foreground/80">En SAFE MODE no es necesario registrarse.</p>
        <Link href="/home" className="btn-interactive inline-block rounded-xl bg-yapo-petroleo px-6 py-3 font-semibold text-yapo-white shadow-md border-2 border-yapo-petroleo/80 hover:brightness-110">
          Ir al inicio
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Para seguir, aceptá la Política de Privacidad y los Términos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al crear la cuenta.");
        return;
      }
      router.push("/login?registered=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold text-[var(--yapo-blue)]">YAPÓ</h1>
          <h2 className="text-xl font-semibold text-foreground">Empezar gratis</h2>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Nombre (opcional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              required
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Contraseña (mín. 8 caracteres)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label className="flex cursor-pointer gap-3 rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-white p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-5 w-5 rounded border-2 border-[var(--yapo-blue)]/40 accent-[var(--yapo-blue)]"
              required
            />
            <span className="text-sm text-foreground/90">
              Acepto la Política de Privacidad y los Términos y Condiciones de YAPÓ.
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-interactive w-full min-h-[48px] rounded-xl bg-yapo-cta font-semibold text-yapo-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear mi cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/70">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-[var(--yapo-blue)] underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
