import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import { apiClient } from "@/services/ApiClient";
import type {
  CreateUserPayload,
  CreateUserResponse,
  UserListFilters,
  UsersPage,
} from "@/features/admin/types/AdminUser";
import type {
  ImportStatusResponse,
  ImportUploadResponse,
} from "@/features/admin/types/UserImport";

function getAuthorizationHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Tu sesión expiró. Inicia sesión para administrar usuarios.");
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

export async function listUsers(filters: UserListFilters = {}): Promise<UsersPage> {
  try {
    const response = await apiClient.get<UsersPage>("/usuarios", {
      headers: getAuthorizationHeaders(),
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar los usuarios"));
  }
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  try {
    const response = await apiClient.post<CreateUserResponse>(
      "/usuarios",
      payload,
      { headers: getAuthorizationHeaders() },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo registrar el usuario"));
  }
}

export async function uploadUsersCsv(file: File): Promise<ImportUploadResponse> {
  const formData = new FormData();
  formData.append("archivo", file);

  try {
    const response = await apiClient.post<ImportUploadResponse>(
      "/usuarios/importaciones",
      formData,
      {
        headers: {
          ...getAuthorizationHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo iniciar la importación"),
    );
  }
}

export async function getUserImportStatus(
  id: string,
): Promise<ImportStatusResponse> {
  try {
    const response = await apiClient.get<ImportStatusResponse>(
      `/usuarios/importaciones/${encodeURIComponent(id)}`,
      { headers: getAuthorizationHeaders() },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo consultar la importación"),
    );
  }
}
