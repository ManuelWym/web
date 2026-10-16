import { createBrowserRouter, Navigate } from "react-router";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { AdminUpdate } from "@/features/admin/pages/AdminUpdate";
import { DashboardEstudiante } from "@/features/customer/pages/DashboardEstudiante";
import { CampusFeaturePage } from "@/features/customer/pages/CampusFeaturePage";
import { ProviderDashboard } from "@/features/provider/pages/ProviderDashboard";
import { ChangeNip } from "@/features/auth/pages/ChangeNip";
import { Profile } from "@/features/auth/pages/Profile";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { ProviderLayout } from "@/layouts/ProviderLayout";
import { CampusHomeRoute } from "@/routes/CampusHomeRoute";
import { LoginRoute } from "@/routes/LoginRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleProtectedRoute } from "@/routes/RoleProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginRoute />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <CampusHomeRoute />,
          },
          {
            path: "perfil",
            element: <Profile />,
          },
          {
            path: "cambiar-nip",
            element: <ChangeNip />,
          },
          {
            path: "mensajes",
            element: (
              <CampusFeaturePage
                title="Mensajes de plataforma"
                description="Aquí encontrarás los avisos y mensajes de tu campus."
              />
            ),
          },
          {
            path: "unauthorized",
            element: (
              <CampusFeaturePage
                title="Acceso no autorizado"
                description="Tu cuenta no tiene permisos para acceder a esta sección."
              />
            ),
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["student", "teacher"]} />
            ),
            children: [
              {
                path: "calificaciones",
                element: (
                  <CampusFeaturePage
                    title="Calificaciones"
                    description="Aquí podrás consultar tus calificaciones cuando esta sección esté disponible."
                  />
                ),
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["student"]} />,
            children: [
              {
                path: "estudiante",
                element: <CustomerLayout />,
                children: [{ index: true, element: <DashboardEstudiante /> }],
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["teacher"]} />,
            children: [
              {
                path: "profesor",
                element: <ProviderLayout />,
                children: [{ index: true, element: <ProviderDashboard /> }],
              },
            ],
          },
          {
            element: <RoleProtectedRoute allowedRoles={["admin"]} />,
            children: [
              {
                path: "admin",
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminDashboard /> },
                  { path: "update", element: <AdminUpdate /> },
                ],
              },
              {
                path: "administrador",
                element: <AdminLayout />,
                children: [{ index: true, element: <AdminDashboard /> }],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
