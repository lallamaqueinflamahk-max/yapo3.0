"use client";

import type { PresenceStatus } from "@/lib/chat";

interface OnlineStatusProps {
  status: PresenceStatus;
  userName?: string;
  className?: string;
}

export default function OnlineStatus({ status, userName, className = "" }: OnlineStatusProps) {
  const label =
    status === "online"
      ? "En línea"
      : status === "typing"
        ? "Escribiendo..."
        : "Desconectado";

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-label={userName ? `${userName}: ${label}` : label}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          status === "online"
            ? "bg-green-500"
            : status === "typing"
              ? "bg-amber-500 animate-pulse"
              : "bg-zinc-400"
        }`}
      />
      <span className="text-xs text-yapo-blue/80">{label}</span>
    </div>
  );
}
