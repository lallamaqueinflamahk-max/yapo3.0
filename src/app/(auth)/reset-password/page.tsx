"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const valid = token && email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al restablecer.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-foreground/80">Contraseña actualizada. Redirigiendo a login…</p>
        <Link href="/login" className="text-[var(--yapo-blue)] underline">
          Ir a login
        </Link>
      </main>
    );
  }

  if (!valid) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-foreground/80">Enlace inválido o expirado.</p>
        <Link href="/forgot-password" className="text-[var(--yapo-blue)] underline">
          Solicitar nuevo enlace
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold text-[var(--yapo-blue)]">Nueva contraseña</h1>
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Nueva contraseña (mín. 8)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              required
              minLength={8}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Confirmar contraseña</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              required
              minLength={8}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-[var(--yapo-red)] font-semibold text-[var(--yapo-white)] disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-[50vh]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
