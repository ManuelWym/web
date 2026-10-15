import {
  getSavedCampusRole,
  normalizeCampusRole,
} from "@/features/auth/services/CampusRoleService";

export function getDashboardRouteByRole(role: string): string {
  switch (normalizeCampusRole(role)) {
    case "student":
      return "/estudiante";
    case "teacher":
      return "/profesor";
    case "admin":
      return "/admin";
    default:
      return "/estudiante";
  }
}

export function getSavedDashboardRoute(): string {
  switch (getSavedCampusRole()) {
    case "student":
      return "/estudiante";
    case "teacher":
      return "/profesor";
    case "admin":
      return "/admin";
    default:
      return "/estudiante";
  }
}
