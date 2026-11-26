import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCursoAlumnos } from "@/features/cursos/services/CursoService";

interface CursoAlumnosPanelProps {
  cursoId: number;
}

export function CursoAlumnosPanel({ cursoId }: CursoAlumnosPanelProps) {
  const [buscar, setBuscar] = useState("");
  const [page, setPage] = useState(1);
  const alumnosQuery = useQuery({
    queryKey: ["curso", cursoId, "alumnos", buscar.trim(), page],
    queryFn: () => listCursoAlumnos(cursoId, { buscar: buscar.trim() || undefined, page }),
  });
  const alumnosPage = alumnosQuery.data;
  const meta = alumnosPage?.meta;
  const from = meta && meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const to = meta ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <section className="course-students" aria-labelledby="course-students-title">
      <div className="course-students-heading">
        <div>
          <span className="course-eyebrow">PARTICIPANTES</span>
          <h2 id="course-students-title"><Users aria-hidden="true" /> Alumnos del curso</h2>
          <p>Solo se muestran los alumnos activos del grupo.</p>
        </div>
        <span className="course-count" aria-label={`${meta?.total ?? 0} alumnos`}>
          {meta?.total ?? 0}
        </span>
      </div>

      <label className="course-student-search">
        Buscar alumno
        <span>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={buscar}
            placeholder="Nombre o número de cuenta"
            onChange={(event) => {
              setBuscar(event.target.value);
              setPage(1);
            }}
          />
        </span>
      </label>

      {alumnosQuery.isPending ? (
        <p className="course-empty" role="status">Cargando alumnos…</p>
      ) : alumnosQuery.error ? (
        <p className="course-error" role="alert">
          {alumnosQuery.error instanceof Error ? alumnosQuery.error.message : "No se pudieron cargar los alumnos."}
        </p>
      ) : (
        <>
          <div className="course-table-wrap">
            <table className="course-table" aria-label="Alumnos activos del curso">
              <thead>
                <tr><th>Número de cuenta</th><th>Nombre</th></tr>
              </thead>
              <tbody>
                {alumnosPage?.data.map((alumno) => (
                  <tr key={alumno.alumno_id}>
                    <td>{alumno.numero_cuenta}</td>
                    <td>{alumno.nombre}</td>
                  </tr>
                ))}
                {alumnosPage?.data.length === 0 && (
                  <tr><td colSpan={2} className="course-empty">No se encontraron alumnos activos.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.total > 0 && (
            <nav className="course-pagination" aria-label="Paginación de alumnos">
              <span>{from}–{to} de {meta.total} alumnos</span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Página anterior de alumnos"
                  disabled={meta.current_page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <span>Página {meta.current_page} de {meta.last_page}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Página siguiente de alumnos"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
