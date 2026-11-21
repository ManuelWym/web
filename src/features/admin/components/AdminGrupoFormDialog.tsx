import { useEffect, useRef, type FormEvent } from "react";
import { CircleAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminGrupoDraft } from "@/features/admin/types/AdminGrupo";
import type { AdminSemestre } from "@/features/admin/types/AdminMateria";

interface AdminGrupoFormDialogProps {
  editing: boolean;
  semesterLocked: boolean;
  draft: AdminGrupoDraft;
  semestres: AdminSemestre[];
  error: string;
  saving: boolean;
  onDraftChange: (draft: AdminGrupoDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function AdminGrupoFormDialog({
  editing,
  semesterLocked,
  draft,
  semestres,
  error,
  saving,
  onDraftChange,
  onSubmit,
  onClose,
}: AdminGrupoFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="materias-dialog"
      aria-labelledby="admin-grupo-dialog-title"
      onClose={onClose}
    >
      <header className="materias-dialog-header">
        <div>
          <h2 id="admin-grupo-dialog-title">
            {editing ? "Editar grupo" : "Registrar grupo"}
          </h2>
          <p>{editing ? draft.nombre : "Nuevo grupo"}</p>
        </div>
      </header>
      <form className="materias-form" onSubmit={onSubmit}>
        <label>
          Nombre
          <input
            required
            value={draft.nombre}
            onChange={(event) =>
              onDraftChange({ ...draft, nombre: event.target.value })
            }
          />
        </label>
        <label>
          Semestre
          <select
            required
            value={draft.semestre_id}
            disabled={semesterLocked}
            onChange={(event) =>
              onDraftChange({ ...draft, semestre_id: event.target.value })
            }
          >
            {semestres.map((semestre) => (
              <option key={semestre.id} value={semestre.id}>
                {semestre.nombre}
              </option>
            ))}
          </select>
          {semesterLocked && (
            <span className="text-sm text-muted-foreground">
              No se puede cambiar el semestre porque el grupo ya tiene cursos.
            </span>
          )}
        </label>
        <label>
          Turno
          <select
            value={draft.turno}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                turno: event.target.value as AdminGrupoDraft["turno"],
              })
            }
          >
            <option value="matutino">Matutino</option>
            <option value="vespertino">Vespertino</option>
            <option value="">Sin turno</option>
          </select>
        </label>
        {error && (
          <p className="admin-form-error flex items-center gap-1" role="alert">
            <CircleAlert size={14} aria-hidden="true" />
            {error}
          </p>
        )}
        <div className="materias-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="admin-grupos-button"
            disabled={saving}
          >
            <Save aria-hidden="true" />
            {saving
              ? editing
                ? "Guardando..."
                : "Registrando..."
              : editing
                ? "Guardar cambios"
                : "Registrar grupo"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
