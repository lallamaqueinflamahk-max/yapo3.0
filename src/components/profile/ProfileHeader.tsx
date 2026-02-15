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
      className="relative overflow-hidden rounded-2xl border-2 border-yapo-cta/30 bg-gradient-to-br from-yapo-white via-yapo-blue-light/40 to-yapo-cta/10 p-4 shadow-lg"
      aria-label="Datos principales del perfil"
    >
      <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-yapo-cta/20 -translate-y-1/2 translate-x-1/2" aria-hidden />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-yapo-blue/20 -translate-y-1/2 -translate-x-1/2" aria-hidden />
      <div className="absolute top-1/2 right-1/3 h-16 w-16 rounded-full bg-yapo-validacion/15" aria-hidden />
      <div className="relative flex flex-wrap items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-yapo-cta/40 bg-yapo-white shadow-md ring-2 ring-yapo-blue/20">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-yapo-petroleo">
              {initials || "?"}
            </span>
          )}
          {verified && (
            <span
              className="absolute bottom-0 right-0 rounded-full bg-yapo-validacion p-1.5 shadow"
              title="Verificado"
              aria-label="Verificado"
            >
              <span className="text-sm text-white">✓</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-yapo-petroleo truncate">{displayName}</h1>
          <p className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-yapo-blue/15 px-2 py-0.5 text-sm font-medium text-yapo-blue">
            {roleName}
          </p>
          {email && (
            <p className="mt-1 text-xs text-gris-texto-light truncate">{email}</p>
          )}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-yapo-validacion/20 px-2.5 py-0.5 text-xs font-medium text-yapo-validacion-dark"
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
