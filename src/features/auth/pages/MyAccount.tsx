import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { AccountRoleSelector } from "@/features/auth/components/AccountRoleSelector";
import {
  loadAccountProfile,
  loadAccountRole,
  saveAccountRole,
} from "@/features/auth/services/AccountProfileService";
import type { AccountRole } from "@/features/auth/types/AccountProfile";
import "./MyAccount.css";

const dashboards: Record<AccountRole, string> = {
  estudiante: "/estudiante",
  administrador: "/admin",
};

export function MyAccount() {
  const navigate = useNavigate();
  const [profile] = useState(loadAccountProfile);
  const [role, setRole] = useState(loadAccountRole);

  const handleRoleChange = (nextRole: AccountRole) => {
    setRole(nextRole);
    saveAccountRole(nextRole);
  };

  return (
    <main className="account-page">
      <header className="account-page-heading">
        <div className="account-eyebrow">/ME</div>
        <h1>Mi cuenta</h1>
        <p>Tu rol define el panel que verás.</p>
      </header>

      {profile ? (
        <dl className="account-profile-data">
          {[
            ["ID", profile.id],
            ["Nombre", profile.name],
            ["Matrícula", profile.accountNumber],
            ["Rol", role],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="account-profile-error" role="alert">
          No se pudieron cargar los datos de tu cuenta. Vuelve a iniciar sesión.
        </p>
      )}

      <AccountRoleSelector role={role} onChange={handleRoleChange} />
      <Button
        className="account-dashboard-button"
        type="button"
        onClick={() => navigate(dashboards[role])}
      >
        Ir a mi panel <ArrowRight />
      </Button>
      <p className="account-sample-note">
        Rol de ejemplo · Cámbialo para probar cada panel
      </p>
    </main>
  );
}
