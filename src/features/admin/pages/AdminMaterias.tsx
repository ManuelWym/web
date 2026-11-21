import { useCallback, useMemo, useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMateriaFormDialog } from "@/features/admin/components/AdminMateriaFormDialog";
import { AdminMateriasTable } from "@/features/admin/components/AdminMateriasTable";
import { useAdminMaterias } from "@/features/admin/hooks/useAdminMaterias";
import type {
  AdminMateria,
  MateriaPayload,
} from "@/features/admin/types/AdminMateria";
import "./AdminMaterias.css";

type MateriaFilter = "todas" | "activas" | "inactivas";

export function AdminMaterias() {
  const {
    materias,
    semestres,
    loading,
    error,
    saving,
    updatingStatus,
    formError,
    setFormError,
    saveMateria,
    toggleMateria,
  } = useAdminMaterias();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MateriaFilter>("todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMateria | null>(null);

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    return materias.filter(
      (materia) =>
        (filter === "todas" || materia.activa === (filter === "activas")) &&
        [
          materia.id,
          materia.semestre_id,
          semestres.find((semestre) => semestre.id === materia.semestre_id)
            ?.nombre,
          materia.clave,
          materia.nombre,
        ].some((value) => String(value ?? "").toLowerCase().includes(text)),
    );
  }, [filter, materias, search, semestres]);

  const openForm = useCallback(
    (materia: AdminMateria | null) => {
      setEditing(materia);
      setFormError("");
      setOpen(true);
    },
    [setFormError],
  );

  const handleToggle = useCallback(
    (materia: AdminMateria) => void toggleMateria(materia),
    [toggleMateria],
  );

  const handleSubmit = async (payload: MateriaPayload) => {
    const saved = await saveMateria(payload, editing?.id ?? null);
    if (saved) setOpen(false);
  };

  const canRegister = !loading && !error && semestres.length > 0;

  return (
    <section>
      <header className="admin-section-heading materias-heading">
        <div>
          <h2>Materias</h2>
          <p>Consulta, registra, edita y activa o desactiva materias.</p>
        </div>
        <Button
          type="button"
          onClick={() => openForm(null)}
          disabled={!canRegister}
        >
          <Plus aria-hidden="true" />
          Registrar materia
        </Button>
      </header>

      <section className="admin-card" aria-labelledby="admin-materias-heading">
        <h2 id="admin-materias-heading" className="materias-card-title">
          <BookOpen size={20} aria-hidden="true" />
          Materias registradas
          <span className="admin-count-pill">{visible.length}</span>
        </h2>

        <div className="materias-toolbar">
          <label className="materias-search">
            Buscar materias
            <span className="materias-search-field">
              <Search
                size={16}
                aria-hidden="true"
                className="materias-search-icon"
              />
              <input
                type="search"
                aria-label="Buscar por nombre, clave, ID o semestre"
                placeholder="Nombre, clave, ID o semestre"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </span>
          </label>
          <label className="materias-filter">
            Estado
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as MateriaFilter)
              }
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="admin-form-error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && semestres.length === 0 && (
          <p className="admin-empty-state materias-notice" role="status">
            No hay semestres disponibles para registrar materias.
          </p>
        )}
        {loading ? (
          <p className="admin-empty-state materias-notice" role="status">
            Cargando materias...
          </p>
        ) : (
          !error && (
            <AdminMateriasTable
              materias={visible}
              semestres={semestres}
              updatingStatus={updatingStatus}
              onEdit={openForm}
              onToggle={handleToggle}
            />
          )
        )}
      </section>

      {open && (
        <AdminMateriaFormDialog
          materia={editing}
          semestres={semestres}
          saving={saving}
          error={formError}
          onErrorChange={setFormError}
          onSubmit={(payload) => void handleSubmit(payload)}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
