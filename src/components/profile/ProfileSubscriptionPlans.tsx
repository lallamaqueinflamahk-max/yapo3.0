"use client";

import { useState } from "react";
import Link from "next/link";
import type { SubscriptionPlan } from "@/data/profile-mock";

interface ProfileSubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentRole?: string | null;
}

function formatPrice(plan: SubscriptionPlan): string {
  if (plan.price === "0") return "Gratis";
  if (plan.price === "Consultar") return "Consultar";
  return `${plan.price} PYG${plan.period ? ` ${plan.period}` : ""}`;
}

export default function ProfileSubscriptionPlans({ plans, currentRole }: ProfileSubscriptionPlansProps) {
  const [planForRequisitos, setPlanForRequisitos] = useState<SubscriptionPlan | null>(null);

  if (plans.length === 0) return null;

  return (
    <section className="rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Planes de suscripción">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
        Planes y niveles de acceso
      </h2>
      <p className="mb-2 text-sm text-foreground/80">
        Tu suscripción PRO te da <strong>YAPÓ Vale</strong> (ahorro en súper, nafta y farmacia), <strong>Escudo Insurtech</strong> (seguridad 72 h, daños y AP) y <strong>Club de descuentos</strong> (ferretería, medicamentos). Cuanto más nivel, más acceso a censo y mapa.
      </p>
      <p className="mb-4">
        <Link href="/planes" className="text-sm font-medium text-yapo-blue underline underline-offset-2">
          Ver qué incluye tu plan y beneficios →
        </Link>
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentRole = currentRole && plan.role === currentRole;
          const requirements = plan.requirements ?? [];
          return (
            <li
              key={plan.id}
              className={`rounded-xl border-2 p-4 ${
                plan.highlighted
                  ? "border-yapo-red bg-yapo-red/5"
                  : isCurrentRole
                    ? "border-yapo-emerald bg-yapo-emerald/10"
                    : "border-yapo-blue/15 bg-yapo-white"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-2 block text-xs font-bold uppercase text-yapo-red">Bioseguridad + pagos</span>
              )}
              {isCurrentRole && !plan.highlighted && (
                <span className="mb-2 block text-xs font-bold uppercase text-yapo-emerald">Tu nivel</span>
              )}
              <h3 className="text-lg font-bold text-yapo-blue">{plan.name}</h3>
              <p className="mt-1 text-sm font-medium text-yapo-blue/90">
                {formatPrice(plan)}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-yapo-emerald shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPlanForRequisitos(plan)}
                className={`mt-4 w-full rounded-lg py-2 text-sm font-medium ${
                  plan.highlighted
                    ? "bg-yapo-red text-yapo-white"
                    : isCurrentRole
                      ? "border-2 border-yapo-emerald text-yapo-emerald"
                      : "border-2 border-yapo-blue/30 text-yapo-blue"
                }`}
              >
                {isCurrentRole ? "Tu nivel" : plan.price === "0" ? "Ver requisitos" : "Ver requisitos y precio"}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Modal requisitos */}
      {planForRequisitos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-plan-title"
          onClick={() => setPlanForRequisitos(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-yapo-blue/20 bg-yapo-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modal-plan-title" className="text-xl font-bold text-yapo-blue">
              {planForRequisitos.name}
            </h3>
            <p className="mt-1 text-lg font-semibold text-yapo-blue/90">
              {formatPrice(planForRequisitos)}
            </p>
            <h4 className="mt-4 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
              Requisitos para este plan
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-foreground/90">
              {(planForRequisitos.requirements ?? []).map((req, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-yapo-blue shrink-0">•</span>
                  {req}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPlanForRequisitos(null)}
              className="mt-6 w-full rounded-xl bg-yapo-blue py-3 font-medium text-yapo-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
