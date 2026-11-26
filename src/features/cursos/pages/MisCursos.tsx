import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router";
import { listMisCursos } from "@/features/cursos/services/CursoService";
import "./CursoDetail.css";

interface MisCursosProps {
  role: "alumno" | "docente";
}

export function MisCursos({ role }: MisCursosProps) {
  const cursosQuery = useQuery({
    queryKey: ["mis-cursos"],
    queryFn: listMisCursos,
  });
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

      {cursosQuery.isPending ? (
        <p className="course-empty" role="status">Cargando tus cursos…</p>
      ) : cursosQuery.error ? (
        <p className="course-error" role="alert">
          {cursosQuery.error instanceof Error ? cursosQuery.error.message : "No se pudieron cargar tus cursos."}
        </p>
      ) : cursosQuery.data?.length === 0 ? (
        <section className="course-no-results">
          <BookOpen aria-hidden="true" />
          <h2>Aún no tienes cursos disponibles</h2>
          <p>Cuando se te asigne un curso, aparecerá aquí.</p>
        </section>
      ) : (
        <div className="course-groups">
          {cursosQuery.data?.map(({ grupo, cursos }) => (
            <section key={grupo.id} className="course-group" aria-labelledby={`course-group-${grupo.id}`}>
              <header>
                <div>
                  <span className="course-eyebrow">GRUPO</span>
                  <h2 id={`course-group-${grupo.id}`}>{grupo.nombre}</h2>
                  <p>{grupo.semestre.nombre}</p>
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
