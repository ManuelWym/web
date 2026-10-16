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
  const profileFields: [string, string][] = profile
    ? [
        ["ID", profile.id],
        ["Nombre", profile.name],
        ["Matrícula", profile.accountNumber],
        ["Correo", profile.email],
        ["Teléfono", profile.phone],
        ["Rol de cuenta", profile.role],
        [
          "Estado",
          profile.isActive === null
            ? "No disponible"
            : profile.isActive
              ? "Activa"
              : "Inactiva",
        ],
      ]
    : [];

  const handleRoleChange = (nextRole: AccountRole) => {
    setRole(nextRole);
    saveAccountRole(nextRole);
  };

  return (
    <main className="account-page">
      <header className="account-page-heading">
        <div className="account-eyebrow">/ME</div>
        <h1>Mi cuenta</h1>
        <p>Consulta los datos asociados a tu cuenta.</p>
      </header>

      {profile ? (
        <dl className="account-profile-data">
          {profileFields.map(([label, value]) => (
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

      <p className="account-role-description">
        Selecciona un panel para probar la experiencia de cada tipo de usuario.
      </p>
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
