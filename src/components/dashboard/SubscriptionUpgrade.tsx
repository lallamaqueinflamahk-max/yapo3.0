"use client";

import { useState } from "react";
import PlanCard from "./PlanCard";

interface SubscriptionUpgradeProps {
  /** Si true, muestra el modal de upgrade (fricción) */
  open: boolean;
  onClose: () => void;
  /** Recurso que requiere upgrade (ej. "más de 3 ofertas") */
  requiredFeature?: string;
}

const UPGRADE_PLANS = [
  { name: "Valé", price: "Gratis", period: "", benefits: ["10 ofertas", "Chat", "Comunidad"], slug: "vale" },
  { name: "PyME", price: "149.000 PYG", period: "por mes", benefits: ["100 ofertas", "Equipos", "RUC"], slug: "pyme", highlighted: true },
  { name: "Enterprise", price: "499.000 PYG", period: "por mes", benefits: ["Ilimitado", "Planillas", "Múltiples sedes"], slug: "enterprise" },
];

export default function SubscriptionUpgrade({ open, onClose, requiredFeature }: SubscriptionUpgradeProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = (slug: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl bg-yapo-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="upgrade-title" className="text-xl font-bold text-yapo-blue">
          Upgrade de plan
        </h2>
        {requiredFeature && (
          <p className="mt-1 text-sm text-foreground/80">
            Para usar {requiredFeature} necesitás un plan superior.
          </p>
        )}
        <div className="mt-4 grid gap-3">
          {UPGRADE_PLANS.map((plan) => (
            <PlanCard
              key={plan.slug}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              benefits={plan.benefits}
              highlighted={plan.highlighted}
              action={
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleUpgrade(plan.slug)}
                  className={`w-full rounded-xl py-2 text-sm font-medium ${
                    plan.highlighted ? "bg-yapo-red text-yapo-white" : "border-2 border-yapo-blue/30 text-yapo-blue"
                  }`}
                >
                  {loading ? "Procesando..." : plan.price === "Gratis" ? "Elegir" : "Pagar y activar"}
                </button>
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border-2 border-yapo-blue/20 py-2 text-sm font-medium text-yapo-blue"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
