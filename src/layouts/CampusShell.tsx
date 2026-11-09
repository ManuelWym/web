import { useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronRight,
  GraduationCap,
  House,
  LogOut,
  Mail,
  Menu,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { loadAccountProfile } from "@/features/auth/services/AccountProfileService";
import {
  getSavedCampusRole,
  type CampusRole,
} from "@/features/auth/services/CampusRoleService";
import "./CampusShell.css";

function getCampusRoleLabel(role: CampusRole | null): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "teacher":
      return "Profesor";
    case "student":
      return "Estudiante";
    default:
      return "Usuario del campus";
  }
}

interface CampusShellProps {
  children: ReactNode;
  onLogout: () => Promise<void>;
}

export function CampusShell({ children, onLogout }: CampusShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profile = loadAccountProfile();
  const displayName = profile?.name ?? "Mi cuenta";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AU";
  const campusRole = getSavedCampusRole();
  const userRole = getCampusRoleLabel(campusRole);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <div className="campus-shell">
      <header className="campus-header">
        <div className="campus-header-left">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
          <Link to="/" className="campus-brand" aria-label="Aula, inicio">
            <span className="campus-brand-mark">
              <BookOpen aria-hidden="true" />
            </span>
            aula<span className="campus-brand-dot">.</span>
          </Link>
          <span className="campus-header-divider" aria-hidden="true" />
          <span className="campus-label">CAMPUS VIRTUAL</span>
        </div>
        <div className="campus-header-right">
          <span className="campus-semester">
            Semestre agosto – diciembre 2026
          </span>
          <Link
            to="/mensajes"
            className="campus-notification"
            aria-label="Mensajes de plataforma"
          >
            <Bell aria-hidden="true" />
            <i aria-hidden="true" />
          </Link>
          <Link to="/perfil" className="campus-avatar" aria-label="Mi perfil">
            {initials}
          </Link>
        </div>
      </header>

      <main className="campus-content">{children}</main>

      <footer className="campus-footer">
        <span>
          <strong>aula.</strong> Tu espacio para aprender.
        </span>
        <span className="campus-footer-tagline">
          Campus virtual · 2026 <span className="campus-footer-dot">•</span>
          <BookOpen size={14} aria-hidden="true" /> Siempre contigo
        </span>
      </footer>

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="campus-overlay" />
          <Dialog.Popup
            className="campus-menu"
            aria-describedby="campus-menu-description"
          >
            <div className="campus-menu-heading">
              <Dialog.Title className="campus-menu-brand">aula.</Dialog.Title>
              <Dialog.Description
                id="campus-menu-description"
                className="campus-menu-description"
              >
                Campus virtual · {userRole}
              </Dialog.Description>
            </div>
            <div className="campus-menu-user">
              <span className="campus-avatar">{initials}</span>
              <div>
                <strong>{displayName}</strong>
                <small>{userRole}</small>
              </div>
            </div>
            <nav className="campus-menu-links" aria-label="Navegación principal">
              <Link
                to="/"
                className="campus-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                <House aria-hidden="true" />
                <span>Inicio</span>
                <ChevronRight aria-hidden="true" />
              </Link>
              <Link
                to="/mensajes"
                className="campus-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                <Mail aria-hidden="true" />
                <span>Mensajes de plataforma</span>
                <span className="campus-count-pill">2</span>
              </Link>
              <Link
                to="/perfil"
                className="campus-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound aria-hidden="true" />
                <span>Mi perfil</span>
                <ChevronRight aria-hidden="true" />
              </Link>
              <Link
                to="/calificaciones"
                className="campus-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                <GraduationCap aria-hidden="true" />
                <span>Calificaciones</span>
                <ChevronRight aria-hidden="true" />
              </Link>
              {campusRole === "admin" && (
                <Link
                  to="/me"
                  className="campus-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound aria-hidden="true" />
                  <span>Mi cuenta (/me)</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              )}
              {campusRole === "admin" && (
                <Link
                  to="/admin"
                  className="campus-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <GraduationCap aria-hidden="true" />
                  <span>Panel de administrador</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                className="campus-menu-link campus-logout-link"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
              >
                <LogOut aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="campus-overlay campus-dialog-overlay" />
          <Dialog.Popup
            className="campus-logout-dialog"
            aria-describedby="campus-logout-description"
          >
            <Dialog.Title className="campus-dialog-title">
              Cerrar sesión
            </Dialog.Title>
            <Dialog.Description
              id="campus-logout-description"
              className="campus-dialog-description"
            >
              ¿Quieres cerrar tu sesión actual?
            </Dialog.Description>
            <div className="campus-dialog-actions">
              <Button
                variant="outline"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
              >
                Cancelar
              </Button>
              <Button onClick={confirmLogout} disabled={loggingOut}>
                {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                {!loggingOut && <ArrowUpRight aria-hidden="true" />}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
