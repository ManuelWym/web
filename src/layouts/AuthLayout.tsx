import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { logout } from "@/features/auth/services/LogoutService";
import "./AuthLayout.css";

export function AuthLayout() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {token && (
        <header className="inicio-header">
          <button id="btn-logout" className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>
      )}
      <Outlet context={setToken} />
    </>
  );
}
