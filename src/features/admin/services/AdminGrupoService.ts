import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import type {
  AdminGrupo,
  AdminGrupoAlumno,
  AdminGrupoAlumnosOmitido,
  AdminGrupoAlumnosLink,
  AdminGrupoAlumnosPage,
  AdminGrupoAlumnosResponse,
  AdminGrupoAlumnoEstado,
  AdminGrupoAlumnoEstadoResponse,
  AdminGrupoPayload,
  AdminGrupoResponse,
  AdminGrupoSemestre,
  AdminGruposResponse,
} from "@/features/admin/types/AdminGrupo";
import { apiClient } from "@/services/ApiClient";

function getAuthorizationHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error(
      "Tu sesión expiró. Inicia sesión para administrar grupos.",
    );
  }

  return { Authorization: `Bearer ${token}` };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const response = error.response;
  if (!response) {
    return "No se pudo conectar con el servidor. Intenta de nuevo más tarde.";
  }

  const apiMessage = response.data?.message;
  const validationMessage = Object.values(response.data?.errors ?? {})
    .flat()
    .find((message) => typeof message === "string");

  switch (response.status) {
    case 401:
      return apiMessage ?? "Tu sesión expiró. Inicia sesión para continuar.";
    case 403:
      return apiMessage ?? "No tienes autorización para administrar grupos.";
    case 404:
      return apiMessage ?? "No se encontró el grupo solicitado.";
    case 422:
      return (
        validationMessage ??
        apiMessage ??
        "La solicitud no pasó la validación."
      );
    default:
      return apiMessage ?? `${fallback} (HTTP ${response.status}).`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePositiveInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new Error(`La API devolvió un ${field} no válido.`);
  }
  return value;
}

function parseCount(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`La API devolvió un ${field} no válido.`);
  }
  return value;
}

function parseSemestre(value: unknown): AdminGrupoSemestre {
  if (!isRecord(value) || typeof value.nombre !== "string") {
    throw new Error("La API devolvió un semestre con formato no válido.");
  }

  return {
    id: parsePositiveInteger(value.id, "ID de semestre"),
    numero: parsePositiveInteger(value.numero, "número de semestre"),
    nombre: value.nombre,
  };
}

function parseGrupo(value: unknown): AdminGrupo {
  if (
    !isRecord(value) ||
    typeof value.nombre !== "string" ||
    (value.turno !== null &&
      value.turno !== "matutino" &&
      value.turno !== "vespertino")
  ) {
    throw new Error("La API devolvió un grupo con formato no válido.");
  }

  const grupo: AdminGrupo = {
    id: parsePositiveInteger(value.id, "ID de grupo"),
    semestre_id: parsePositiveInteger(value.semestre_id, "ID de semestre"),
    nombre: value.nombre,
    turno: value.turno,
  };

  if (value.semestre !== undefined) {
    grupo.semestre = parseSemestre(value.semestre);
  }
  if (value.alumnos_activos !== undefined) {
    grupo.alumnos_activos = parseCount(
      value.alumnos_activos,
      "número de alumnos activos",
    );
  }
  if (value.total_cursos !== undefined) {
    grupo.total_cursos = parseCount(value.total_cursos, "número de cursos");
  }

  return grupo;
}

function parseGruposResponse(value: unknown): AdminGruposResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    throw new Error("La API devolvió una lista de grupos con formato no válido.");
  }
  return { data: value.data.map(parseGrupo) };
}

function parseGrupoResponse(value: unknown): AdminGrupoResponse {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !("grupo" in value)
  ) {
    throw new Error(
      "La API devolvió una respuesta de grupo con formato no válido.",
    );
  }
  return { message: value.message, grupo: parseGrupo(value.grupo) };
}

function parseGrupoAlumnosResponse(value: unknown): AdminGrupoAlumnosResponse {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !Array.isArray(value.agregados) ||
    !Array.isArray(value.omitidos)
  ) {
    throw new Error(
      "La API devolvió una respuesta de alumnos procesados con formato no válido.",
    );
  }

  const omitidos: AdminGrupoAlumnosOmitido[] = value.omitidos.map(
    (omitido) => {
      if (
        !isRecord(omitido) ||
        (omitido.motivo !== null && typeof omitido.motivo !== "string")
      ) {
        throw new Error(
          "La API devolvió un alumno omitido con formato no válido.",
        );
      }

      return {
        alumno_id: parsePositiveInteger(
          omitido.alumno_id,
          "ID de alumno omitido",
        ),
        motivo: omitido.motivo,
      };
    },
  );

  return {
    message: value.message,
    agregados: value.agregados.map((id) =>
      parsePositiveInteger(id, "ID de alumno agregado"),
    ),
    omitidos,
  };
}

function parseGrupoAlumnoEstadoResponse(
  value: unknown,
): AdminGrupoAlumnoEstadoResponse {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !("alumno" in value)
  ) {
    throw new Error(
      "La API devolvió una respuesta de estado de alumno con formato no válido.",
    );
  }

  return {
    message: value.message,
    alumno: parseGrupoAlumno(value.alumno),
  };
}

function parseNullableString(value: unknown, field: string): string | null {
  if (value !== null && typeof value !== "string") {
    throw new Error(`La API devolvió un ${field} no válido.`);
  }
  return value;
}

function parseNullableCount(value: unknown, field: string): number | null {
  return value === null ? null : parseCount(value, field);
}

