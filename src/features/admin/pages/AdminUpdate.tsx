import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { AdminUpdateNipForm } from "@/features/admin/components/AdminUpdateNipForm";
import { AdminUpdateProfileForm } from "@/features/admin/components/AdminUpdateProfileForm";
import { AdminUpdateStatusForm } from "@/features/admin/components/AdminUpdateStatusForm";
import { AdminUpdateUserList } from "@/features/admin/components/AdminUpdateUserList";
import { useAdminUpdate } from "@/features/admin/hooks/useAdminUpdate";
import "./AdminUpdate.css";

export function AdminUpdate() {
  const update = useAdminUpdate();

  return (
    <main className="admin-update-page">
      <Link to="/admin" className="admin-update-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Panel de admin
      </Link>

      <header className="admin-update-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Actualizar datos de usuario</h1>
        <p>Selecciona un usuario y cambia su nombre, correo o rol.</p>
      </header>

      <div className="admin-update-layout">
        <AdminUpdateUserList
          users={update.users}
          pagination={update.pagination}
          selectedUserId={update.selectedUserId}
          searchText={update.searchText}
          page={update.page}
          loading={update.loading}
          error={update.loadError}
          onSearchTextChange={update.setSearchText}
          onSearch={update.handleSearch}
          onPickUser={update.pickUser}
          onPageChange={update.changePage}
        />

        <div className="admin-update-forms">
          <AdminUpdateProfileForm
            selectedUser={update.selectedUser}
            name={update.name}
            email={update.email}
            role={update.role}
            error={update.error}
            saving={update.saving}
            loading={update.loading}
            loadError={update.loadError}
            onNameChange={update.setName}
            onEmailChange={update.setEmail}
            onRoleChange={update.setRole}
            onSubmit={update.save}
          />

          <AdminUpdateStatusForm
            currentStatus={update.selectedUser?.activo}
            activeStatus={update.activeStatus}
            error={update.statusError}
            saving={update.savingStatus}
            loading={update.loading}
            loadError={update.loadError}
            canSave={Boolean(update.selectedUser)}
            onStatusChange={update.setActiveStatus}
            onErrorChange={update.setStatusError}
            onSubmit={update.saveStatus}
          />

          <AdminUpdateNipForm
            userName={update.selectedUser?.nombre}
            value={update.newNip}
            error={update.nipError}
            saving={update.resettingNip}
            loading={update.loading}
            loadError={update.loadError}
            canSave={Boolean(update.selectedUser)}
            onChange={update.setNewNip}
            onErrorChange={update.setNipError}
            onSubmit={update.saveNewNip}
          />
        </div>
      </div>

      <p className="admin-update-note">
        Los cambios se guardan en el servidor.
      </p>
    </main>
  );
}
