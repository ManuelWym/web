import { ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import { loadAccountProfile } from "@/features/auth/services/AccountProfileService";
import { getSavedCampusRole } from "@/features/auth/services/CampusRoleService";
import "./Profile.css";

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AU"
  );
}

function getRoleLabel(role: string): string {
  switch (role.trim().toLowerCase()) {
    case "alumno":
    case "estudiante":
    case "student":
      return "Estudiante";
    case "docente":
    case "profesor":
    case "teacher":
      return "Docente";
    case "administrador":
    case "admin":
      return "Administrador";
    default:
      return role;
  }
}

export function Profile() {
  const profile = loadAccountProfile();
  const role = getSavedCampusRole();

  const profileFields = profile
    ? [
        ["Nombre completo", profile.name],
        ["Matrícula / número de cuenta", profile.accountNumber],
        ["Correo institucional", profile.email],
        ["Teléfono", profile.phone],
        ["Rol", getRoleLabel(profile.role)],
        [
          "Estado",
          profile.isActive === null
            ? "No disponible"
            : profile.isActive
              ? "Cuenta activa"
              : "Cuenta inactiva",
        ],
      ]
    : [];

  return (
    <main className="profile-page">
      <Link to="/" className="profile-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al inicio
      </Link>

      <header className="profile-page-heading">
        <div className="profile-eyebrow">MI ESPACIO</div>
        <h1>Mi perfil</h1>
        <p>Tu información personal y de cuenta.</p>
      </header>

      {profile ? (
        <>
          <section className="profile-identity" aria-label="Identidad del usuario">
            <span className="profile-avatar" aria-hidden="true">
              {getInitials(profile.name)}
            </span>
            <div>
              <h2>{profile.name}</h2>
              <p>
                <GraduationCap size={18} aria-hidden="true" />
                {role ? getRoleLabel(profile.role) : "Usuario"}
              </p>
            </div>
          </section>

          <dl className="profile-data">
            {profileFields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="profile-sample-note">
            Información asociada a la sesión actual.
          </p>
        </>
      ) : (
        <p className="profile-error" role="alert">
          No se pudieron cargar los datos de tu cuenta. Vuelve a iniciar sesión.
        </p>
      )}
    </main>
  );
}