function parseGrupoAlumno(value: unknown): AdminGrupoAlumno {
  if (
    !isRecord(value) ||
    typeof value.numero_cuenta !== "string" ||
    typeof value.nombre !== "string" ||
    typeof value.estado !== "string" ||
    (value.baja_en !== null && typeof value.baja_en !== "string")
  ) {
    throw new Error("La API devolvió un alumno del grupo con formato no válido.");
  }

  return {
    alumno_id: parsePositiveInteger(value.alumno_id, "ID de alumno"),
    numero_cuenta: value.numero_cuenta,
    nombre: value.nombre,
    estado: value.estado,
    baja_en: value.baja_en,
  };
}

function parseGrupoAlumnosLink(value: unknown): AdminGrupoAlumnosLink {
  if (
    !isRecord(value) ||
    typeof value.label !== "string" ||
    typeof value.active !== "boolean"
  ) {
    throw new Error("La API devolvió un enlace de paginación no válido.");
  }

  return {
    url: parseNullableString(value.url, "URL de paginación"),
    label: value.label,
    active: value.active,
  };
}

function parseGrupoAlumnosPage(value: unknown): AdminGrupoAlumnosPage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !isRecord(value.links) ||
    !isRecord(value.meta) ||
    !Array.isArray(value.meta.links) ||
    typeof value.meta.path !== "string"
  ) {
    throw new Error(
      "La API devolvió una lista de alumnos del grupo con formato no válido.",
    );
  }

  return {
    data: value.data.map(parseGrupoAlumno),
    links: {
      first: parseNullableString(value.links.first, "enlace inicial"),
      last: parseNullableString(value.links.last, "enlace final"),
      prev: parseNullableString(value.links.prev, "enlace anterior"),
      next: parseNullableString(value.links.next, "enlace siguiente"),
    },
    meta: {
      current_page: parsePositiveInteger(
        value.meta.current_page,
        "página actual",
      ),
      from: parseNullableCount(value.meta.from, "índice inicial"),
      last_page: parsePositiveInteger(value.meta.last_page, "última página"),
      links: value.meta.links.map(parseGrupoAlumnosLink),
      path: value.meta.path,
      per_page: parseCount(value.meta.per_page, "resultados por página"),
      to: parseNullableCount(value.meta.to, "índice final"),
      total: parseCount(value.meta.total, "total de alumnos"),
    },
  };
}

export async function listGrupos(): Promise<AdminGrupo[]> {
  try {
    const response = await apiClient.get<unknown>("/grupos", {
      headers: getAuthorizationHeaders(),
    });
    return parseGruposResponse(response.data).data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudieron cargar los grupos"),
    );
  }
}

export async function createGrupo(
  payload: AdminGrupoPayload,
): Promise<AdminGrupoResponse> {
  try {
    const response = await apiClient.post<unknown>("/grupos", payload, {
      headers: getAuthorizationHeaders(),
    });
    return parseGrupoResponse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo registrar el grupo"),
    );
  }
}

export async function updateGrupo(
  id: number,
  payload: AdminGrupoPayload,
  grupoActual: AdminGrupo,
): Promise<AdminGrupoResponse> {
  try {
    if (
      grupoActual.total_cursos !== undefined &&
      grupoActual.total_cursos > 0 &&
      payload.semestre_id !== grupoActual.semestre_id
    ) {
      throw new Error("Un grupo con cursos no puede cambiar de semestre.");
    }

    const response = await apiClient.put<unknown>(
      `/grupos/${encodeURIComponent(id)}`,
      payload,
      { headers: getAuthorizationHeaders() },
    );
    return parseGrupoResponse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo actualizar el grupo"),
    );
  }
}

export async function listAlumnosGrupo(
  grupoId: number,
  page?: number,
): Promise<AdminGrupoAlumnosPage> {
  try {
    parsePositiveInteger(grupoId, "ID de grupo");
    if (page !== undefined) {
      parsePositiveInteger(page, "número de página");
    }

    const response = await apiClient.get<unknown>(
      `/grupos/${encodeURIComponent(grupoId)}/alumnos`,
      {
        headers: getAuthorizationHeaders(),
        params: page === undefined ? undefined : { page },
      },
    );
    return parseGrupoAlumnosPage(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudieron cargar los alumnos del grupo"),
    );
  }
}

export async function addAlumnosGrupo(
  grupoId: number,
  alumnoIds: number[],
): Promise<AdminGrupoAlumnosResponse> {
  try {
    parsePositiveInteger(grupoId, "ID de grupo");
    if (
      alumnoIds.length === 0 ||
      alumnoIds.some(
        (alumnoId) => !Number.isSafeInteger(alumnoId) || alumnoId < 1,
      )
    ) {
      throw new Error("Selecciona al menos un alumno válido para agregar.");
    }

    const response = await apiClient.post<unknown>(
      `/grupos/${encodeURIComponent(grupoId)}/alumnos`,
      { alumno_ids: alumnoIds },
      { headers: getAuthorizationHeaders() },
    );
    return parseGrupoAlumnosResponse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudieron agregar los alumnos al grupo"),
    );
  }
}

export async function updateAlumnoGrupoEstado(
  grupoId: number,
  alumnoId: number,
  estado: AdminGrupoAlumnoEstado,
): Promise<AdminGrupoAlumnoEstadoResponse> {
  try {
    parsePositiveInteger(grupoId, "ID de grupo");
    parsePositiveInteger(alumnoId, "ID de alumno");

    const response = await apiClient.patch<unknown>(
      `/grupos/${encodeURIComponent(grupoId)}/alumnos/${encodeURIComponent(alumnoId)}`,
      { estado },
      { headers: getAuthorizationHeaders() },
    );
    return parseGrupoAlumnoEstadoResponse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "No se pudo actualizar el estado del alumno en el grupo",
      ),
    );
  }
}