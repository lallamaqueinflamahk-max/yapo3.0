"use client";

/**
 * Wallet UI YAPÓ — Fintech mobile-first.
 * Muestra: saldo, historial, escudos activos.
 * Acciones: transferir, recibir — cada una emite CerebroIntent.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import type { CerebroIntent, CerebroResult, CerebroRole } from "@/lib/ai/cerebro";
import { runWithIntent, buildIntentContext } from "@/lib/ai/cerebroEngine";
import {
  createWalletCore,
  getWalletAccount,
  getTransactions,
  getWalletByUserCanonical,
  releaseTransaction,
  blockTransaction,
} from "@/lib/wallet";
import type { Transaction, BalanceData, WalletData, Escudo } from "@/lib/wallet";
import type { RoleId } from "@/lib/auth";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import EscudosChips from "@/components/wallet/EscudosChips";
import TransactionList from "@/components/wallet/TransactionList";
import RecibirSection from "@/components/wallet/RecibirSection";
import SendFlow from "@/components/wallet/SendFlow";
import AcuerdosSection from "@/components/wallet/AcuerdosSection";
import GarantiasSection from "@/components/wallet/GarantiasSection";
import { useCerebroResultHandler } from "@/components/ui/CerebroResultHandler";
import type { Acuerdo } from "@/features/contrato";
import type { EscrowOrder } from "@/features/escudo-pago";

const CURRENCY = "PYG";

export interface WalletUIProps {
  /** Si no se pasa, usa identity de useSession. */
  userId?: string | null;
  /** Callback al recibir resultado del Cerebro (navegación, validación). */
  onResult?: (result: CerebroResult) => void;
  className?: string;
}

/**
 * UI de Billetera: saldo, escudos, acciones (transferir → CerebroIntent), historial.
 * Mobile-first; cada acción dispara intent para que el Cerebro decida.
 */
