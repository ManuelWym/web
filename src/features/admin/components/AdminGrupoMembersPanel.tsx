import { useState, type FormEvent } from "react";
import {
  CircleAlert,
  Search,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AdminGrupo,
  AdminGrupoAlumnosPage,
  AdminGrupoImportacion,
  AdminGrupoMiembro,
} from "@/features/admin/types/AdminGrupo";
import type { AdminUser } from "@/features/admin/types/AdminUser";

interface AdminGrupoMembersPanelProps {
  grupo: AdminGrupo;
  miembros: AdminGrupoMiembro[];
  disponibles: AdminUser[];
  loadingAlumnos: boolean;
  loadingMembers: boolean;
  adding: boolean;
  updatingMember: boolean;
  membersError: string;
  pagination: AdminGrupoAlumnosPage["meta"] | null;
  csv: string;
  csvError: string;
  importId: string;
  consulta: AdminGrupoImportacion | null | undefined;
  onAdd: (id: number) => void;
  onToggle: (id: number) => void;
  onCsvChange: (value: string) => void;
  onReadCsv: (file: File | undefined) => void;
  onImport: () => void;
  onImportIdChange: (value: string) => void;
  onLookup: () => void;
  onPageChange: (page: number) => void;
}

export function AdminGrupoMembersPanel({
  grupo,
  miembros,
  disponibles,
  loadingAlumnos,
  loadingMembers,
  adding,
  updatingMember,
  membersError,
  pagination,
  csv,
  csvError,
  importId,
  consulta,
  onAdd,
  onToggle,
  onCsvChange,
  onReadCsv,
  onImport,
  onImportIdChange,
  onLookup,
  onPageChange,
}: AdminGrupoMembersPanelProps) {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const searchResults = search
    ? disponibles.filter((alumno) =>
        `${alumno.nombre} ${alumno.numero_cuenta}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : [];
  const searchPageSize = 10;
  const searchPageCount = Math.ceil(searchResults.length / searchPageSize);
  const currentSearchPage = Math.min(searchPage, Math.max(searchPageCount, 1));
  const paginatedSearchResults = searchResults.slice(
    (currentSearchPage - 1) * searchPageSize,
    currentSearchPage * searchPageSize,
  );
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
    setSearchPage(1);
  };

  return (
    <section
      className="admin-card min-w-0"
      aria-label={`Alumnos del grupo ${grupo.nombre}`}
    >
      <h2 className="flex items-center gap-2">
        <Users size={18} aria-hidden="true" />
        Alumnos del grupo {grupo.nombre}
        <span className="admin-count-pill">
          {pagination?.total ?? miembros.length}
        </span>
      </h2>
      {loadingMembers ? (
        <p className="admin-empty-state" role="status">
          Cargando alumnos del grupo...
        </p>
      ) : membersError ? (
        <p className="admin-form-error" role="alert">{membersError}</p>
      ) : miembros.length === 0 ? (
        <p className="admin-empty-state">Este grupo no tiene alumnos.</p>
      ) : (
        <>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N.º cuenta</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {miembros.map((alumno) => (
                  <tr key={alumno.alumno_id}>
                    <td>{alumno.numero_cuenta}</td>
                    <td>{alumno.nombre}</td>
                    <td>{alumno.activo ? "Activo" : "Baja"}</td>
                    <td>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggle(alumno.alumno_id)}
                        disabled={updatingMember}
                      >
                        {alumno.activo ? (
                          <>
                            <UserMinus aria-hidden="true" /> Dar de baja
                          </>
                        ) : (
                          <>
                            <UserCheck aria-hidden="true" /> Reingresar
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.last_page > 1 && (
            <div className="admin-pagination">
              <span>
                Página {pagination.current_page} de {pagination.last_page} ·{" "}
                {pagination.total} alumnos
              </span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingMembers || pagination.current_page <= 1}
                  onClick={() => onPageChange(pagination.current_page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    loadingMembers ||
                    pagination.current_page >= pagination.last_page
                  }
                  onClick={() => onPageChange(pagination.current_page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <h2 className="flex items-center gap-2">
        <UserPlus size={18} aria-hidden="true" /> Agregar alumno
      </h2>
      <form
        className="admin-grupos-row flex flex-wrap items-end gap-2"
        onSubmit={handleSearch}
      >
        <label className="admin-search grid min-w-0 flex-1 gap-1.5 text-sm text-muted-foreground">
          Buscar por nombre o número de cuenta
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Nombre o número de cuenta"
            disabled={loadingAlumnos || disponibles.length === 0}
          />
        </label>
        <Button type="submit" disabled={loadingAlumnos || !searchText.trim()}>
          <Search aria-hidden="true" />
          Buscar
        </Button>
      </form>
      {loadingAlumnos ? (
        <p className="admin-empty-state" role="status">
          Cargando alumnos disponibles...
        </p>
      ) : disponibles.length === 0 ? (
        <p className="admin-empty-state">No hay alumnos disponibles para agregar.</p>
      ) : search ? (
        searchResults.length ? (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>N.º cuenta</th>
                    <th>Nombre</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedSearchResults.map((alumno) => (
                    <tr key={alumno.id}>
                      <td>{alumno.numero_cuenta}</td>
                      <td>{alumno.nombre}</td>
                      <td>
                        <Button
                          type="button"
                          className="admin-grupos-button"
                          onClick={() => onAdd(alumno.id)}
                          disabled={adding}
                        >
                          {adding ? "Agregando..." : "Agregar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {searchPageCount > 1 && (
              <div className="admin-pagination">
                <span>
                  {searchResults.length} alumnos · Página {currentSearchPage} de{" "}
                  {searchPageCount}
                </span>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentSearchPage <= 1}
                    onClick={() => setSearchPage(currentSearchPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentSearchPage >= searchPageCount}
                    onClick={() => setSearchPage(currentSearchPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="admin-empty-state">
            No se encontraron alumnos con ese nombre o número de cuenta.
          </p>
        )
      ) : (
        <p className="admin-empty-state">
          Busca por nombre o número de cuenta para mostrar alumnos disponibles.
        </p>
      )}

      <h2 className="flex items-center gap-2">
        <Upload size={18} aria-hidden="true" /> Importar alumnos desde CSV
      </h2>
      <label className="admin-file">
        <Upload size={16} aria-hidden="true" />
        Seleccionar archivo CSV
        <input
          className="admin-file-input"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => onReadCsv(event.target.files?.[0])}
        />
      </label>
      <textarea
        aria-label="CSV de alumnos"
        rows={4}
        value={csv}
        onChange={(event) => onCsvChange(event.target.value)}
      />
      {csvError && (
        <p className="admin-form-error" role="alert">{csvError}</p>
      )}
      <Button
        type="button"
        className="admin-grupos-button"
        onClick={onImport}
      >
        <Upload aria-hidden="true" /> Importar alumnos
      </Button>

      <h2 className="flex items-center gap-2">
        <Search size={18} aria-hidden="true" /> Consultar importación
      </h2>
      <div className="admin-grupos-row flex flex-wrap gap-2">
        <input
          className="min-h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3"
          aria-label="ID de importación"
          placeholder="ID de importación"
          value={importId}
          onChange={(event) => onImportIdChange(event.target.value)}
        />
        <Button type="button" variant="outline" onClick={onLookup}>
          Consultar
        </Button>
      </div>
      {consulta === null && (
        <p className="admin-form-error flex items-center gap-1" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          No se encontró esa importación en este grupo.
        </p>
      )}
      {consulta && (
        <div className="admin-import-summary">
          <h3>Importación #{consulta.id} · Terminada</h3>
          <span>Agregados: {consulta.agregados.length}</span>
          <span>Omitidos: {consulta.omitidos.length}</span>
          <span>Con error: {consulta.errores.length}</span>
          {[...consulta.omitidos, ...consulta.errores].map((message) => (
            <span key={message} className="admin-form-error">
              {message}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
