import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { CircleAlert, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AdminMateria,
  AdminSemestre,
  MateriaPayload,
} from "@/features/admin/types/AdminMateria";

interface MateriaDraft {
  semestre_id: string;
  clave: string;
  nombre: string;
}

interface AdminMateriaFormDialogProps {
  materia: AdminMateria | null;
  semestres: AdminSemestre[];
  saving: boolean;
  error: string;
  onErrorChange: (message: string) => void;
  onSubmit: (payload: MateriaPayload) => void;
  onClose: () => void;
}

function toDraft(materia: AdminMateria | null): MateriaDraft {
  return materia
    ? {
        semestre_id: String(materia.semestre_id),
        clave: materia.clave,
        nombre: materia.nombre,
      }
    : { semestre_id: "", clave: "", nombre: "" };
}

// Se monta solo mientras el formulario está abierto: el borrador se inicializa
// con la materia a editar (o vacío) cada vez que se abre.
export function AdminMateriaFormDialog({
  materia,
  semestres,
  saving,
  error,
  onErrorChange,
  onSubmit,
  onClose,
}: AdminMateriaFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<MateriaDraft>(() => toDraft(materia));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const change = (field: keyof MateriaDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    onErrorChange("");
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const semestreId = Number(draft.semestre_id);
    if (!semestres.some((semestre) => semestre.id === semestreId)) {
      onErrorChange("Selecciona un semestre válido.");
      return;
    }
    onSubmit({
      semestre_id: semestreId,
      clave: draft.clave.trim(),
      nombre: draft.nombre.trim(),
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="materias-dialog"
      onClose={onClose}
      aria-labelledby="admin-materia-dialog-title"
    >
      <header className="materias-dialog-header">
        <div>
          <h2 id="admin-materia-dialog-title">
            {materia ? "Editar materia" : "Registrar materia"}
          </h2>
          <p>{materia ? materia.nombre : "Ingresa los datos de la materia."}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cerrar formulario"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </header>

      <form className="materias-form" onSubmit={submit}>
        <label>
          Semestre
          <select
            name="semestre_id"
            required
            value={draft.semestre_id}
            onChange={(event) => change("semestre_id", event.target.value)}
          >
            <option value="" disabled>
              Selecciona un semestre
            </option>
            {semestres.map((semestre) => (
              <option key={semestre.id} value={semestre.id}>
                {semestre.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Clave
          <input
            name="clave"
            required
            maxLength={20}
            value={draft.clave}
            onChange={(event) => change("clave", event.target.value)}
          />
        </label>
        <label>
          Nombre
          <input
            name="nombre"
            required
            maxLength={150}
            value={draft.nombre}
            onChange={(event) => change("nombre", event.target.value)}
          />
        </label>

        {error && (
          <p className="admin-form-error materias-form-error" role="alert">
            <CircleAlert size={14} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="materias-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save aria-hidden="true" />
            {saving
              ? "Guardando..."
              : materia
                ? "Guardar cambios"
                : "Registrar materia"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
