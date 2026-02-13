"use client";

import { useCallback } from "react";
import type { RoleId } from "@/lib/auth";
import { ROLE_IDS, getRoleName } from "@/lib/auth";
import { useSession } from "@/lib/auth";

export interface SafeModeRoleSelectorProps {
  className?: string;
  /** Estilo compacto (solo dropdown) vs con etiqueta. */
  variant?: "full" | "compact";
}

/**
 * Selector de rol cuando SAFE MODE está activo.
 * Valé, Capeto, Kavaju, Mbareté, Cliente, PyME, Enterprise.
 * No bloquea el flujo; solo actualiza la sesión mock.
 */
export default function SafeModeRoleSelector({
  className = "",
  variant = "full",
}: SafeModeRoleSelectorProps) {
  const { isSafeMode, roles, setSafeRole } = useSession();
  const currentRole = roles[0] ?? "capeto";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as RoleId;
      if (ROLE_IDS.includes(value)) setSafeRole(value);
    },
    [setSafeRole]
  );

  if (!isSafeMode) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {variant === "full" && (
        <label htmlFor="safe-mode-role" className="text-sm font-medium text-yapo-white/90">
          Rol (Safe Mode):
        </label>
      )}
      <select
        id="safe-mode-role"
        value={currentRole}
        onChange={handleChange}
        aria-label="Seleccionar rol en modo seguro"
        className="min-h-[40px] rounded-xl border border-yapo-blue/30 bg-yapo-white px-3 py-2 text-sm text-gray-900 focus:border-yapo-blue focus:outline-none focus:ring-2 focus:ring-yapo-blue/30 [&_option]:bg-white [&_option]:text-gray-900"
      >
        {ROLE_IDS.map((roleId) => (
          <option key={roleId} value={roleId}>
            {getRoleName(roleId)}
          </option>
        ))}
      </select>
    </div>
  );
}
