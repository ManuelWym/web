import type { AdminUserRole } from "@/features/admin/types/AdminUser";

export const adminUserRoles: AdminUserRole[] = ["alumno", "docente", "admin"];

export function isAdminUserRole(role: string): role is AdminUserRole {
  return adminUserRoles.includes(role as AdminUserRole);
}

export function getAdminUserInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
