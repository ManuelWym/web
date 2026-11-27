import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Check, CircleAlert, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCurso, AdminCursoDocente } from "@/features/admin/types/AdminCurso";

interface Props {
  curso: AdminCurso;
  docentes: AdminCursoDocente[];
  saving: boolean;
  onSubmit: (docenteId: number) => void;
  onClose: () => void;
}

function normalizarTexto(value: string): string {
  return value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

export function AdminCursoDocenteDialog({ curso, docentes, saving, onSubmit, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [docenteId, setDocenteId] = useState<number | null>(curso.docente_id);
  const [error, setError] = useState("");
  const [buscarDocente, setBuscarDocente] = useState("");
  const consultaDocente = normalizarTexto(buscarDocente.trim());
  const docentesCoincidentes = docentes.filter((docente) =>
    normalizarTexto(docente.nombre).includes(consultaDocente),
  );
  const docenteSeleccionado = docentes.find((docente) => docente.id === docenteId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!docenteSeleccionado) {
      setError("Selecciona un docente activo válido.");
      return;
    }
    onSubmit(docenteSeleccionado.id);
  };

  return (
    <dialog ref={dialogRef} className="cursos-dialog cursos-docente-dialog" onClose={onClose} aria-labelledby="admin-curso-docente-title">
      <header className="cursos-dialog-header">
        <div><h2 id="admin-curso-docente-title">Asignar docente</h2><p>{curso.nombre} · {curso.grupo.nombre}</p></div>
        <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario" onClick={onClose}><X aria-hidden="true" /></Button>
      </header>
      <form className="cursos-form" onSubmit={submit}>
        <label>
          Buscar docente
          <span className="cursos-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Nombre del docente"
              value={buscarDocente}
              aria-controls="cursos-docente-options"
              onChange={(event) => setBuscarDocente(event.target.value)}
            />
          </span>
        </label>

        <div id="cursos-docente-options" className="cursos-docente-options" role="listbox" aria-label="Docentes">
          {docentesCoincidentes.map((docente) => (
            <button
              key={docente.id}
              type="button"
              role="option"
              aria-selected={docente.id === docenteId}
              onClick={() => {
                setDocenteId(docente.id);
                setError("");
              }}
            >
              <span>{docente.nombre}</span>
              {docente.id === docenteId && <Check size={16} aria-hidden="true" />}
            </button>
          ))}
          {docentesCoincidentes.length === 0 && (
            <p className="cursos-materia-no-results" role="status">
              {consultaDocente ? "No se encontraron docentes con ese nombre." : "No hay docentes activos."}
            </p>
          )}
        </div>

        <p className="cursos-docente-selected" aria-live="polite">
          Docente seleccionado: <strong>{docenteSeleccionado?.nombre ?? "ninguno"}</strong>
        </p>

        {error && <p className="admin-form-error cursos-form-error" role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>}
        <div className="cursos-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}><Save aria-hidden="true" />{saving ? "Guardando..." : "Guardar docente"}</Button>
        </div>
      </form>
    </dialog>
  );
}
