import type { FormEvent } from "react";
import { CircleAlert, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getAdminUserInitials } from "@/features/admin/utils/AdminUserUtils";
import type {
  AdminUser,
  UsersPagination,
} from "@/features/admin/types/AdminUser";

interface AdminUpdateUserListProps {
  users: AdminUser[];
  pagination: UsersPagination | null;
  selectedUserId: number | null;
  searchText: string;
  page: number;
  loading: boolean;
  error: string;
  onSearchTextChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onPickUser: (user: AdminUser) => void;
  onPageChange: (page: number) => void;
}

export function AdminUpdateUserList({
  users,
  pagination,
  selectedUserId,
  searchText,
  page,
  loading,
  error,
  onSearchTextChange,
  onSearch,
  onPickUser,
  onPageChange,
}: AdminUpdateUserListProps) {
  return (
    <div className="admin-update-user-panel">
      <form className="admin-update-search" onSubmit={onSearch}>
        <label htmlFor="admin-update-user-search">
          Buscar por nombre o número de cuenta
        </label>
        <div>
          <input
            id="admin-update-user-search"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
          />
          <Button type="submit" aria-label="Buscar usuarios">
            <Search />
          </Button>
        </div>
      </form>

      {error && (
        <p className="admin-update-message admin-update-error" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      {loading ? (
        <p className="admin-update-list-status" role="status">
          Cargando usuarios...
        </p>
      ) : users.length ? (
        <div
          className="admin-update-user-list"
          role="listbox"
          aria-label="Usuarios registrados"
        >
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              role="option"
              aria-selected={user.id === selectedUserId}
              className={user.id === selectedUserId ? "active" : ""}
              onClick={() => onPickUser(user)}
            >
              <span className="admin-update-avatar" aria-hidden="true">
                {getAdminUserInitials(user.nombre)}
              </span>
              <span className="admin-update-user-info">
                <strong>{user.nombre}</strong>
                <small>
                  {user.numero_cuenta} · {user.rol}
                </small>
              </span>
              <span
                className={`admin-update-user-status ${user.activo ? "is-active" : "is-inactive"}`}
              >
                {user.activo ? "Activo" : "Inactivo"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        !error && (
          <p className="admin-update-list-status">
            No hay usuarios para mostrar.
          </p>
        )
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="admin-update-pagination">
          <span>
            Página {pagination.current_page} de {pagination.last_page}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || page >= pagination.last_page}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
