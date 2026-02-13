"use client";

import type { ReactNode } from "react";

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  benefits: string[];
  highlighted?: boolean;
  action?: ReactNode;
  className?: string;
}

export default function PlanCard({ name, price, period, benefits, highlighted, action, className = "" }: PlanCardProps) {
  return (
    <article
      className={`rounded-2xl border-2 p-4 ${
        highlighted ? "border-yapo-red bg-yapo-red/5" : "border-yapo-blue/15 bg-yapo-white"
      } ${className}`}
    >
      {highlighted && <span className="mb-2 block text-xs font-bold uppercase text-yapo-red">Recomendado</span>}
      <h3 className="text-lg font-bold text-yapo-blue">{name}</h3>
      <p className="mt-1 text-xl font-semibold text-yapo-blue/90">
        {price}
        {period && <span className="text-sm font-normal"> {period}</span>}
      </p>
      <ul className="mt-3 space-y-1 text-sm text-foreground/80">
        {benefits.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-yapo-emerald">✓</span>
            {b}
          </li>
        ))}
      </ul>
      {action && <div className="mt-4">{action}</div>}
    </article>
  );
}
