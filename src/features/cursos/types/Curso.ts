export interface CursoSemestre {
  id: number;
  numero: number;
  nombre: string;
}

export interface CursoGrupo {
  id: number;
  semestre_id: number;
  nombre: string;
  turno: "matutino" | "vespertino" | null;
  semestre: CursoSemestre;
}

export interface CursoDocente {
  id: number;
  numero_cuenta: string;
  nombre: string;
}

export interface Curso {
  id: number;
  materia_id: number;
  grupo_id: number;
  docente_id: number | null;
  nombre: string;
  clave: string;
  grupo: CursoGrupo;
  docente: CursoDocente | null;
}

export interface MisCursosGrupo {
  grupo: CursoGrupo;
  cursos: Curso[];
}

export interface CursoAlumno {
  alumno_id: number;
  numero_cuenta: string;
  nombre: string;
}

export interface CursoAlumnosFilters {
  buscar?: string;
  page?: number;
}

export interface CursoAlumnosPage {
  data: CursoAlumno[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
