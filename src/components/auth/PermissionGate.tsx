"use client";

import type { ReactNode } from "react";
import type { RoleId } from "@/lib/auth";
import { can, canWithRoles, getRoleName } from "@/lib/auth";
import { useSession } from "@/lib/auth";

type ActionId = string;

interface PermissionGateProps {
  action: ActionId;
  children: ReactNode;
}

export default function PermissionGate({ action, children }: PermissionGateProps) {
  const { identity } = useSession();
  const check = identity
    ? can(identity, action)
    : canWithRoles([], action);

  if (identity && check.allowed) {
    return <>{children}</>;
  }

  const requiredRoles = (check.requiredRoles ?? []) as RoleId[];
  const roleNames =
    requiredRoles.length > 0
      ? requiredRoles.map(getRoleName).join(", ")
      : null;

  return (
    <div className="rounded-2xl border-2 border-yapo-blue/20 bg-yapo-white p-6 shadow-sm">
      <p className="font-semibold text-yapo-blue">Sin permiso para esta acción</p>
      <p className="mt-2 text-sm text-foreground/80">
        {!identity
          ? "Iniciá sesión para continuar."
          : (check.reason ?? "No tenés el rol necesario.")}
      </p>
      {roleNames && (
        <p className="mt-2 text-sm text-foreground/70">
          Se requiere uno de estos roles: <strong>{roleNames}</strong>.
        </p>
      )}
      <p className="mt-4 text-sm text-foreground/60">
        Iniciá sesión con un usuario que tenga el rol indicado o contactá al
        administrador.
      </p>
    </div>
  );
}
