import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { AccountRoleSelector } from "@/features/auth/components/AccountRoleSelector";
import {
  fetchAccountProfile,
  loadAccountRole,
  saveAccountRole,
} from "@/features/auth/services/AccountProfileService";
import type {
  AccountDashboardRole,
  AccountProfile,
} from "@/features/auth/types/AccountProfile";
import "./MyAccount.css";

const dashboards: Record<AccountDashboardRole, string> = {
  alumno: "/alumno",
  admin: "/admin",
};

export function MyAccount() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [role, setRole] = useState(loadAccountRole);

  useEffect(() => {
    let active = true;

    fetchAccountProfile()
      .then((accountProfile) => {
        if (active) setProfile(accountProfile);
      })
      .catch((error: unknown) => {
        if (active) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos de tu cuenta.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  const handleRoleChange = (nextRole: AccountDashboardRole) => {
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

      {loading ? (
        <p aria-live="polite">Cargando perfil...</p>
      ) : profile ? (
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
          {profileError ?? "No se pudieron cargar los datos de tu cuenta."}
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
