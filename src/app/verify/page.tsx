"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const CONSENT_BIOMETRIA =
  "Usamos tu rostro y documento solo para verificar que sos vos. No guardamos la imagen ni el documento; solo el resultado de la verificación. Es necesario para operaciones seguras (billetera, contratos, beneficios verificados).";

type Step = "loading" | "consent" | "verifying" | "success" | "already_verified" | "error";

function VerifyContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("loading");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flowUrl, setFlowUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const done = searchParams.get("done") ?? searchParams.get("success");
    if (done === "1" || done === "true") {
      setStep("success");
      return;
    }

    const check = async () => {
      try {
        const res = await fetch("/api/kyc/status");
        if (!res.ok) return setStep("consent");
        const data = await res.json();
        if (data.verificationLevel === "trusted" || data.verificationLevel === "verified") {
          setStep("already_verified");
          return;
        }
        setStep("consent");
      } catch {
        setStep("consent");
      }
    };

    check();
  }, [status, session?.user?.id, searchParams]);

  async function handleStartVerification(e: React.FormEvent) {
    e.preventDefault();
    if (!consentAccepted) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/kyc/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentAccepted: true }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === "CONSENT_REQUIRED") {
          setError("Debés aceptar el consentimiento para continuar.");
          return;
        }
        setError(data.error ?? "No se pudo iniciar la verificación.");
        return;
      }

      setSessionId(data.sessionId ?? null);
      setFlowUrl(data.flowUrl ?? null);
      setStep("verifying");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleVerificationComplete() {
    setStep("success");
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-bold text-[var(--yapo-petroleo)]">Verificación de identidad</h1>
        <p className="text-center text-foreground/80">Iniciá sesión para verificar tu cuenta.</p>
        <Link
          href="/login"
          className="rounded-xl bg-[var(--yapo-blue)] px-6 py-3 font-medium text-white"
        >
          Ir a login
        </Link>
      </main>
    );
  }

  if (step === "loading") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-foreground/80">Cargando…</p>
      </main>
    );
  }

  if (step === "already_verified") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl" aria-hidden>
          ✓
        </div>
        <h1 className="text-xl font-bold text-[var(--yapo-petroleo)]">Ya estás verificado</h1>
        <p className="text-center text-foreground/80">
          Tu cuenta tiene verificación de identidad activa. Podés usar billetera y todos los beneficios.
        </p>
        <Link
          href="/profile"
          className="rounded-xl bg-[var(--yapo-blue)] px-6 py-3 font-medium text-white"
        >
          Ir a mi perfil
        </Link>
      </main>
    );
  }

  if (step === "success") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl" aria-hidden>
          ✓
        </div>
        <h1 className="text-xl font-bold text-[var(--yapo-petroleo)]">Verificación completada</h1>
        <p className="text-center text-foreground/80">
          Tu identidad fue verificada correctamente. Ya podés usar la billetera y los beneficios verificados.
        </p>
        <Link
          href="/profile"
          className="rounded-xl bg-[var(--yapo-blue)] px-6 py-3 font-medium text-white"
        >
          Ir a mi perfil
        </Link>
      </main>
    );
  }

  if (step === "verifying") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-[var(--yapo-blue)]/20 px-2 py-0.5 text-sm font-medium text-[var(--yapo-blue)]">
            Paso 2 de 2
          </span>
          <h1 className="text-lg font-bold text-[var(--yapo-petroleo)]">Verificación de identidad</h1>
        </div>

        {flowUrl ? (
          <iframe
            src={flowUrl}
            title="Verificación de identidad"
            className="min-h-[500px] w-full rounded-2xl border-2 border-[var(--yapo-blue)]/20 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[var(--yapo-blue)]/30 bg-[var(--yapo-blue)]/5 p-8 text-center">
            <p className="mb-4 text-sm text-foreground/80">
              Sesión de verificación creada. Integrá el SDK de Incode en esta pantalla con el token recibido para
              capturar documento y selfie.
            </p>
            <p className="text-xs text-foreground/60">
              Session ID: {sessionId ?? "—"} · Configurá INCODE_FLOW_URL en el servidor para usar flujo hospedado.
            </p>
            <Link
              href="/profile"
              className="mt-4 inline-block rounded-xl bg-[var(--yapo-blue)] px-4 py-2 text-sm font-medium text-white"
            >
              Volver al perfil
            </Link>
          </div>
        )}

        <p className="mt-4 text-xs text-foreground/60">
          <Link href="/legal/privacy" className="underline">
            Política de privacidad
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-[var(--yapo-blue)]/20 px-2 py-0.5 text-sm font-medium text-[var(--yapo-blue)]">
          Paso 1 de 2
        </span>
        <h1 className="text-lg font-bold text-[var(--yapo-petroleo)]">Verificación de identidad</h1>
      </div>

      <p className="mb-6 text-sm text-foreground/80">
        Para usar la billetera y los beneficios verificados, necesitamos confirmar tu identidad con documento y
        selfie. El proceso es rápido y seguro.
      </p>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleStartVerification} className="space-y-4">
        <label className="flex cursor-pointer gap-3 rounded-xl border-2 border-[var(--yapo-blue)]/20 bg-white p-4">
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-[var(--yapo-blue)]/40 accent-[var(--yapo-blue)]"
            required
          />
          <span className="text-sm text-foreground/90">{CONSENT_BIOMETRIA}</span>
        </label>
        <p className="text-xs text-foreground/60">
          <Link href="/legal/privacy" className="underline">
            Política de privacidad
          </Link>
        </p>
        <button
          type="submit"
          disabled={!consentAccepted || loading}
          className="w-full min-h-[48px] rounded-xl bg-[var(--yapo-cta)] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Preparando…" : "Continuar a verificación"}
        </button>
      </form>

      <Link href="/profile" className="mt-6 block text-center text-sm text-foreground/70 underline">
        Volver al perfil
      </Link>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-foreground/80">Cargando…</p>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
