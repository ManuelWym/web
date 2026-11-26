import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, GraduationCap, Hash, Layers, UserRound } from "lucide-react";
import { Link, useParams } from "react-router";
import { CursoAlumnosPanel } from "@/features/cursos/components/CursoAlumnosPanel";
import { getCurso } from "@/features/cursos/services/CursoService";
import { getSavedCampusRole } from "@/features/auth/services/CampusRoleService";
import "./CursoDetail.css";

function getReturnPath(): string {
  switch (getSavedCampusRole()) {
    case "admin":
      return "/admin/cursos";
    case "docente":
      return "/docente";
    default:
      return "/alumno";
  }
}

export function CursoDetail() {
  const { cursoId } = useParams();
  const id = Number(cursoId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const role = getSavedCampusRole();
  const courseQuery = useQuery({
    queryKey: ["curso", id],
    queryFn: () => getCurso(id),
    enabled: validId,
  });

  return (
    <main className="course-detail-page">
      <Link to={getReturnPath()} className="course-back">
        <ArrowLeft size={16} aria-hidden="true" /> Volver a {role === "admin" ? "cursos" : "mis cursos"}
      </Link>

      {!validId ? (
        <p className="course-error" role="alert">El identificador del curso no es válido.</p>
      ) : courseQuery.isPending ? (
        <p className="course-empty" role="status">Cargando información del curso…</p>
      ) : courseQuery.error ? (
        <section className="course-access-error" aria-labelledby="course-access-error-title">
          <h1 id="course-access-error-title">No fue posible abrir el curso</h1>
          <p>{courseQuery.error instanceof Error ? courseQuery.error.message : "No se pudo cargar el curso."}</p>
        </section>
      ) : courseQuery.data ? (
        <>
          <header className="course-header">
            <span className="course-eyebrow">DETALLE DEL CURSO</span>
            <h1>{courseQuery.data.nombre}</h1>
            <p>{courseQuery.data.clave} · Grupo {courseQuery.data.grupo.nombre}</p>
          </header>

          <section className="course-info-card" aria-label="Información del curso">
            <div className="course-info-item">
              <BookOpen aria-hidden="true" />
              <div><span>Materia</span><strong>{courseQuery.data.nombre}</strong></div>
            </div>
            <div className="course-info-item">
              <Hash aria-hidden="true" />
              <div><span>Clave</span><strong>{courseQuery.data.clave}</strong></div>
            </div>
            <div className="course-info-item">
              <GraduationCap aria-hidden="true" />
              <div><span>Grupo</span><strong>{courseQuery.data.grupo.nombre}</strong></div>
            </div>
            <div className="course-info-item">
              <Layers aria-hidden="true" />
              <div>
                <span>Semestre</span>
                <strong>{courseQuery.data.grupo.semestre.nombre || `Semestre ${courseQuery.data.grupo.semestre.numero}`}</strong>
              </div>
            </div>
            <div className="course-info-item course-info-teacher">
              <UserRound aria-hidden="true" />
              <div>
                <span>Docente</span>
                <strong>{courseQuery.data.docente?.nombre ?? "Sin docente asignado"}</strong>
              </div>
            </div>
          </section>

          {role !== "alumno" && <CursoAlumnosPanel cursoId={courseQuery.data.id} />}
        </>
      ) : null}
    </main>
  );
}
