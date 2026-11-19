import { BookOpen, GraduationCap, LayoutGrid, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const adminNavItems: AdminNavItem[] = [
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/materias", label: "Materias", icon: BookOpen },
  { to: "/admin/grupos", label: "Grupos", icon: LayoutGrid },
  { to: "/admin/cursos", label: "Cursos", icon: GraduationCap },
];

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Secciones del panel de admin">
      {adminNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => cn("admin-nav-link", isActive && "active")}
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
