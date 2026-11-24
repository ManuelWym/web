import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { CircleAlert, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCursoDocente, AdminCursoPayload } from "@/features/admin/types/AdminCurso";
import type { AdminGrupo } from "@/features/admin/types/AdminGrupo";
import type { AdminMateria, AdminSemestre } from "@/features/admin/types/AdminMateria";

interface Props {
  materias: AdminMateria[];
  grupos: AdminGrupo[];
  semestres: AdminSemestre[];
  docentes: AdminCursoDocente[];
  saving: boolean;
  onSubmit: (payload: AdminCursoPayload) => void;
  onClose: () => void;
}

export function AdminCursoFormDialog({ materias, grupos, semestres, docentes, saving, onSubmit, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [materiaId, setMateriaId] = useState("");
  const [buscarMateria, setBuscarMateria] = useState("");
  const [mostrarOpcionesMateria, setMostrarOpcionesMateria] = useState(false);
  const [grupoId, setGrupoId] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [error, setError] = useState("");
  const materia = materias.find((item) => String(item.id) === materiaId);
  const materiaSemestre = materia
    ? semestres.find((semestre) => semestre.id === materia.semestre_id)
    : null;
  const gruposCompatibles = materia
    ? grupos.filter((grupo) => grupo.semestre_id === materia.semestre_id)
    : grupos;
  const consultaMateria = buscarMateria.trim().toLocaleLowerCase();
  const materiasCoincidentes = materias.filter((item) => {
    if (!item.activa) return false;
    return (
      !consultaMateria ||
      item.nombre.toLocaleLowerCase().includes(consultaMateria) ||
      item.clave.toLocaleLowerCase().includes(consultaMateria)
    );
  });
  const materiasDisponibles = materiasCoincidentes.some(
    (item) => String(item.id) === materiaId,
  ) || !materia
    ? materiasCoincidentes
    : [...materiasCoincidentes, materia];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const materiaValue = Number(materiaId);
    const grupoValue = Number(grupoId);
    const selectedMateria = materias.find((item) => item.id === materiaValue && item.activa);
    const selectedGrupo = grupos.find((item) => item.id === grupoValue);
    if (!selectedMateria || !selectedGrupo) {
      setError("Selecciona una materia activa y un grupo válido.");
      return;
    }
    if (selectedMateria.semestre_id !== selectedGrupo.semestre_id) {
      setError("La materia y el grupo deben pertenecer al mismo semestre.");
      return;
    }
    onSubmit({
      materia_id: materiaValue,
      grupo_id: grupoValue,
      docente_id: docenteId ? Number(docenteId) : null,
    });
  };

  return (
    <dialog ref={dialogRef} className="cursos-dialog" onClose={onClose} aria-labelledby="admin-curso-dialog-title">
      <header className="cursos-dialog-header">
        <div>
          <h2 id="admin-curso-dialog-title">Registrar curso</h2>
          <p>Une una materia activa con un grupo del mismo semestre.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Cerrar formulario" onClick={onClose}>
          <X aria-hidden="true" />
        </Button>
      </header>
      <form className="cursos-form" onSubmit={submit}>
        <label className="cursos-materia-search">
          Buscar materia
          <span className="cursos-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar materia por nombre o clave"
              placeholder="Nombre o clave de la materia"
              value={buscarMateria}
              aria-expanded={mostrarOpcionesMateria && consultaMateria.length > 0}
              aria-controls="cursos-materia-options"
              onChange={(event) => {
                setBuscarMateria(event.target.value);
                setMostrarOpcionesMateria(true);
              }}
            />
          </span>
          {mostrarOpcionesMateria && consultaMateria && (
            <div id="cursos-materia-options" className="cursos-materia-options" role="listbox" aria-label="Materias coincidentes">
              {materiasCoincidentes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={String(item.id) === materiaId}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setMateriaId(String(item.id));
                    setBuscarMateria(item.nombre);
                    setMostrarOpcionesMateria(false);
                    setGrupoId("");
                    setError("");
                  }}
                >
                  <span>{item.nombre}</span>
                  <small>{item.clave}</small>
                </button>
              ))}
              {materiasCoincidentes.length === 0 && (
                <p className="cursos-materia-no-results" role="status">No se encontraron materias activas.</p>
              )}
            </div>
          )}
        </label>
        <label>
          Materia
          <select
            required
            value={materiaId}
            onChange={(event) => {
              setMateriaId(event.target.value);
              setGrupoId("");
              setError("");
            }}
          >
            <option value="" disabled>Selecciona una materia</option>
            {materiasDisponibles.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre} · {item.clave}</option>
            ))}
          </select>
        </label>
        {materiasDisponibles.length === 0 && !mostrarOpcionesMateria && (
          <p className="admin-empty-state" role="status">No se encontraron materias activas con esa búsqueda.</p>
        )}
        <div className="cursos-form-columns">
          <label>Nombre<input readOnly value={materia?.nombre ?? ""} /></label>
          <label>Clave<input readOnly value={materia?.clave ?? ""} /></label>
          <label>
            Semestre
            <input
              readOnly
              value={
                materiaSemestre
                  ? `${materiaSemestre.nombre} (${materiaSemestre.numero}º)`
                  : ""
              }
              placeholder="Se muestra al seleccionar una materia"
            />
          </label>
        </div>
        <label>
          Grupo
          <select required value={grupoId} onChange={(event) => { setGrupoId(event.target.value); setError(""); }}>
            <option value="" disabled>Selecciona un grupo</option>
            {gruposCompatibles.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} · {semestres.find((semestre) => semestre.id === grupo.semestre_id)?.nombre ?? `Semestre ${grupo.semestre_id}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Docente
          <select value={docenteId} onChange={(event) => setDocenteId(event.target.value)}>
            <option value="">Sin docente</option>
            {docentes.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombre}</option>)}
          </select>
        </label>
        {error && <p className="admin-form-error cursos-form-error" role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>}
        <div className="cursos-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}><Save aria-hidden="true" />{saving ? "Guardando..." : "Registrar curso"}</Button>
        </div>
      </form>
    </dialog>
  );
}
