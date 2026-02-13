"use client";

import { getRoleName } from "@/lib/auth";
import type { RoleId } from "@/lib/auth";

interface ProfileHeaderProps {
  name: string | null | undefined;
  image: string | null | undefined;
  role: RoleId | string;
  verified: boolean;
  badges: string[];
  email?: string | null;
}

export default function ProfileHeader({
  name,
  image,
  role,
  verified,
  badges,
  email,
}: ProfileHeaderProps) {
  const roleName = typeof role === "string" ? getRoleName(role as RoleId) : role;
  const displayName = name || "Sin nombre";
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section
      className="rounded-2xl border-2 border-yapo-blue/20 bg-gradient-to-br from-yapo-blue/10 to-yapo-blue-light/30 p-4"
      aria-label="Datos principales del perfil"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-yapo-blue/30 bg-yapo-blue/20">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-yapo-blue">
              {initials || "?"}
            </span>
          )}
          {verified && (
            <span
              className="absolute bottom-0 right-0 rounded-full bg-yapo-emerald p-1"
              title="Verificado"
              aria-label="Verificado"
            >
              <span className="text-sm">✓</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-yapo-blue truncate">{displayName}</h1>
          <p className="mt-0.5 text-sm font-medium text-yapo-blue/80">{roleName}</p>
          {email && (
            <p className="mt-0.5 text-xs text-foreground/70 truncate">{email}</p>
          )}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-yapo-blue/20 px-2 py-0.5 text-xs font-medium text-yapo-blue"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
