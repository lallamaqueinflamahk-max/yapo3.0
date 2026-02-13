"use client";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function MetricsCard({ title, value, subtitle, trend, className = "" }: MetricsCardProps) {
  return (
    <div className={`rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-yapo-blue/80">{title}</p>
      <p className="mt-1 text-2xl font-bold text-yapo-blue">{value}</p>
      {subtitle && <p className="mt-0.5 text-sm text-foreground/70">{subtitle}</p>}
      {trend && (
        <span
          className={`mt-1 inline-block text-xs font-medium ${
            trend === "up" ? "text-yapo-emerald" : trend === "down" ? "text-yapo-red" : "text-foreground/60"
          }`}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} vs período anterior
        </span>
      )}
    </div>
  );
}
