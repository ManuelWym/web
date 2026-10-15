import { Navigate, Outlet } from "react-router";

export function ProtectedRoute() {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
