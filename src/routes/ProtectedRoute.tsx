import { Navigate, Outlet, useNavigate, useOutletContext } from "react-router";
import { CampusShell } from "@/layouts/CampusShell";
import { logout } from "@/features/auth/services/LogoutService";

export function ProtectedRoute() {
  const setAuthToken = useOutletContext<(token: string | null) => void>();
  const navigate = useNavigate();

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    setAuthToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <CampusShell onLogout={handleLogout}>
      <Outlet />
    </CampusShell>
  );
}
