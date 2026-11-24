import { Pencil } from "lucide-react";
import type { AdminCurso } from "@/features/admin/types/AdminCurso";

interface Props {
  cursos: AdminCurso[];
  selectedId: number | null;
  roman: (value: number) => string;
  onSelect: (curso: AdminCurso) => void;
  onEditDocente: (curso: AdminCurso) => void;
}

export function AdminCursosTable({ cursos, selectedId, roman, onSelect, onEditDocente }: Props) {
  return (
    <div className="cursos-table-wrap">
      <table className="cursos-table" aria-label="Cursos registrados">
        <thead>
          <tr>
            <th>Nombre de la materia</th>
            <th>Clave</th>
            <th>Grupo</th>
            <th>Semestre</th>
            <th>Alumnos activos</th>
            <th>Docente</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr
              key={curso.id}
              className="cursos-row-clickable"
              tabIndex={0}
              aria-current={curso.id === selectedId ? "true" : undefined}
              onClick={() => onSelect(curso)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(curso);
                }
              }}
            >
              <td className="cursos-name">{curso.nombre}</td>
              <td>{curso.clave}</td>
              <td className="cursos-group">
                <strong>{curso.grupo.nombre}</strong>
                <small>{curso.grupo.semestre?.nombre ?? `Semestre ${curso.grupo.semestre_id}`}</small>
              </td>
              <td>{roman(curso.grupo.semestre?.numero ?? curso.grupo.semestre_id)}</td>
              <td className="cursos-students">
                <strong>{curso.grupo.alumnos_activos ?? 0}</strong>
              </td>
              <td className="cursos-teacher">
                <span className="cursos-teacher-cell">
                  {curso.docente ? curso.docente.nombre : <span className="cursos-no-teacher">Sin docente</span>}
                  <button
                    type="button"
                    className="cursos-edit-teacher"
                    aria-label={`Editar docente de ${curso.nombre} · ${curso.grupo.nombre}`}
                    title="Editar docente"
                    onClick={(event) => { event.stopPropagation(); onEditDocente(curso); }}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                </span>
              </td>
            </tr>
          ))}
          {cursos.length === 0 && (
            <tr><td colSpan={6} className="admin-empty-state cursos-empty">No se encontraron cursos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
