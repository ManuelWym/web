import { Outlet } from "react-router";
import { AdminNav } from "@/features/admin/components/AdminNav";
import "./AdminDashboard.css";

export function AdminDashboard() {
  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Panel de admin</h1>
      </header>

      <AdminNav />

      <Outlet />
    </main>
  );
}
