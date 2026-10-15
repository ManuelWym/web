import { Navigate, Outlet } from "react-router";
import {
  getSavedCampusRole,
  type CampusRole,
} from "@/features/auth/services/CampusRoleService";

interface RoleProtectedRouteProps {
  allowedRoles: CampusRole[];
}

export function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const role = getSavedCampusRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
