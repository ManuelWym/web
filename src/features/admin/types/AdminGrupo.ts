import type { AdminSemestre } from "./AdminMateria";

// GET /grupos carga el semestre sin sus materias (SemestreResource omite
// `materias` cuando no se cargaron).
export type AdminGrupoSemestre = Omit<AdminSemestre, "materias">;

export interface AdminGrupo {
  id: number;
  semestre_id: number;
  nombre: string;
  turno: "matutino" | "vespertino" | null;
  semestre?: AdminGrupoSemestre;
  alumnos_activos?: number;
  total_cursos?: number;
}

export interface AdminGruposResponse {
  data: AdminGrupo[];
}

export interface AdminGrupoPayload {
  semestre_id: number;
  nombre: string;
  turno: "matutino" | "vespertino" | null;
}

export interface AdminGrupoResponse {
  message: string;
  grupo: AdminGrupo;
}

export interface AdminGrupoAlumnosOmitido {
  alumno_id: number;
  motivo: string | null;
}

export interface AdminGrupoAlumnosResponse {
  message: string;
  agregados: number[];
  omitidos: AdminGrupoAlumnosOmitido[];
}

export interface AdminGrupoAlumno {
  alumno_id: number;
  numero_cuenta: string;
  nombre: string;
  estado: string;
  baja_en: string | null;
}

export type AdminGrupoAlumnoEstado = "activo" | "baja";

export interface AdminGrupoAlumnoEstadoResponse {
  message: string;
  alumno: AdminGrupoAlumno;
}

export interface AdminGrupoAlumnosLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface AdminGrupoAlumnosPage {
  data: AdminGrupoAlumno[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: AdminGrupoAlumnosLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface AdminGrupoDraft {
  nombre: string;
  semestre_id: string;
  turno: "" | "matutino" | "vespertino";
}

export interface AdminGrupoMiembro {
  alumno_id: number;
  numero_cuenta: string;
  nombre: string;
  activo: boolean;
  baja_en: string | null;
}

export interface AdminGrupoImportacionStatusResponse {
  id: string;
  estado: string;
  mensaje?: string;
  [key: string]: unknown;
}

export interface AdminGrupoImportacionUploadResponse
  extends AdminGrupoImportacionStatusResponse {
  estado: "en_proceso";
}
