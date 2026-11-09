import type { FormEvent } from "react";
import { Search, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminUserRoleLabels } from "@/features/admin/components/AdminUserColumns";
import { AdminUsersTable } from "@/features/admin/components/AdminUsersTable";
import type {
  AdminUserRole,
  UserListFilters,
  UserStatusFilter,
  UsersPage,
} from "@/features/admin/types/AdminUser";

interface AdminUsersPanelProps {
  filters: UserListFilters;
  searchText: string;
  usersPage: UsersPage | null;
  loading: boolean;
  error: string;
  onSearchTextChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onFilterChange: (
    key: "rol" | "estado",
    value: AdminUserRole | UserStatusFilter | "",
  ) => void;
  onPageChange: (page: number) => void;
  onUpdateUsers: () => void;
}

export function AdminUsersPanel({
  filters,
  searchText,
  usersPage,
  loading,
  error,
  onSearchTextChange,
  onSearch,
  onFilterChange,
  onPageChange,
  onUpdateUsers,
}: AdminUsersPanelProps) {
  return (
    <section className="admin-card">
      <h2>Usuarios registrados</h2>
      <form className="admin-user-filters" onSubmit={onSearch}>
        <label className="admin-search">
          Buscar por nombre o número de cuenta
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Nombre o número de cuenta"
          />
        </label>
        <label>
          Rol
          <select
            value={filters.rol ?? ""}
            onChange={(event) =>
              onFilterChange("rol", event.target.value as AdminUserRole | "")
            }
          >
            <option value="">Todos</option>
            {Object.entries(adminUserRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={filters.estado ?? ""}
            onChange={(event) =>
              onFilterChange(
                "estado",
                event.target.value as UserStatusFilter | "",
              )
            }
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
        <div className="admin-user-filter-actions">
          <Button type="submit">
            <Search />
            Buscar
          </Button>
          <Button
            type="button"
            className="admin-update-users-button"
            onClick={onUpdateUsers}
          >
            <UserCog />
            Actualizar datos
          </Button>
        </div>
      </form>

      {error && (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="admin-empty-state" role="status">
          Cargando usuarios...
        </p>
      ) : usersPage ? (
        <>
          {usersPage.data.length ? (
            <AdminUsersTable users={usersPage.data} />
          ) : (
            <p className="admin-empty-state">No hay usuarios para mostrar.</p>
          )}

          <div className="admin-pagination">
            <span>
              {usersPage.meta.total} usuarios · Página{" "}
              {usersPage.meta.current_page} de {usersPage.meta.last_page}
            </span>
            <div>
              <Button
                type="button"
                variant="outline"
                disabled={usersPage.meta.current_page <= 1}
                onClick={() => onPageChange(usersPage.meta.current_page - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={
                  usersPage.meta.current_page >= usersPage.meta.last_page
                }
                onClick={() => onPageChange(usersPage.meta.current_page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
