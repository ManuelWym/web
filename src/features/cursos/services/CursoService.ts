import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import type {
  Curso,
  CursoAlumno,
  CursoAlumnosFilters,
  CursoAlumnosPage,
  CursoDocente,
  CursoGrupo,
  CursoSemestre,
  MisCursosGrupo,
} from "@/features/cursos/types/Curso";
import { apiClient } from "@/services/ApiClient";

function getHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Tu sesión expiró. Inicia sesión para consultar tus cursos.");
  return { Authorization: `Bearer ${token}` };
}

function getError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (!error.response) return "No se pudo conectar con el servidor. Intenta de nuevo más tarde.";
  if (error.response.status === 403) return "No tienes permiso para consultar este curso.";

  const validation = Object.values(error.response.data?.errors ?? {})
    .flat()
    .find((item) => typeof item === "string");
  return validation ?? error.response.data?.message ?? `${fallback} (HTTP ${error.response.status}).`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function positive(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new Error(`La API devolvió un ${field} no válido.`);
  }
  return value;
}

function parseSemestre(value: unknown): CursoSemestre {
  if (!isRecord(value) || typeof value.nombre !== "string") {
    throw new Error("La API devolvió un semestre no válido.");
  }

  return {
    id: positive(value.id, "ID de semestre"),
    numero: positive(value.numero, "número de semestre"),
    nombre: value.nombre,
  };
}

function parseGrupo(value: unknown): CursoGrupo {
  if (!isRecord(value) || typeof value.nombre !== "string") {
    throw new Error("La API devolvió un grupo no válido.");
  }

  return {
    id: positive(value.id, "ID de grupo"),
    semestre_id: positive(value.semestre_id, "ID de semestre"),
    nombre: value.nombre,
    turno: value.turno === "matutino" || value.turno === "vespertino" ? value.turno : null,
    semestre: parseSemestre(value.semestre),
  };
}

function parseDocente(value: unknown): CursoDocente | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || typeof value.nombre !== "string" || typeof value.numero_cuenta !== "string") {
    throw new Error("La API devolvió un docente no válido.");
  }

  return {
    id: positive(value.id, "ID de docente"),
    numero_cuenta: value.numero_cuenta,
    nombre: value.nombre,
  };
}

function parseCurso(value: unknown, grupo: CursoGrupo): Curso {
  if (!isRecord(value) || typeof value.nombre !== "string" || typeof value.clave !== "string") {
    throw new Error("La API devolvió un curso con formato no válido.");
  }

  const docenteId = value.docente_id;
  return {
    id: positive(value.id, "ID de curso"),
    materia_id: positive(value.materia_id, "ID de materia"),
    grupo_id: positive(value.grupo_id, "ID de grupo"),
    docente_id: docenteId === null ? null : positive(docenteId, "ID de docente"),
    nombre: value.nombre,
    clave: value.clave,
    grupo,
    docente: parseDocente(value.docente),
  };
}

function unwrapData(value: unknown): unknown {
  return isRecord(value) && "data" in value ? value.data : value;
}

export async function getCurso(id: number): Promise<Curso> {
  try {
    const response = await apiClient.get<unknown>(`/cursos/${encodeURIComponent(id)}`, {
      headers: getHeaders(),
    });
    const value = unwrapData(response.data);
    if (!isRecord(value)) throw new Error("La API devolvió el detalle del curso con formato no válido.");

    return parseCurso(value, parseGrupo(value.grupo));
  } catch (error) {
    throw new Error(getError(error, "No se pudo cargar el curso"));
  }
}

export async function listMisCursos(): Promise<MisCursosGrupo[]> {
  try {
    const response = await apiClient.get<unknown>("/mis-cursos", { headers: getHeaders() });
    const data = unwrapData(response.data);
    if (!Array.isArray(data)) throw new Error("La API devolvió una lista de cursos no válida.");

    return data.map((item) => {
      if (!isRecord(item) || !Array.isArray(item.cursos)) {
        throw new Error("La API devolvió un grupo de cursos no válido.");
      }
      const grupo = parseGrupo(item.grupo);
      return { grupo, cursos: item.cursos.map((curso) => parseCurso(curso, grupo)) };
    });
  } catch (error) {
    throw new Error(getError(error, "No se pudieron cargar tus cursos"));
  }
}

export async function listCursoAlumnos(
  id: number,
  filters: CursoAlumnosFilters,
): Promise<CursoAlumnosPage> {
  try {
    const response = await apiClient.get<unknown>(`/cursos/${encodeURIComponent(id)}/alumnos`, {
      headers: getHeaders(),
      params: filters,
    });
    if (!isRecord(response.data) || !Array.isArray(response.data.data) || !isRecord(response.data.meta)) {
      throw new Error("La API devolvió una lista de alumnos no válida.");
    }

    const meta = response.data.meta;
    return {
      data: response.data.data.map((item): CursoAlumno => {
        if (!isRecord(item) || typeof item.nombre !== "string" || typeof item.numero_cuenta !== "string") {
          throw new Error("La API devolvió un alumno no válido.");
        }
        return {
          alumno_id: positive(item.alumno_id, "ID de alumno"),
          numero_cuenta: item.numero_cuenta,
          nombre: item.nombre,
        };
      }),
      meta: {
        current_page: positive(meta.current_page, "número de página"),
        last_page: positive(meta.last_page, "número de última página"),
        per_page: positive(meta.per_page, "número de elementos por página"),
        total: typeof meta.total === "number" && meta.total >= 0 ? meta.total : 0,
      },
    };
  } catch (error) {
    throw new Error(getError(error, "No se pudieron cargar los alumnos del curso"));
  }
}
