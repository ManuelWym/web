import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, GraduationCap, Search, Users } from "lucide-react";
import { Link } from "react-router";
import { listMisCursos } from "@/features/cursos/services/CursoService";
import "./CursoDetail.css";

interface MisCursosProps {
  role: "alumno" | "docente";
}

function normalizarTexto(value: string): string {
  return value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

export function MisCursos({ role }: MisCursosProps) {
  const [grupoId, setGrupoId] = useState("");
  const [buscar, setBuscar] = useState("");
  const cursosQuery = useQuery({
    queryKey: ["mis-cursos"],
    queryFn: listMisCursos,
  });
  const todosLosGrupos = cursosQuery.data ?? [];
  const gruposDelFiltro = grupoId
    ? todosLosGrupos.filter(({ grupo }) => String(grupo.id) === grupoId)
    : todosLosGrupos;
  const textoBuscado = normalizarTexto(buscar.trim());
  const gruposVisibles = gruposDelFiltro
    .map(({ grupo, cursos }) => ({
      grupo,
      cursos: cursos.filter((curso) => normalizarTexto(curso.nombre).includes(textoBuscado)),
    }))
    .filter(({ cursos }) => cursos.length > 0);
  const heading = role === "docente" ? "Mis cursos asignados" : "Mis cursos";
  const description = role === "docente"
    ? "Consulta la información de tus materias y a los alumnos activos de cada grupo."
    : "Selecciona una materia para consultar su información y contenido.";

  return (
    <main className="course-list-page">
      <header className="course-header">
        <span className="course-eyebrow">{role === "docente" ? "DOCENTE" : "ALUMNO"}</span>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>

      {todosLosGrupos.length > 0 && (
        <label className="course-name-search">
          Buscar curso
          <span>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={buscar}
              placeholder="Nombre del curso"
              onChange={(event) => setBuscar(event.target.value)}
            />
          </span>
        </label>
      )}

      {role === "docente" && todosLosGrupos.length > 0 && (
        <label className="course-group-filter">
          Filtrar por grupo
          <select value={grupoId} onChange={(event) => setGrupoId(event.target.value)}>
            <option value="">Todos los grupos</option>
            {todosLosGrupos.map(({ grupo }) => (
              <option key={grupo.id} value={grupo.id}>
                Grupo {grupo.nombre} · {grupo.semestre.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      {cursosQuery.isPending ? (
        <p className="course-empty" role="status">Cargando tus cursos…</p>
      ) : cursosQuery.error ? (
        <p className="course-error" role="alert">
          {cursosQuery.error instanceof Error ? cursosQuery.error.message : "No se pudieron cargar tus cursos."}
        </p>
      ) : todosLosGrupos.length === 0 ? (
        <section className="course-no-results">
          <BookOpen aria-hidden="true" />
          <h2>Aún no tienes cursos disponibles</h2>
          <p>Cuando se te asigne un curso, aparecerá aquí.</p>
        </section>
      ) : gruposVisibles.length === 0 ? (
        <section className="course-no-results">
          <Search aria-hidden="true" />
          <h2>No se encontraron cursos</h2>
          <p>
            {textoBuscado
              ? "Prueba con otro nombre de curso."
              : "No hay cursos en el grupo seleccionado."}
          </p>
        </section>
      ) : (
        <div className="course-groups">
          {gruposVisibles.map(({ grupo, cursos }) => (
            <section key={grupo.id} className="course-group" aria-labelledby={`course-group-${grupo.id}`}>
              <header>
                <div>
                  <span className="course-eyebrow">GRUPO</span>
                  <h2 id={`course-group-${grupo.id}`}>Grupo {grupo.nombre} · {grupo.semestre.nombre}</h2>
                </div>
                <GraduationCap aria-hidden="true" />
              </header>
              <div className="course-grid">
                {cursos.map((curso) => (
                  <Link key={curso.id} to={`/cursos/${curso.id}`} className="course-card">
                    <span className="course-card-icon"><BookOpen aria-hidden="true" /></span>
                    <span className="course-card-body">
                      <strong>{curso.nombre}</strong>
                      <small>{curso.clave}</small>
                      {role === "docente" && <small><Users size={13} aria-hidden="true" /> Ver alumnos activos</small>}
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
