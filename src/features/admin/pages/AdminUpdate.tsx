import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Save,
  Search,
  UserCog,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import {
  listUsers,
  updateUser,
} from "@/features/admin/services/AdminUserService";
import type {
  AdminUser,
  AdminUserRole,
  UsersPagination,
} from "@/features/admin/types/AdminUser";
import "./AdminUpdate.css";

const roles: AdminUserRole[] = ["alumno", "docente", "administrador"];

function isAdminUserRole(role: string): role is AdminUserRole {
  return roles.includes(role as AdminUserRole);
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  );
}

export function AdminUpdate() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserRole>("alumno");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedUserIdRef = useRef<number | null>(null);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? null;

  useEffect(() => {
    let isCurrentRequest = true;

    listUsers({ page, buscar: search || undefined })
      .then((response) => {
        if (!isCurrentRequest) return;
        setUsers(response.data);
        setPagination(response.meta);
        const currentSelectedId = selectedUserIdRef.current;
        const nextSelectedUser =
          response.data.some((user) => user.id === currentSelectedId)
            ? response.data.find((user) => user.id === currentSelectedId) ?? null
            : (response.data[0] ?? null);
        const nextSelectedUserId = nextSelectedUser?.id ?? null;
        selectedUserIdRef.current = nextSelectedUserId;
        setSelectedUserId(nextSelectedUserId);
        setName(nextSelectedUser?.nombre ?? "");
        setEmail(nextSelectedUser?.correo ?? "");
        setRole(
          nextSelectedUser && isAdminUserRole(nextSelectedUser.rol)
            ? nextSelectedUser.rol
            : "alumno",
        );
        setError("");
        setSaved(false);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron cargar los usuarios.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [page, search]);

  const pickUser = (user: AdminUser) => {
    selectedUserIdRef.current = user.id;
    setSelectedUserId(user.id);
    setName(user.nombre);
    setEmail(user.correo);
    setRole(isAdminUserRole(user.rol) ? user.rol : "alumno");
    setError("");
    setSaved(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchText.trim();
    if (page === 1 && nextSearch === search) return;
    setLoading(true);
    setLoadError("");
    setPage(1);
    setSearch(nextSearch);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setSaved(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Correo inválido.");
      setSaved(false);
      return;
    }
    if (!roles.includes(role)) {
      setError("Rol no reconocido.");
      setSaved(false);
      return;
    }
    if (!selectedUser) {
      setError("Selecciona un usuario para actualizar.");
      setSaved(false);
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await updateUser(selectedUser.id, {
        nombre: name.trim(),
        correo: email.trim().toLowerCase(),
        rol: role,
      });
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === response.user.id ? response.user : user,
        ),
      );
      setName(response.user.nombre);
      setEmail(response.user.correo);
      setRole(isAdminUserRole(response.user.rol) ? response.user.rol : role);
      setSaved(true);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-update-page">
      <Link to="/admin" className="admin-update-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Panel de administrador
      </Link>

      <header className="admin-update-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Actualizar datos de usuario</h1>
        <p>Selecciona un usuario y cambia su nombre, correo o rol.</p>
      </header>

      <div className="admin-update-layout">
        <div className="admin-update-user-panel">
          <form className="admin-update-search" onSubmit={handleSearch}>
            <label htmlFor="admin-update-user-search">
              Buscar por nombre o número de cuenta
            </label>
            <div>
              <input
                id="admin-update-user-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <Button type="submit" aria-label="Buscar usuarios">
                <Search />
              </Button>
            </div>
          </form>

          {loadError && (
            <p className="admin-update-message admin-update-error" role="alert">
              <CircleAlert size={14} aria-hidden="true" />
              {loadError}
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
                  onClick={() => pickUser(user)}
                >
                  <span className="admin-update-avatar" aria-hidden="true">
                    {getInitials(user.nombre)}
                  </span>
                  <span>
                    <strong>{user.nombre}</strong>
                    <small>
                      {user.numero_cuenta} · {user.rol}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            !loadError && (
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
                onClick={() => {
                  setLoading(true);
                  setLoadError("");
                  setPage((currentPage) => currentPage - 1);
                }}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading || page >= pagination.last_page}
                onClick={() => {
                  setLoading(true);
                  setLoadError("");
                  setPage((currentPage) => currentPage + 1);
                }}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>

        <form
          className="admin-card admin-update-form"
          onSubmit={save}
        >
          <h2>
            <UserCog size={18} aria-hidden="true" />
            Datos del usuario
          </h2>
          <label>
            Número de cuenta
            <input
              value={selectedUser?.numero_cuenta ?? ""}
              disabled
              readOnly
            />
          </label>
          <label>
            Nombre
            <input
              value={name}
              required
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </label>
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
            />
          </label>
          <label>
            Rol
            <select
              value={role}
              disabled={!selectedUser}
              onChange={(event) => {
                const nextRole = event.target.value;
                if (isAdminUserRole(nextRole)) {
                  setRole(nextRole);
                  setSaved(false);
                }
              }}
            >
              {roles.map((userRole) => (
                <option key={userRole} value={userRole}>
                  {userRole}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="admin-update-message admin-update-error" role="alert">
              <CircleAlert size={14} aria-hidden="true" />
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="admin-update-message admin-update-success" role="status">
              <CircleCheck size={14} aria-hidden="true" />
              Cambios guardados
            </p>
          )}
          <Button
            type="submit"
            disabled={saving || loading || Boolean(loadError) || !selectedUser}
          >
            <Save />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>

      <p className="admin-update-note">
        Los cambios se guardan en el servidor.
      </p>
    </main>
  );
}
