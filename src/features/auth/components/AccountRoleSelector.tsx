import { GraduationCap, ShieldCheck } from "lucide-react";
import type { AccountDashboardRole } from "@/features/auth/types/AccountProfile";

interface AccountRoleSelectorProps {
  role: AccountDashboardRole;
  onChange: (role: AccountDashboardRole) => void;
}

export function AccountRoleSelector({
  role,
  onChange,
}: AccountRoleSelectorProps) {
  return (
    <div className="account-role-tabs" aria-label="Rol de prueba">
      <button
        className={role === "alumno" ? "active" : ""}
        type="button"
        aria-pressed={role === "alumno"}
        onClick={() => onChange("alumno")}
      >
        <GraduationCap size={16} />
        Alumno
      </button>
      <button
        className={role === "admin" ? "active" : ""}
        type="button"
        aria-pressed={role === "admin"}
        onClick={() => onChange("admin")}
      >
        <ShieldCheck size={16} />
        Admin
      </button>
    </div>
  );
}
