import { useEffect, useState, type FormEvent } from "react";
import { Search, UserCog, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { CsvImportForm } from "@/features/admin/components/CsvImportForm";
import {
  createUser,
  getUserImportStatus,
  listUsers,
  uploadUsersCsv,
} from "@/features/admin/services/AdminUserService";
import type {
  AdminUserRole,
  CreateUserPayload,
  UserListFilters,
  UserStatusFilter,
  UsersPage,
} from "@/features/admin/types/AdminUser";
import type {
  ImportStatusResponse,
  ImportUploadResponse,
} from "@/features/admin/types/UserImport";
import "./AdminDashboard.css";

const initialForm: CreateUserPayload = {
  numero_cuenta: "",
  nombre: "",
  rol: "alumno",
  nip: "",
  correo: "",
};

const roleLabels: Record<AdminUserRole, string> = {
  administrador: "Administrador",
  docente: "Docente",
  alumno: "Alumno",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [usersPage, setUsersPage] = useState<UsersPage | null>(null);
  const [filters, setFilters] = useState<UserListFilters>({ page: 1 });
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [csvFile, setCsvFile] = useState<File>();
  const [csvError, setCsvError] = useState("");
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(
    null,
  );
  const [importError, setImportError] = useState("");
  const [importRefresh, setImportRefresh] = useState(0);
  const [listRefresh, setListRefresh] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    listUsers(filters)
      .then((response) => {
        if (!isCurrentRequest) return;
        setListError("");
        setUsersPage(response);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        setListError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los usuarios.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setLoadingUsers(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [filters, listRefresh]);

  useEffect(() => {
    if (!importStatus?.id || importStatus.estado !== "en_proceso") return;

    let isCurrentRequest = true;
    let timeoutId: number | undefined;

    const pollStatus = async () => {
      try {
        const status = await getUserImportStatus(importStatus.id);
        if (!isCurrentRequest) return;
        setImportStatus(status);
        if (status.estado === "terminada") {
          setLoadingUsers(true);
          setListRefresh((current) => current + 1);
        } else if (status.estado === "en_proceso") {
          timeoutId = window.setTimeout(pollStatus, 2000);
        }
      } catch (error) {
        if (!isCurrentRequest) return;
        setImportError(
          error instanceof Error
            ? error.message
            : "No se pudo consultar el estado de la importación.",
        );
      }
    };

    timeoutId = window.setTimeout(pollStatus, 2000);
    return () => {
      isCurrentRequest = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [importStatus?.id, importStatus?.estado, importRefresh]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingUsers(true);
    const nextSearch = searchText.trim() || undefined;
    if (nextSearch === filters.buscar) {
      setListRefresh((current) => current + 1);
    }
    setFilters((current) => ({
      ...current,
      buscar: nextSearch,
      page: 1,
    }));
  };

  const handleFilterChange = (
    key: "rol" | "estado",
    value: AdminUserRole | UserStatusFilter | "",
  ) => {
    setLoadingUsers(true);
    if (value === (filters[key] ?? "")) {
      setListRefresh((current) => current + 1);
    }
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUser(true);
    setFormError("");
    setNotice("");

    try {
      const response = await createUser(form);
      setNotice(response.message || "Usuario registrado correctamente.");
      setForm(initialForm);
      setLoadingUsers(true);
      setListRefresh((current) => current + 1);
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el usuario.",
      );
    } finally {
      setSavingUser(false);
    }
  };

  const handleCsvFile = (file?: File) => {
    setCsvError("");
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setCsvFile(undefined);
      setCsvError("Selecciona un archivo con extensión .csv.");
      return;
    }
    setCsvFile(file);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setCsvError("Selecciona un archivo CSV antes de continuar.");
      return;
    }

    setUploadingCsv(true);
    setCsvError("");
    setImportError("");
    setImportStatus(null);
    try {
      const response: ImportUploadResponse = await uploadUsersCsv(csvFile);
      setImportStatus(response);
      setCsvFile(undefined);
      if (response.estado !== "en_proceso") {
        setImportError("El servidor no confirmó que la importación iniciara.");
      }
    } catch (error) {
      setCsvError(
        error instanceof Error
          ? error.message
          : "No se pudo subir el archivo CSV.",
      );
    } finally {
      setUploadingCsv(false);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div className="admin-eyebrow">ADMINISTRACIÓN</div>
        <h1>Panel de administrador</h1>
        <p>Consulta, filtra y registra usuarios.</p>
      </header>

      <CsvImportForm
        file={csvFile}
        fileError={csvError}
        busy={uploadingCsv}
        processing={importStatus?.estado === "en_proceso"}
        onFile={handleCsvFile}
        onImport={handleCsvImport}
      />

      {importStatus && importStatus.estado !== "en_proceso" && (
        <section className="admin-card" aria-live="polite">
          <h2>
            {importStatus.estado === "terminada"
              ? "Importación terminada"
              : "Importación fallida"}
          </h2>
          {importStatus.mensaje && <p>{importStatus.mensaje}</p>}
          {importStatus.estado === "fallida" && (
            <p className="admin-form-error">
              El servidor no pudo completar la importación.
            </p>
          )}
          {Object.keys(importStatus).some(
            (key) => !["id", "estado", "mensaje"].includes(key),
          ) && (
            <pre className="admin-import-report">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(importStatus).filter(
                    ([key]) => !["id", "estado", "mensaje"].includes(key),
                  ),
                ),
                null,
                2,
              )}
            </pre>
          )}
        </section>
      )}

      {importError && importStatus?.estado === "en_proceso" && (
        <section className="admin-card">
          <p className="admin-form-error" role="alert">
            {importError}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setImportError("");
              setImportRefresh((current) => current + 1);
            }}
          >
            Reintentar consulta del estado
          </Button>
        </section>
      )}

      <section className="admin-card">
        <h2>Registrar usuario</h2>
        <form className="admin-user-form" onSubmit={handleCreateUser}>
          <label>
            Número de cuenta
            <input
              name="numero_cuenta"
              value={form.numero_cuenta}
              onChange={(event) =>
                setForm({ ...form, numero_cuenta: event.target.value })
              }
              required
            />
          </label>
          <label>
            Nombre completo
            <input
              name="nombre"
              value={form.nombre}
              onChange={(event) =>
                setForm({ ...form, nombre: event.target.value })
              }
              required
            />
          </label>
          <label>
            Correo
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={(event) =>
                setForm({ ...form, correo: event.target.value })
              }
            />
          </label>
          <label>
            Rol
            <select
              name="rol"
              value={form.rol}
              onChange={(event) =>
                setForm({
                  ...form,
                  rol: event.target.value as AdminUserRole,
                })
              }
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            NIP temporal
            <input
              name="nip"
              type="password"
              autoComplete="new-password"
              value={form.nip}
              onChange={(event) =>
                setForm({ ...form, nip: event.target.value })
              }
              required
            />
          </label>
          {formError && (
            <p className="admin-form-error" role="alert">
              {formError}
            </p>
          )}
          {notice && (
            <p className="admin-success" role="status">
              {notice}
            </p>
          )}
          <Button type="submit" disabled={savingUser}>
            <UserPlus />
            {savingUser ? "Registrando..." : "Registrar usuario"}
          </Button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Usuarios registrados</h2>
        <form className="admin-user-filters" onSubmit={handleSearch}>
          <label className="admin-search">
            Buscar por nombre o número de cuenta
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Nombre o número de cuenta"
            />
          </label>
          <label>
            Rol
            <select
              value={filters.rol ?? ""}
              onChange={(event) =>
                handleFilterChange(
                  "rol",
                  event.target.value as AdminUserRole | "",
                )
              }
            >
              <option value="">Todos</option>
              {Object.entries(roleLabels).map(([value, label]) => (
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
                handleFilterChange(
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
              onClick={() => navigate("/admin/update")}
            >
              <UserCog />
              Actualizar datos
            </Button>
          </div>
        </form>

        {listError && (
          <p className="admin-form-error" role="alert">
            {listError}
          </p>
        )}
        {loadingUsers ? (
          <p className="admin-empty-state" role="status">
            Cargando usuarios...
          </p>
        ) : usersPage ? (
          <>
            {usersPage.data.length ? (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Número de cuenta</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersPage.data.map((user) => (
                      <tr key={user.id}>
                        <td>{user.numero_cuenta}</td>
                        <td>{user.nombre}</td>
                        <td>{user.correo}</td>
                        <td>
                          {user.rol in roleLabels
                            ? roleLabels[user.rol as AdminUserRole]
                            : user.rol}
                        </td>
                        <td>{user.activo ? "Activo" : "Inactivo"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  onClick={() => {
                    setLoadingUsers(true);
                    setFilters((current) => ({
                      ...current,
                      page: usersPage.meta.current_page - 1,
                    }));
                  }}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    usersPage.meta.current_page >= usersPage.meta.last_page
                  }
                  onClick={() => {
                    setLoadingUsers(true);
                    setFilters((current) => ({
                      ...current,
                      page: usersPage.meta.current_page + 1,
                    }));
                  }}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