export default function WalletUI({ userId: userIdProp, onResult, className = "" }: WalletUIProps) {
  const { identity } = useSession();
  const { handleCerebroResult } = useCerebroResultHandler();
  const userId = userIdProp ?? identity?.userId ?? null;
  const roles = identity?.roles ?? [];
  const primaryRole = (roles[0] ?? "vale") as CerebroRole;

  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [walletCanonical, setWalletCanonical] = useState<WalletData | null>(null);
  const [escudosActivos, setEscudosActivos] = useState<Escudo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
  const [garantias, setGarantias] = useState<EscrowOrder[]>([]);
  const [loadingAcuerdos, setLoadingAcuerdos] = useState(false);
  const [loadingGarantias, setLoadingGarantias] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendFlowOpen, setSendFlowOpen] = useState(false);

  const refresh = useCallback(() => {
    if (!userId) {
      setBalance(null);
      setWalletCanonical(null);
      setEscudosActivos([]);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      createWalletCore(userId);
      const account = getWalletAccount(userId);
      if (account) {
        setBalance({
          disponible: account.balanceAvailable,
          protegido: account.balanceProtected,
          total: account.balanceAvailable + account.balanceProtected,
        });
        setEscudosActivos(account.escudosActivos ?? []);
      } else {
        setBalance(null);
        setEscudosActivos([]);
      }
      const canonical = getWalletByUserCanonical(userId);
      setWalletCanonical(canonical);
      const all = getTransactions();
      const mine = all.filter((tx) => tx.from === userId || tx.to === userId);
      setTransactions(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar billetera");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) {
      setAcuerdos([]);
      setGarantias([]);
      setLoadingAcuerdos(false);
      setLoadingGarantias(false);
      return;
    }
    setLoadingAcuerdos(true);
    setLoadingGarantias(true);
    fetch("/api/wallet/acuerdos")
      .then((r) => (r.ok ? r.json() : { acuerdos: [] }))
      .then((data: { acuerdos?: Acuerdo[] }) => setAcuerdos(data.acuerdos ?? []))
      .catch(() => setAcuerdos([]))
      .finally(() => setLoadingAcuerdos(false));
    fetch("/api/wallet/garantias")
      .then((r) => (r.ok ? r.json() : { garantias: [] }))
      .then((data: { garantias?: EscrowOrder[] }) => setGarantias(data.garantias ?? []))
      .catch(() => setGarantias([]))
      .finally(() => setLoadingGarantias(false));
  }, [userId]);

  const handleTransferir = useCallback(() => {
    if (!userId) return;
    const intent: CerebroIntent = {
      intentId: "wallet_transfer",
      source: "chip",
      payload: {},
    };
    const context = buildIntentContext({
      userId,
      role: primaryRole,
      currentScreen: typeof window !== "undefined" ? window.location.pathname : "/wallet",
    });
    const result = runWithIntent(intent, context);
    onResult?.(result);
    handleCerebroResult(result);
    if (result.allowed !== false && !result.requiresValidation) {
      setSendFlowOpen(true);
    }
  }, [userId, primaryRole, onResult, handleCerebroResult]);

  const handleRecibir = useCallback(() => {
    if (!userId) return;
    const intent: CerebroIntent = {
      intentId: "wallet_view",
      source: "chip",
      payload: { action: "receive" },
    };
    const context = buildIntentContext({
      userId,
      role: primaryRole,
      currentScreen: typeof window !== "undefined" ? window.location.pathname : "/wallet",
    });
    const result = runWithIntent(intent, context);
    onResult?.(result);
    handleCerebroResult(result);
  }, [userId, primaryRole, onResult, handleCerebroResult]);

  const handleRelease = useCallback(
    (txId: string) => {
      if (!userId) return { success: false, error: "Sin usuario." };
      return releaseTransaction(txId, userId, roles);
    },
    [userId, roles]
  );

  const handleBlock = useCallback((txId: string) => blockTransaction(txId), []);

  if (!userId) {
    return (
      <main
        className={`min-h-[100dvh] bg-yapo-white px-4 pb-24 pt-6 ${className}`}
        aria-label="Billetera YAPÓ"
      >
        <section className="rounded-3xl border-2 border-yapo-blue/20 bg-yapo-white p-8 shadow-md">
          <div className="flex justify-center">
            <WalletIcon className="h-14 w-14 text-yapo-blue" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-yapo-blue">Billetera YAPÓ</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Iniciá sesión para ver tu saldo y transferir.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`min-h-[100dvh] bg-yapo-white px-4 pb-28 pt-6 ${className}`}
      aria-label="Billetera YAPÓ"
    >
      <header className="mb-6 flex items-center gap-3">
        <WalletIcon className="h-9 w-9 shrink-0 text-yapo-blue" aria-hidden />
        <h1 className="text-xl font-bold text-yapo-blue">Billetera YAPÓ</h1>
      </header>

      {/* Seguridad operativa — visible en cada transacción */}
      <section
        className="mb-5 rounded-2xl border-2 border-yapo-emerald/30 bg-yapo-emerald/5 p-4"
        aria-label="Seguridad operativa YAPÓ"
      >
        <h2 className="text-sm font-semibold text-yapo-emerald-dark">🛡️ Seguridad en cada transacción</h2>
        <ul className="mt-2 space-y-1 text-xs text-foreground/85">
          <li><strong>Escudo YAPÓ:</strong> El dinero queda en custodia hasta cumplir hitos (50% inicio, 50% al finalizar).</li>
          <li><strong>Contrato digital:</strong> C.I. de ambas partes, descripción y monto inmutables, garantía técnica.</li>
          <li><strong>Compromiso de Hierro:</strong> Cancelar con menos de 2 h debita Token; Cumplidor &lt; 80% oculta anuncios 48 h.</li>
          <li><strong>Profesional Matriculado:</strong> Sello ANDE/MOPC da prioridad en búsqueda y confianza.</li>
        </ul>
      </section>

      {/* Saldo */}
      <WalletBalanceCard
        balance={balance}
        loading={loading}
        error={error ?? undefined}
        walletEstado={walletCanonical?.estado}
      />

      {/* Escudos activos */}
      {escudosActivos.length > 0 && (
        <section className="mt-5" aria-label="Escudos activos">
          <EscudosChips escudos={escudosActivos} />
        </section>
      )}

      {/* Mis Escudos: hub + enlaces a Insurtech, Fintech, Regalos, Comunidad */}
      <section className="mt-5 rounded-2xl border-2 border-yapo-blue/15 bg-yapo-white/80 p-4" aria-label="Mis Escudos">
        <h2 className="mb-2 text-sm font-semibold text-yapo-blue">Mis Escudos</h2>
        <p className="mb-2 text-xs text-foreground/80">Con tu plan PRO tenés <strong>Vale de Consumo</strong>, <strong>Insurtech</strong> y <strong>Club de descuentos</strong>. Acá: Insurtech, Fintech (ruedas), Regalos, Comunidad. Precios, reglas y cómo activarlos.</p>
        <p className="mb-3">
          <Link href="/planes" className="text-xs font-medium text-yapo-blue underline underline-offset-2">Ver qué incluye tu plan y beneficios</Link>
        </p>
        <p className="mb-2">
          <Link href="/escudos" className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-yapo-blue/30 bg-yapo-blue-light/40 px-4 py-2 text-sm font-semibold text-yapo-blue">🛡️ Ver todos los escudos</Link>
        </p>
        <ul className="flex flex-wrap gap-2">
          <li><Link href="/escudos/insurtech" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 border-yapo-blue/20 bg-yapo-blue-light/30 px-3 py-1.5 text-sm font-medium text-yapo-blue">🛡️ Insurtech</Link></li>
          <li><Link href="/escudos/fintech" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 border-yapo-blue/20 bg-yapo-blue-light/30 px-3 py-1.5 text-sm font-medium text-yapo-blue">💰 Fintech</Link></li>
          <li><Link href="/escudos/regalos" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 border-yapo-blue/20 bg-yapo-blue-light/30 px-3 py-1.5 text-sm font-medium text-yapo-blue">🎁 Regalos</Link></li>
          <li><Link href="/comunidad" className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border-2 border-yapo-blue/20 bg-yapo-blue-light/30 px-3 py-1.5 text-sm font-medium text-yapo-blue">👥 Comunidad</Link></li>
        </ul>
      </section>

      {/* Acuerdos de trabajo y Garantías de pago — visibles para transacciones */}
      <section className="mt-5 space-y-4" aria-label="Acuerdos y garantías">
        <AcuerdosSection acuerdos={acuerdos} currentUserId={userId} loading={loadingAcuerdos} />
        <GarantiasSection garantias={garantias} currentUserId={userId} loading={loadingGarantias} />
        <p className="rounded-xl border border-yapo-blue/10 bg-yapo-blue-light/10 px-3 py-2 text-xs text-foreground/80">
          <strong>En disputa:</strong> YAPÓ retiene el fondo hasta que un mediador revise la evidencia (contrato, fotos). Los pagos en custodia también aparecen en el historial abajo cuando se liberan.
        </p>
      </section>

      {/* Acciones: Transferir, Recibir — cada una → CerebroIntent */}
      <section className="mt-6 grid grid-cols-2 gap-4" aria-label="Acciones">
        <button
          type="button"
          onClick={handleTransferir}
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-yapo-red/30 bg-yapo-red/10 font-semibold text-yapo-red transition-[transform,background] active:scale-[0.98] active:bg-yapo-red/20 touch-manipulation"
          aria-label="Enviar dinero"
        >
          <span className="text-3xl leading-none" aria-hidden>
            ↑
          </span>
          Enviar dinero
        </button>
        <div className="flex min-h-[64px] flex-col justify-center">
          <button
            type="button"
            onClick={handleRecibir}
            className="flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-yapo-blue/30 bg-yapo-blue/10 font-semibold text-yapo-blue transition-[transform,background] active:scale-[0.98] active:bg-yapo-blue/20 touch-manipulation"
            aria-label="Cobrar o recibir"
          >
            <span className="text-3xl leading-none" aria-hidden>
              ↓
            </span>
            Cobrar o recibir
          </button>
        </div>
      </section>

      {/* Recibir: usuario para que te envíen */}
      <section className="mt-4" aria-label="Recibir">
        <RecibirSection userId={userId} className="min-h-[80px]" />
      </section>

      {/* Historial */}
      <section className="mt-8 pb-8" aria-label="Historial">
        <h2 className="mb-2 text-lg font-semibold text-yapo-blue">Historial de movimientos</h2>
        <p className="mb-3 text-xs text-foreground/70">
          Los pagos con garantía (escrow) se gestionan en <strong>Garantías de pago</strong> arriba; aquí ves cuando se liberan o transferen.
        </p>
        <TransactionList
          transactions={transactions}
          currentUserId={userId}
          onRelease={handleRelease}
          onBlock={handleBlock}
          onReleaseSuccess={refresh}
          onBlockSuccess={refresh}
          loading={loading}
          error={error ?? undefined}
        />
      </section>

      {sendFlowOpen && (
        <SendFlow
          currentUserId={userId}
          role={primaryRole as RoleId}
          onSuccess={refresh}
          onClose={() => setSendFlowOpen(false)}
        />
      )}
    </main>
  );
}

function WalletIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
