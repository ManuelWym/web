import type { AdminGrupo } from "./AdminGrupo";

export interface AdminCursoDocente {
  id: number;
  numero_cuenta: string;
  nombre: string;
}

export interface AdminCurso {
  id: number;
  materia_id: number;
  grupo_id: number;
  docente_id: number | null;
  nombre: string;
  clave: string;
  grupo: AdminGrupo;
  docente: AdminCursoDocente | null;
}

export interface AdminCursoAlumno {
  alumno_id: number;
  numero_cuenta: string;
  nombre: string;
}

export interface AdminCursoPayload {
  materia_id: number;
  grupo_id: number;
  docente_id: number | null;
}

export interface AdminCursoResponse {
  message: string;
  curso: AdminCurso;
}

export interface AdminCursosFilters {
  buscar?: string;
  grupo_id?: string;
  semestre_id?: string;
  docente_id?: string;
  page?: number;
}

export interface AdminCursosPage {
  data: AdminCurso[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
