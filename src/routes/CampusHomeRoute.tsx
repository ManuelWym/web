import { Navigate } from "react-router";
import { getSavedDashboardRoute } from "@/features/auth/services/DashboardRouteService";

export function CampusHomeRoute() {
  return <Navigate to={getSavedDashboardRoute()} replace />;
}
