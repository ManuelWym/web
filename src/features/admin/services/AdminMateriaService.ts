import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import { apiClient } from "@/services/ApiClient";
import type {
  AdminMateria,
  AdminSemestre,
  MateriaPayload,
  MateriaResponse,
} from "@/features/admin/types/AdminMateria";

function getAuthorizationHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error(
      "Tu sesión expiró. Inicia sesión para administrar materias.",
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

  const validationMessage = Object.values(response.data?.errors ?? {})
    .flat()
    .find((message) => typeof message === "string");

  return (
    validationMessage ??
    response.data?.message ??
    `${fallback} (HTTP ${response.status}).`
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseId(value: unknown, field: string): number {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error(`La API devolvió un ${field} no válido.`);
  }
  return id;
}

function parseMateria(value: unknown): AdminMateria {
  if (!isRecord(value)) {
    throw new Error("La API devolvió una materia con formato no válido.");
  }

  const activa =
    value.activa === true || value.activa === 1 || value.activa === "1"
      ? true
      : value.activa === false || value.activa === 0 || value.activa === "0"
        ? false
        : undefined;

  if (
    typeof value.clave !== "string" ||
    typeof value.nombre !== "string" ||
    activa === undefined
  ) {
    throw new Error("La API devolvió una materia con formato no válido.");
  }

  return {
    id: parseId(value.id, "ID de materia"),
    semestre_id: parseId(value.semestre_id, "ID de semestre"),
    clave: value.clave,
    nombre: value.nombre,
    activa,
  };
}

function parseSemestre(value: unknown): AdminSemestre {
  if (
    !isRecord(value) ||
    typeof value.nombre !== "string" ||
    !Number.isSafeInteger(value.numero) ||
    !Array.isArray(value.materias)
  ) {
    throw new Error("La API devolvió un semestre con formato no válido.");
  }
  return {
    id: parseId(value.id, "ID de semestre"),
    numero: parseId(value.numero, "número de semestre"),
    nombre: value.nombre,
    materias: value.materias.map(parseMateria),
  };
}

function parseList(value: unknown, resource: "materias" | "semestres"): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    const list = value[resource] ?? value.data;
    if (Array.isArray(list)) return list;
  }
  throw new Error(`La API devolvió una lista de ${resource} con formato no válido.`);
}

function parseMateriaResponse(value: unknown): MateriaResponse {
  if (
    !isRecord(value) ||
    typeof value.message !== "string" ||
    !("materia" in value)
  ) {
    throw new Error("La API devolvió una respuesta de materia con formato no válido.");
  }
  return { message: value.message, materia: parseMateria(value.materia) };
}

export async function listSemestres(): Promise<AdminSemestre[]> {
  try {
    const response = await apiClient.get<unknown>("/semestres", {
      headers: getAuthorizationHeaders(),
    });
    return parseList(response.data, "semestres").map(parseSemestre);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar los semestres"));
  }
}

export async function createMateria(
  payload: MateriaPayload,
): Promise<MateriaResponse> {
  try {
    const response = await apiClient.post<unknown>("/materias", payload, {
      headers: getAuthorizationHeaders(),
    });
    return parseMateriaResponse(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo registrar la materia"));
  }
}

export async function updateMateria(
  id: number,
  payload: MateriaPayload,
): Promise<MateriaResponse> {
  try {
    const response = await apiClient.put<unknown>(
      `/materias/${encodeURIComponent(id)}`,
      payload,
      { headers: getAuthorizationHeaders() },
    );
    return parseMateriaResponse(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo actualizar la materia"));
  }
}

export async function updateMateriaStatus(
  materia: AdminMateria,
): Promise<MateriaResponse> {
  try {
    const response = await apiClient.patch<unknown>(
      `/materias/${encodeURIComponent(materia.id)}/estado`,
      { activa: !materia.activa },
      { headers: getAuthorizationHeaders() },
    );
    return parseMateriaResponse(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo modificar el estado de la materia"),
    );
  }
}
