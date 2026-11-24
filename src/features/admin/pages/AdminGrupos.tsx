import { useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminGrupoFormDialog } from "@/features/admin/components/AdminGrupoFormDialog";
import { AdminGrupoMembersPanel } from "@/features/admin/components/AdminGrupoMembersPanel";
import { AdminGruposTable } from "@/features/admin/components/AdminGruposTable";
import { useAdminGrupoAlumnos } from "@/features/admin/hooks/useAdminGrupoAlumnos";
import { useAdminGrupoRoster } from "@/features/admin/hooks/useAdminGrupoRoster";
import { useAdminGrupos } from "@/features/admin/hooks/useAdminGrupos";
import { useAdminMaterias } from "@/features/admin/hooks/useAdminMaterias";
import type { AdminGrupo, AdminGrupoDraft } from "@/features/admin/types/AdminGrupo";
import "./AdminGrupos.css";

export function AdminGrupos() {
  const {
    grupos: gruposApi,
    loading: loadingGrupos,
    error: errorGrupos,
    createGrupo,
    creating: creatingGrupo,
    updateGrupo,
    updating: updatingGrupo,
  } = useAdminGrupos();
  const { semestres, loading: loadingSemestres, error: errorSemestres } =
    useAdminMaterias();
  const { alumnos, loading: loadingAlumnos, error: errorAlumnos } =
    useAdminGrupoAlumnos();
  const [gruposLocales, setGruposLocales] = useState<AdminGrupo[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminGrupoDraft>({
    nombre: "",
    semestre_id: "",
    turno: "matutino",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  const grupos = gruposLocales ?? gruposApi;
  const roster = useAdminGrupoRoster(selectedId, alumnos);
  const selected = grupos.find((grupo) => grupo.id === selectedId);
  const editingGrupo = grupos.find((grupo) => grupo.id === editingId);
  const activeCounts = Object.fromEntries(
    grupos.map((grupo) => [grupo.id, grupo.alumnos_activos ?? 0]),
  );
  const canRegister =
    !loadingGrupos &&
    !errorGrupos &&
    !loadingSemestres &&
    !errorSemestres &&
    semestres.length > 0;

  const changeSelection = (id: number) => {
    setSelectedId(id);
    roster.setPage(1);
    roster.setConsulta(undefined);
    const panel = panelRef.current;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    if (bounds.top >= window.innerHeight || bounds.bottom <= 0) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const start = (grupo?: AdminGrupo) => {
    setEditingId(grupo?.id ?? null);
    setDraft(
      grupo
        ? {
            nombre: grupo.nombre,
            semestre_id: String(grupo.semestre_id),
            turno: grupo.turno ?? "",
          }
        : {
            nombre: "",
            semestre_id: semestres[0] ? String(semestres[0].id) : "",
            turno: "matutino",
          },
    );
    setError("");
    setOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombre = draft.nombre.trim();
    const semestreId = Number(draft.semestre_id);
    const semestre = semestres.find((item) => item.id === semestreId);

    if (!nombre) {
      setError("Escribe el nombre del grupo.");
      return;
    }
    if (!semestre) {
      setError("Selecciona un semestre válido.");
      return;
    }
    if (
      grupos.some(
        (grupo) =>
          grupo.id !== editingId &&
          grupo.nombre.toLowerCase() === nombre.toLowerCase() &&
          grupo.semestre_id === semestreId,
      )
    ) {
      setError("Ya existe un grupo con ese nombre en el semestre.");
      return;
    }
    const grupoActual = grupos.find((grupo) => grupo.id === editingId);
    if (!grupoActual && editingId !== null) {
      const message = "No se encontró el grupo que intentas editar.";
      setError(message);
      toast.error(message);
      return;
    }

    const payload = {
      semestre_id: semestreId,
      nombre,
      turno: draft.turno || null,
    };

    try {
      let response;
      if (editingId === null) {
        response = await createGrupo(payload);
      } else if (grupoActual) {
        response = await updateGrupo({
          id: editingId,
          payload,
          grupoActual,
        });
      } else {
        return;
      }
      setGruposLocales((current) => {
        if (current === null) return null;
        return current.some((grupo) => grupo.id === response.grupo.id)
          ? current.map((grupo) =>
              grupo.id === response.grupo.id
                ? { ...grupo, ...response.grupo }
                : grupo,
            )
          : [...current, response.grupo];
      });
      setSelectedId(response.grupo.id);
      roster.setPage(1);
      roster.setConsulta(undefined);
      setNotice(response.message);
      toast.success(response.message);
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : editingId === null
            ? "No se pudo registrar el grupo."
            : "No se pudo actualizar el grupo.";
      setError(message);
      toast.error(message);
    }
  };

  const add = async (alumnoId: number) => {
    try {
      const result = await roster.add(alumnoId);
      if (!result) return;

      const omitted = result.response.omitidos.find(
        (item) => item.alumno_id === result.alumno.id,
      );
      if (omitted) {
        const message =
          omitted.motivo ?? "El alumno no se pudo agregar al grupo.";
        setNotice(message);
        toast.info(message);
        return;
      }

      setNotice(result.response.message);
      toast.success(result.response.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron agregar los alumnos al grupo.";
      toast.error(message);
    }
  };

  const toggle = async (alumnoId: number) => {
    try {
      const result = await roster.toggle(alumnoId);
      if (result) {
        setNotice(result.message);
        toast.success(result.message);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del alumno en el grupo.";
      toast.error(message);
    }
  };

  const importar = () => {
    const imp = roster.importar();
    if (imp) setNotice(`Importación #${imp.id} terminada.`);
  };

  const readCsv = async (file: File | undefined) => {
    const loaded = await roster.readCsv(file);
    if (loaded && file) {
      setNotice(`Archivo ${file.name} cargado.`);
    }
  };

  return (
    <section className="admin-grupos grupos-page">
      <header className="admin-section-heading admin-grupos-heading">
        <div>
          <h2>Grupos</h2>
          <p>Registra grupos y administra sus alumnos.</p>
        </div>
        <Button
          type="button"
          className="admin-grupos-button"
          onClick={() => start()}
          disabled={!canRegister}
        >
          <Plus aria-hidden="true" />
          Registrar grupo
        </Button>
      </header>

      {notice && <p className="admin-success" role="status">{notice}</p>}
      {errorSemestres && (
        <p className="admin-form-error" role="alert">{errorSemestres}</p>
      )}
      {errorGrupos && (
        <p className="admin-form-error" role="alert">{errorGrupos}</p>
      )}
      {errorAlumnos && (
        <p className="admin-form-error" role="alert">{errorAlumnos}</p>
      )}

      <div className="admin-grupos-layout">
        <section
          className="admin-card admin-grupos-list"
          aria-label="Grupos registrados"
        >
          {loadingGrupos ? (
            <p className="admin-empty-state" role="status">Cargando datos...</p>
          ) : errorGrupos ? null : grupos.length === 0 ? (
            <p className="admin-empty-state">
              Aún no hay grupos. Registra uno para comenzar.
            </p>
          ) : (
            <AdminGruposTable
              grupos={grupos}
              semestres={semestres}
              selectedId={selectedId}
              activeCounts={activeCounts}
              onSelect={changeSelection}
              onEdit={start}
            />
          )}
        </section>

        {selected ? (
          <section ref={panelRef} className="admin-grupos-members">
            <AdminGrupoMembersPanel
              grupo={selected}
              miembros={roster.miembros}
              disponibles={roster.disponibles}
              loadingAlumnos={loadingAlumnos || roster.loadingMembers}
              loadingMembers={roster.loadingMembers}
              adding={roster.adding}
              updatingMember={roster.updatingMember}
              membersError={roster.membersError}
              pagination={roster.page?.meta ?? null}
              csv={roster.csv}
              csvError={roster.csvError}
              importId={roster.importId}
              consulta={roster.consulta}
              onAdd={add}
              onToggle={toggle}
              onCsvChange={(value) => {
                roster.setCsv(value);
                roster.clearCsvError();
              }}
              onReadCsv={(file) => void readCsv(file)}
              onImport={importar}
              onImportIdChange={roster.setImportId}
              onLookup={roster.lookupImport}
              onPageChange={roster.setPage}
            />
          </section>
        ) : (
          <p className="admin-card admin-empty-state">
            Selecciona un grupo para administrar sus alumnos.
          </p>
        )}
      </div>

      {open && (
        <AdminGrupoFormDialog
          editing={editingId !== null}
          semesterLocked={
            editingGrupo !== undefined && (editingGrupo.total_cursos ?? 0) > 0
          }
          draft={draft}
          semestres={semestres}
          error={error}
          saving={creatingGrupo || updatingGrupo}
          onDraftChange={(nextDraft) => {
            setDraft(nextDraft);
            setError("");
          }}
          onSubmit={save}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
