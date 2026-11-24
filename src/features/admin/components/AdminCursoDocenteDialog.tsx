import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { CircleAlert, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCurso, AdminCursoDocente } from "@/features/admin/types/AdminCurso";

interface Props {
  curso: AdminCurso;
  docentes: AdminCursoDocente[];
  saving: boolean;
  onSubmit: (docenteId: number) => void;
  onClose: () => void;
}

export function AdminCursoDocenteDialog({ curso, docentes, saving, onSubmit, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [docenteId, setDocenteId] = useState(curso.docente_id ? String(curso.docente_id) : "");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(docenteId);
    if (!docentes.some((docente) => docente.id === value)) {
      setError("Selecciona un docente activo válido.");
      return;
    }
    onSubmit(value);
  };

  return (
    <dialog ref={dialogRef} className="cursos-dialog cursos-docente-dialog" onClose={onClose} aria-labelledby="admin-curso-docente-title">
      <header className="cursos-dialog-header">
        <div><h2 id="admin-curso-docente-title">Asignar docente</h2><p>{curso.nombre} · {curso.grupo.nombre}</p></div>
        <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario" onClick={onClose}><X aria-hidden="true" /></Button>
      </header>
      <form className="cursos-form" onSubmit={submit}>
        <label>
          Docente
          <select required value={docenteId} onChange={(event) => { setDocenteId(event.target.value); setError(""); }}>
            <option value="" disabled>Selecciona un docente</option>
            {docentes.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombre}</option>)}
          </select>
        </label>
        {error && <p className="admin-form-error cursos-form-error" role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>}
        <div className="cursos-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}><Save aria-hidden="true" />{saving ? "Guardando..." : "Guardar docente"}</Button>
        </div>
      </form>
    </dialog>
  );
}
