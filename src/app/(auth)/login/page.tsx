"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession, SAFE_MODE_CLIENT } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSafeMode } = useSession();
  const skipLogin = isSafeMode || SAFE_MODE_CLIENT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (skipLogin) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-foreground/80">
          En SAFE MODE ya estás autenticado con un usuario mock.
        </p>
        <Link
          href="/home"
          className="btn-interactive inline-block rounded-xl bg-yapo-petroleo px-6 py-3 font-semibold text-yapo-white shadow-md border-2 border-yapo-petroleo/80 hover:brightness-110"
        >
          Ir al inicio
        </Link>
      </main>
    );
  }

  const callbackUrl = searchParams.get("callbackUrl") ?? "/home";

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim() || undefined,
        password: password || undefined,
        masterKey: masterKey || undefined,
        redirect: false,
      });
      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Email o contraseña incorrectos." : String(res.error));
        return;
      }
      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "facebook" | "instagram") {
    setError("");
    await signIn(provider, { callbackUrl });
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo YAPÓ */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold text-[var(--yapo-blue)]">YAPÓ</h1>
          <p className="text-sm text-foreground/70">Plataforma de identidad y confianza</p>
        </div>

        <h2 className="text-center text-xl font-semibold text-foreground">Entrá a tu cuenta</h2>

        {error && (
          <>
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
            <Link
              href="/forgot-password"
              className="btn-interactive flex min-h-[44px] items-center justify-center rounded-xl border-2 border-yapo-blue/30 py-2.5 text-sm font-medium text-yapo-blue shadow-sm hover:bg-yapo-blue/10"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </>
        )}

        {/* OAuth */}
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="btn-interactive flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-white font-semibold text-foreground shadow-sm hover:border-yapo-cta/40 hover:bg-yapo-cta/5"
          >
            Continuar con Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("facebook")}
            className="btn-interactive flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-white font-semibold text-foreground shadow-sm hover:border-yapo-cta/40 hover:bg-yapo-cta/5"
          >
            Continuar con Facebook
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("instagram")}
            className="btn-interactive flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-white font-semibold text-foreground shadow-sm hover:border-yapo-cta/40 hover:bg-yapo-cta/5"
          >
            Continuar con Instagram
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-foreground/20" />
          </div>
          <span className="relative flex justify-center text-sm text-foreground/60">o con email</span>
        </div>

        {/* Email / password */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-background px-4 py-3 outline-none focus:border-[var(--yapo-blue)]"
              autoComplete="current-password"
            />
          </label>
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-[var(--yapo-blue)] underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-interactive w-full min-h-[48px] rounded-xl bg-yapo-cta font-semibold text-yapo-white shadow-md border-2 border-yapo-cta-hover/50 hover:bg-yapo-cta-hover disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar a mi cuenta"}
          </button>
          <p className="mt-2 text-center text-xs text-foreground/60">
            Accedé a ofertas, billetera y mensajes
          </p>
        </form>

        {/* Master Key (solo dev) */}
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-xl border border-foreground/10 bg-foreground/5 p-3">
            <summary className="cursor-pointer text-sm text-foreground/70">Dev: Master Key</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCredentials(e);
              }}
              className="mt-2 flex gap-2"
            >
              <input
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="YAPO_MASTER_KEY"
                className="flex-1 rounded border bg-background px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded bg-foreground/20 px-2 py-1 text-sm">
                Login
              </button>
            </form>
          </details>
        )}

        <p className="text-center text-sm text-foreground/70">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-[var(--yapo-blue)] underline">
            Registrarse
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-foreground/70">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
