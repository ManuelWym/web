import {
  getSavedCampusRole,
} from "@/features/auth/services/CampusRoleService";
import type { UserRole } from "@/features/auth/types/User";

export function getDashboardRouteByRole(role: UserRole): string {
  switch (role) {
    case "alumno":
      return "/alumno";
    case "docente":
      return "/docente";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

export function getSavedDashboardRoute(): string {
  switch (getSavedCampusRole()) {
    case "alumno":
      return "/alumno";
    case "docente":
      return "/docente";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
