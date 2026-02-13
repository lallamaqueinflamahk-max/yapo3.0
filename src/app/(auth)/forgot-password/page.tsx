"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDevLink(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al enviar.");
        return;
      }
      setSent(true);
      if (data._devLink) setDevLink(data._devLink);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-semibold text-[var(--yapo-blue)]">YAPÓ</h1>
        <p className="text-center text-foreground/80">
          Si el email existe, recibirás un enlace para restablecer la contraseña.
        </p>
        {devLink && (
          <Link
            href={devLink}
            className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-800"
          >
            [Dev] Ir a restablecer contraseña
          </Link>
        )}
        <Link href="/login" className="text-[var(--yapo-blue)] underline">
          Volver a login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--yapo-blue)]">YAPÓ</h1>
          <h2 className="text-lg font-semibold text-foreground">Recuperar contraseña</h2>
        </div>
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-[var(--yapo-red)] font-semibold text-[var(--yapo-white)] disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
        <p className="text-center text-sm">
          <Link href="/login" className="text-[var(--yapo-blue)] underline">
            Volver a login
          </Link>
        </p>
      </div>
    </main>
  );
}
