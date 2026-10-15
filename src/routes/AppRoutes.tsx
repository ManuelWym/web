import { createBrowserRouter, Navigate } from "react-router";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
import { DashboardEstudiante } from "@/features/customer/pages/DashboardEstudiante";
import { ProviderDashboard } from "@/features/provider/pages/ProviderDashboard";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { ProviderLayout } from "@/layouts/ProviderLayout";
import { LoginRoute } from "@/routes/LoginRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginRoute />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "estudiante",
            element: <CustomerLayout />,
            children: [{ index: true, element: <DashboardEstudiante /> }],
          },
          {
            path: "profesor",
            element: <ProviderLayout />,
            children: [{ index: true, element: <ProviderDashboard /> }],
          },
          {
            path: "administrador",
            element: <AdminLayout />,
            children: [{ index: true, element: <AdminDashboard /> }],
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
