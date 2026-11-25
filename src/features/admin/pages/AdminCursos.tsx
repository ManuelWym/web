import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, ChevronRight, Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCursoFormDialog } from "@/features/admin/components/AdminCursoFormDialog";
import { AdminCursoDocenteDialog } from "@/features/admin/components/AdminCursoDocenteDialog";
import { AdminCursosTable } from "@/features/admin/components/AdminCursosTable";
import { useAdminCursos } from "@/features/admin/hooks/useAdminCursos";
import { useAdminGrupos } from "@/features/admin/hooks/useAdminGrupos";
import { useAdminMaterias } from "@/features/admin/hooks/useAdminMaterias";
import type { AdminCurso } from "@/features/admin/types/AdminCurso";
import "./AdminCursos.css";

function roman(value: number): string {
  const map = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ] as const;
  let result = "";
  let remaining = value;
  for (const [amount, numeral] of map) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result || String(value);
}

export function AdminCursos() {
  const [buscar, setBuscar] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [semestreId, setSemestreId] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [docenteOpen, setDocenteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [alumnosPage, setAlumnosPage] = useState(1);
  const [notice, setNotice] = useState("");
  const detailRef = useRef<HTMLElement>(null);
  const { materias, semestres, loading: loadingMaterias, error: materiasError } = useAdminMaterias();
  const { grupos, loading: loadingGrupos, error: gruposError } = useAdminGrupos();
  const cursos = useAdminCursos({
    buscar: buscar.trim() || undefined,
    grupo_id: grupoId || undefined,
    semestre_id: semestreId || undefined,
    docente_id: docenteId || undefined,
    page,
  });
  const selected = cursos.page?.data.find((curso) => curso.id === selectedId) ?? null;
  const alumnosQuery = useQuery({
    queryKey: ["admin", "curso-alumnos", selectedId],
    queryFn: () => cursos.listAlumnos(selectedId as number),
    enabled: selectedId !== null,
  });
  const alumnosPerPage = 10;
  const alumnos = alumnosQuery.data ?? [];
  const alumnosPages = Math.max(1, Math.ceil(alumnos.length / alumnosPerPage));
  const alumnosVisibles = alumnos.slice(
    (alumnosPage - 1) * alumnosPerPage,
    alumnosPage * alumnosPerPage,
  );

  const selectCurso = (curso: AdminCurso) => {
    setSelectedId(curso.id);
    setAlumnosPage(1);
    const panel = detailRef.current;
    if (panel) {
      const bounds = panel.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const clearFilters = () => {
    setBuscar("");
    setGrupoId("");
    setSemestreId("");
    setDocenteId("");
    setPage(1);
  };

  const saveDocente = async (docenteIdValue: number) => {
    if (!selected) return;
    await cursos.saveDocente(selected.id, docenteIdValue);
    setDocenteOpen(false);
  };

  const saveCurso = async (payload: Parameters<typeof cursos.saveCurso>[0]) => {
    const curso = await cursos.saveCurso(payload);
    setOpen(false);
    setNotice(`Curso registrado: ${curso.nombre} · ${curso.grupo.nombre}`);
  };

  const canRegister =
    !loadingMaterias &&
    !materiasError &&
    !loadingGrupos &&
    !gruposError &&
    materias.some((materia) => materia.activa) &&
    grupos.length > 0;

  return (
    <section className="cursos-page">
      <header className="admin-section-heading cursos-heading">
        <div>
          <h2>Cursos</h2>
          <p>Consulta cursos y asigna docentes a sus grupos: selecciona un curso de la tabla para ver a los alumnos del curso.</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)} disabled={!canRegister}>
          <Plus aria-hidden="true" />
          Registrar curso
        </Button>
      </header>

      {notice && <p className="admin-success cursos-notice" role="status">{notice}</p>}
      {(cursos.error || materiasError || gruposError) && (
        <p className="admin-form-error" role="alert">
          {cursos.error || materiasError || gruposError}
        </p>
      )}

      <div className="cursos-filters">
        <label className="cursos-filter-search">
          Buscar
          <span className="cursos-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar cursos"
              placeholder="Nombre o clave de la materia"
              value={buscar}
              onChange={(event) => { setBuscar(event.target.value); setPage(1); }}
            />
          </span>
        </label>
        <label>
          Grupo
          <select value={grupoId} onChange={(event) => { setGrupoId(event.target.value); setPage(1); }}>
            <option value="">Todos los grupos</option>
            {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}
          </select>
        </label>
        <label>
          Semestre
          <select value={semestreId} onChange={(event) => { setSemestreId(event.target.value); setPage(1); }}>
            <option value="">Todos los semestres</option>
            {semestres.map((semestre) => <option key={semestre.id} value={semestre.id}>{semestre.nombre}</option>)}
          </select>
        </label>
        <label>
          Docente
          <select value={docenteId} onChange={(event) => { setDocenteId(event.target.value); setPage(1); }}>
            <option value="">Todos los docentes</option>
            {cursos.docentes.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombre}</option>)}
          </select>
        </label>
        <Button type="button" variant="outline" size="icon" title="Limpiar filtros" aria-label="Limpiar filtros" onClick={clearFilters}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>

      <section className="admin-card" aria-labelledby="cursos-list-heading">
        <h2 id="cursos-list-heading" className="cursos-summary">
          <BookOpen size={18} aria-hidden="true" />
          Cursos
          <span className="admin-count-pill">{cursos.page?.meta.total ?? 0}</span>
        </h2>
        {cursos.loading ? (
          <p className="admin-empty-state" role="status">Cargando cursos...</p>
        ) : (
          <AdminCursosTable
            cursos={cursos.page?.data ?? []}
            selectedId={selectedId}
            roman={roman}
            onSelect={selectCurso}
            onEditDocente={(curso) => { setSelectedId(curso.id); setAlumnosPage(1); setDocenteOpen(true); }}
          />
        )}
      </section>

      {cursos.page && (
        <nav className="cursos-pagination" aria-label="Paginación de cursos">
          <span>{cursos.page.meta.total ? `${(page - 1) * cursos.page.meta.per_page + 1}–${Math.min(page * cursos.page.meta.per_page, cursos.page.meta.total)}` : "0"} de {cursos.page.meta.total} cursos</span>
          <div className="cursos-pagination-controls">
            <Button type="button" variant="outline" size="icon" aria-label="Página anterior" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <span>Página {page} de {cursos.page.meta.last_page}</span>
            <Button type="button" variant="outline" size="icon" aria-label="Página siguiente" disabled={page >= cursos.page.meta.last_page} onClick={() => setPage((current) => current + 1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}

      {selected ? (
        <section ref={detailRef} className="cursos-detail" aria-label="Detalles del curso seleccionado">
          <h2 className="cursos-summary">{selected.nombre} · {selected.grupo.nombre}</h2>
          <h3 className="cursos-summary">Alumnos del curso <span className="admin-count-pill">{alumnosQuery.data?.length ?? 0}</span></h3>
          {alumnosQuery.isPending ? (
            <p className="admin-empty-state" role="status">Cargando alumnos...</p>
          ) : alumnosQuery.error ? (
            <p className="admin-form-error" role="alert">{alumnosQuery.error instanceof Error ? alumnosQuery.error.message : "No se pudieron cargar los alumnos."}</p>
          ) : (
            <div className="cursos-table-wrap">
              <table className="cursos-table" aria-label="Alumnos del curso">
                <thead><tr><th>Número de cuenta</th><th>Nombre</th></tr></thead>
                <tbody>
                  {alumnosVisibles.map((alumno) => (
                    <tr key={alumno.alumno_id}><td>{alumno.numero_cuenta}</td><td>{alumno.nombre}</td></tr>
                  ))}
                  {alumnos.length === 0 && <tr><td colSpan={2} className="admin-empty-state">Este curso no tiene alumnos activos.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          {!alumnosQuery.isPending && !alumnosQuery.error && alumnos.length > 0 && (
            <nav className="cursos-pagination" aria-label="Paginación de alumnos del curso">
              <span>
                {`${(alumnosPage - 1) * alumnosPerPage + 1}–${Math.min(alumnosPage * alumnosPerPage, alumnos.length)} de ${alumnos.length} alumnos`}
              </span>
              <div className="cursos-pagination-controls">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Página anterior de alumnos"
                  disabled={alumnosPage === 1}
                  onClick={() => setAlumnosPage((current) => current - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <span>Página {alumnosPage} de {alumnosPages}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Página siguiente de alumnos"
                  disabled={alumnosPage >= alumnosPages}
                  onClick={() => setAlumnosPage((current) => current + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
          <p className="cursos-access">Lo pueden ver el admin, el docente asignado y los alumnos activos del grupo del curso.</p>
        </section>
      ) : (
        <p className="cursos-access">Pulsa un curso de la tabla para ver sus alumnos, o el lápiz de la columna Docente para asignarle uno.</p>
      )}

      {open && (
        <AdminCursoFormDialog
          materias={materias}
          grupos={grupos}
          semestres={semestres}
          docentes={cursos.docentes}
          saving={cursos.saving}
          onSubmit={(payload: Parameters<typeof cursos.saveCurso>[0]) => void saveCurso(payload)}
          onClose={() => setOpen(false)}
        />
      )}
      {docenteOpen && selected && (
        <AdminCursoDocenteDialog
          curso={selected}
          docentes={cursos.docentes}
          saving={cursos.savingDocente}
          onSubmit={(docenteIdValue) => void saveDocente(docenteIdValue)}
          onClose={() => setDocenteOpen(false)}
        />
      )}
    </section>
  );
}