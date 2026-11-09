import { useNavigate } from "react-router";
import { AdminImportStatus } from "@/features/admin/components/AdminImportStatus";
import { AdminUserForm } from "@/features/admin/components/AdminUserForm";
import { AdminUsersPanel } from "@/features/admin/components/AdminUsersPanel";
import { CsvImportForm } from "@/features/admin/components/CsvImportForm";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import "./AdminDashboard.css";

export function AdminDashboard() {
  const navigate = useNavigate();
  const dashboard = useAdminDashboard();

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Panel de admin</h1>
        <p>Consulta, filtra y registra usuarios.</p>
      </header>

      <CsvImportForm
        file={dashboard.csvFile}
        fileError={dashboard.csvError}
        busy={dashboard.uploadingCsv}
        processing={dashboard.importStatus?.estado === "en_proceso"}
        onFile={dashboard.handleCsvFile}
        onImport={dashboard.handleCsvImport}
      />

      <AdminImportStatus
        status={dashboard.importStatus}
        error={dashboard.importError}
        onRetry={dashboard.retryImportStatus}
      />

      <AdminUserForm
        form={dashboard.form}
        saving={dashboard.savingUser}
        onChange={dashboard.handleFormChange}
        onSubmit={dashboard.handleCreateUser}
      />

      <AdminUsersPanel
        filters={dashboard.filters}
        searchText={dashboard.searchText}
        usersPage={dashboard.usersPage}
        loading={dashboard.loadingUsers}
        error={dashboard.listError}
        onSearchTextChange={dashboard.setSearchText}
        onSearch={dashboard.handleSearch}
        onFilterChange={dashboard.handleFilterChange}
        onPageChange={dashboard.handlePageChange}
        onUpdateUsers={() => navigate("/admin/update")}
      />
    </main>
  );
}
