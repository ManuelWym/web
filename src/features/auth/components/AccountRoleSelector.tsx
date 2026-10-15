import { GraduationCap, ShieldCheck } from "lucide-react";
import type { AccountRole } from "@/features/auth/types/AccountProfile";

interface AccountRoleSelectorProps {
  role: AccountRole;
  onChange: (role: AccountRole) => void;
}

export function AccountRoleSelector({
  role,
  onChange,
}: AccountRoleSelectorProps) {
  return (
    <div className="account-role-tabs" aria-label="Rol de prueba">
      <button
        className={role === "estudiante" ? "active" : ""}
        type="button"
        aria-pressed={role === "estudiante"}
        onClick={() => onChange("estudiante")}
      >
        <GraduationCap size={16} />
        Estudiante
      </button>
      <button
        className={role === "administrador" ? "active" : ""}
        type="button"
        aria-pressed={role === "administrador"}
        onClick={() => onChange("administrador")}
      >
        <ShieldCheck size={16} />
        Administrador
      </button>
    </div>
  );
}
