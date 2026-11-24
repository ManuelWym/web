import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import type {
  AdminCurso,
  AdminCursoAlumno,
  AdminCursoPayload,
  AdminCursoResponse,
  AdminCursosFilters,
  AdminCursosPage,
} from "@/features/admin/types/AdminCurso";
import type { AdminGrupo } from "@/features/admin/types/AdminGrupo";
import type { AdminSemestre } from "@/features/admin/types/AdminMateria";
import { apiClient } from "@/services/ApiClient";
import { listUsers } from "./AdminUserService";

function getHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Tu sesión expiró. Inicia sesión para administrar cursos.");
  return { Authorization: `Bearer ${token}` };
}

function getError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  if (!error.response) return "No se pudo conectar con el servidor. Intenta de nuevo más tarde.";
  const validation = Object.values(error.response.data?.errors ?? {}).flat().find((item) => typeof item === "string");
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

function parseSemestre(value: unknown): AdminSemestre {
  if (!isRecord(value) || typeof value.nombre !== "string") throw new Error("La API devolvió un semestre no válido.");
  return {
    id: positive(value.id, "ID de semestre"),
    numero: positive(value.numero, "número de semestre"),
    nombre: value.nombre,
    materias: [],
  };
}

function parseGrupo(value: unknown): AdminGrupo {
  if (!isRecord(value) || typeof value.nombre !== "string") throw new Error("La API devolvió un grupo no válido.");
  const grupo: AdminGrupo = {
    id: positive(value.id, "ID de grupo"),
    semestre_id: positive(value.semestre_id, "ID de semestre"),
    nombre: value.nombre,
    turno: value.turno === "matutino" || value.turno === "vespertino" ? value.turno : null,
  };
  if (isRecord(value.semestre)) grupo.semestre = parseSemestre(value.semestre);
  if (typeof value.alumnos_activos === "number") grupo.alumnos_activos = value.alumnos_activos;
  return grupo;
}

function parseCurso(value: unknown): AdminCurso {
  if (!isRecord(value) || typeof value.nombre !== "string" || typeof value.clave !== "string") {
    throw new Error("La API devolvió un curso con formato no válido.");
  }
  let docente: AdminCurso["docente"] = null;
  if (value.docente !== null && value.docente !== undefined) {
    if (!isRecord(value.docente) || typeof value.docente.nombre !== "string") {
      throw new Error("La API devolvió un docente no válido.");
    }
    docente = {
      id: positive(value.docente.id, "ID de docente"),
      numero_cuenta: typeof value.docente.numero_cuenta === "string" ? value.docente.numero_cuenta : "",
      nombre: value.docente.nombre,
    };
  }

  return {
    id: positive(value.id, "ID de curso"),
    materia_id: positive(value.materia_id, "ID de materia"),
    grupo_id: positive(value.grupo_id, "ID de grupo"),
    docente_id: value.docente_id === null ? null : positive(value.docente_id, "ID de docente"),
    nombre: value.nombre,
    clave: value.clave,
    grupo: parseGrupo(value.grupo),
    docente,
  };
}

async function getCursoDetail(id: number): Promise<AdminCurso> {
  const response = await apiClient.get<unknown>(
    `/cursos/${encodeURIComponent(id)}`,
    { headers: getHeaders() },
  );
  const value =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : response.data;
  if (!isRecord(value)) {
    throw new Error("La API devolvió el detalle del curso con formato no válido.");
  }
  return parseCurso(value);
}

export async function listCursos(filters: AdminCursosFilters): Promise<AdminCursosPage> {
  try {
    const response = await apiClient.get<unknown>("/cursos", { headers: getHeaders(), params: filters });
    if (!isRecord(response.data) || !Array.isArray(response.data.data) || !isRecord(response.data.meta)) {
      throw new Error("La API devolvió una lista de cursos no válida.");
    }
    const meta = response.data.meta;
    return {
      data: response.data.data.map(parseCurso),
      meta: {
        current_page: positive(meta.current_page, "número de página"),
        last_page: positive(meta.last_page, "número de última página"),
        per_page: positive(meta.per_page, "número de elementos por página"),
        total: typeof meta.total === "number" ? meta.total : 0,
      },
    };
  } catch (error) {
    throw new Error(getError(error, "No se pudieron cargar los cursos"));
  }
}

export async function createCurso(payload: AdminCursoPayload): Promise<AdminCursoResponse> {
  try {
    const response = await apiClient.post<unknown>("/cursos", payload, { headers: getHeaders() });
    if (!isRecord(response.data) || typeof response.data.message !== "string" || !("curso" in response.data)) {
      throw new Error("La API devolvió una respuesta de curso no válida.");
    }
    const created = isRecord(response.data.curso) ? positive(response.data.curso.id, "ID de curso") : 0;
    if (!created) throw new Error("La API no devolvió el ID del curso creado.");
    const curso = await getCursoDetail(created);
    return { message: response.data.message, curso };
  } catch (error) {
    throw new Error(getError(error, "No se pudo registrar el curso"));
  }
}

export async function updateCursoDocente(id: number, docenteId: number | null): Promise<AdminCursoResponse> {
  try {
    const response = await apiClient.patch<unknown>(
      `/cursos/${encodeURIComponent(id)}/docente`,
      docenteId === null ? { docente_id: null } : { docente_id: docenteId },
      { headers: getHeaders() },
    );
    if (!isRecord(response.data) || typeof response.data.message !== "string" || !("curso" in response.data)) {
      throw new Error("La API devolvió una respuesta de curso no válida.");
    }
    const curso = await getCursoDetail(id);
    return { message: response.data.message, curso };
  } catch (error) {
    throw new Error(getError(error, "No se pudo asignar el docente"));
  }
}

export async function listCursoAlumnos(id: number): Promise<AdminCursoAlumno[]> {
  try {
    const all: AdminCursoAlumno[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await apiClient.get<unknown>(`/cursos/${encodeURIComponent(id)}/alumnos`, {
        headers: getHeaders(), params: { page },
      });
      if (!isRecord(response.data) || !Array.isArray(response.data.data) || !isRecord(response.data.meta)) {
        throw new Error("La API devolvió una lista de alumnos no válida.");
      }
      lastPage = positive(response.data.meta.last_page, "número de última página");
      for (const item of response.data.data) {
        if (!isRecord(item) || typeof item.nombre !== "string" || typeof item.numero_cuenta !== "string") {
          throw new Error("La API devolvió un alumno no válido.");
        }
        all.push({ alumno_id: positive(item.alumno_id, "ID de alumno"), numero_cuenta: item.numero_cuenta, nombre: item.nombre });
      }
      page += 1;
    } while (page <= lastPage);
    return all;
  } catch (error) {
    throw new Error(getError(error, "No se pudieron cargar los alumnos del curso"));
  }
}

export async function listDocentesActivos() {
  const all = [];
  let page = 1;
  let lastPage = 1;
  do {
    const result = await listUsers({ rol: "docente", estado: "activo", page });
    all.push(...result.data);
    lastPage = result.meta.last_page;
    page += 1;
  } while (page <= lastPage);
  return all.map((docente) => ({
    id: docente.id,
    numero_cuenta: docente.numero_cuenta,
    nombre: docente.nombre,
  }));
}
