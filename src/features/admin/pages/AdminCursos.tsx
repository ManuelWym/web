import { useState } from "react";
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
  const map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]] as const;
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
  const [editingCurso, setEditingCurso] = useState<AdminCurso | null>(null);
  const [notice, setNotice] = useState("");
  const { materias, semestres, loading: loadingMaterias, error: materiasError } = useAdminMaterias();
  const { grupos, loading: loadingGrupos, error: gruposError } = useAdminGrupos();
  const cursos = useAdminCursos({
    buscar: buscar.trim() || undefined,
    grupo_id: grupoId || undefined,
    semestre_id: semestreId || undefined,
    docente_id: docenteId || undefined,
    page,
  });

  const clearFilters = () => {
    setBuscar("");
    setGrupoId("");
    setSemestreId("");
    setDocenteId("");
    setPage(1);
  };

  const saveDocente = async (docenteIdValue: number) => {
    if (!editingCurso) return;
    await cursos.saveDocente(editingCurso.id, docenteIdValue);
    setDocenteOpen(false);
    setEditingCurso(null);
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
          <p>Consulta cursos y asigna docentes a sus grupos. Abre una materia para ver su detalle y sus alumnos activos.</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)} disabled={!canRegister}>
          <Plus aria-hidden="true" />
          Registrar curso
        </Button>
      </header>

      {notice && <p className="admin-success cursos-notice" role="status">{notice}</p>}
      {(cursos.error || materiasError || gruposError) && (
        <p className="admin-form-error" role="alert">{cursos.error || materiasError || gruposError}</p>
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
            roman={roman}
            onEditDocente={(curso) => { setEditingCurso(curso); setDocenteOpen(true); }}
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
      {docenteOpen && editingCurso && (
        <AdminCursoDocenteDialog
          curso={editingCurso}
          docentes={cursos.docentes}
          saving={cursos.savingDocente}
          onSubmit={(docenteIdValue) => void saveDocente(docenteIdValue)}
          onClose={() => { setDocenteOpen(false); setEditingCurso(null); }}
        />
      )}
    </section>
  );
}
