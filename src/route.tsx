import { createBrowserRouter, Navigate, Outlet, useNavigate, } from "react-router";
import { useState } from "react";
import { Login } from "./pages/login/login";
import { logout } from "./api/postLogoutAction";
import "./pages/start/main/mainLayout.css";
import { DashboardEstudiante } from "./pages/Alumno/Dashboard/DashboardEstudiante";

// Componentes o Páginas provisionales/de muestra para cada rol
// const DashboardEstudiante = () => <h2>Panel de Estudiante</h2>;
const DashboardProfesor = () => <h2>Panel de Profesor</h2>;
const DashboardAdministrador = () => <h2>Panel de Administrador</h2>;

function obtenerRutaDashboard(): string {
  const usuarioGuardado = localStorage.getItem("user");

  if (usuarioGuardado) {
    try {
      const usuario: unknown = JSON.parse(usuarioGuardado);
      if (typeof usuario === "object" && usuario !== null && "rol" in usuario) {
        const rol = usuario.rol;
        if (typeof rol === "string") {
          switch (rol.toLowerCase()) {
            case "profesor":
            case "docente":
              return "/profesor";
            case "administrador":
            case "admin":
              return "/administrador";
            case "estudiante":
            case "alumno":
            default:
              return "/estudiante";
          }
        }
      }
    } catch (error) {
      console.error("No se pudo leer el rol guardado del usuario:", error);
    }
  }

  return "/estudiante";
}

function DashboardPorDefecto() {
  return <Navigate to={obtenerRutaDashboard()} replace />;
}

/**
 * Layout principal o de autenticación.
 * Renderiza el Login si no está autenticado, o permite ver a los hijos (Outlet) si ya inició sesión.
 */
function MainLayout() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setToken(null);
    navigate("/login", { replace: true });
  };

  // Si no hay token, redirige o muestra la pantalla de Login
  if (!token) {
    return <Login onAuthenticated={setToken} />;
  }

  // Si está autenticado, renderiza la ruta hija correspondiente
  return (
    <>
        <header className="inicio-header">
          <button id="btn-logout" className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPorDefecto />,
      },
      {
        path: "estudiante",
        element: <DashboardEstudiante />,
      },
      {
        path: "profesor",
        element: <DashboardProfesor />,
      },
      {
        path: "administrador",
        element: <DashboardAdministrador />,
      },
      // Redirección por defecto si no funciona la autenticacion
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
