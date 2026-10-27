import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import { apiClient } from "@/services/ApiClient";
import type {
  AdminUser,
  AdminUserRole,
  CreateUserPayload,
  CreateUserResponse,
  ResetUserNipPayload,
  UpdateUserPayload,
  UpdateUserResponse,
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
  UserListFilters,
  UsersPage,
} from "@/features/admin/types/AdminUser";
import type {
  ImportStatusResponse,
  ImportUploadResponse,
} from "@/features/admin/types/UserImport";

type ApiUserRole = "alumno" | "docente" | "administrador";

type ApiAdminUser = Omit<AdminUser, "rol"> & { rol: string };
type ApiUsersPage = Omit<UsersPage, "data"> & { data: ApiAdminUser[] };
type ApiCreateUserResponse = Omit<CreateUserResponse, "user"> & {
  user: ApiAdminUser;
};
type ApiUpdateUserResponse = Omit<UpdateUserResponse, "user"> & {
  user: ApiAdminUser;
};
type ApiUpdateUserStatusResponse = Omit<UpdateUserStatusResponse, "user"> & {
  user: ApiAdminUser;
};

function fromApiRole(role: string): AdminUserRole {
  // The admin API uses "administrador"; the app represents that role as "admin".
  switch (role) {
    case "alumno":
    case "docente":
      return role;
    case "administrador":
      return "admin";
    default:
      throw new Error("La API de usuarios devolvió un rol no reconocido.");
  }
}

function toApiRole(role: AdminUserRole): ApiUserRole {
  // The admin API uses "administrador"; the app represents that role as "admin".
  return role === "admin" ? "administrador" : role;
}

function fromApiAdminUser(user: ApiAdminUser): AdminUser {
  return { ...user, rol: fromApiRole(user.rol) };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("El archivo CSV contiene comillas sin cerrar.");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function serializeCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((field) =>
          /[",\r\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field,
        )
        .join(","),
    )
    .join("\r\n");
}

async function toApiCsvFile(file: File): Promise<File> {
  const contents = await file.text();
  const rows = parseCsv(contents);
  const roleColumn = rows[0]?.findIndex(
    (column) => column.trim().toLowerCase() === "rol",
  );
  if (roleColumn === undefined || roleColumn < 0) return file;

  // The import API expects "administrador"; the app's CSV uses "admin".
  for (const row of rows.slice(1)) {
    if (row[roleColumn]?.trim().toLowerCase() === "admin") {
      row[roleColumn] = "administrador";
    }
  }

  return new File([serializeCsv(rows)], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

function getAuthorizationHeaders(): { Authorization: string } {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error(
      "Tu sesión expiró. Inicia sesión para administrar usuarios.",
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

export async function listUsers(
  filters: UserListFilters = {},
): Promise<UsersPage> {
  try {
    const response = await apiClient.get<ApiUsersPage>("/usuarios", {
      headers: getAuthorizationHeaders(),
      params: {
        ...filters,
        rol: filters.rol ? toApiRole(filters.rol) : undefined,
      },
    });
    return {
      ...response.data,
      data: response.data.data.map(fromApiAdminUser),
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudieron cargar los usuarios"),
    );
  }
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  try {
    const response = await apiClient.post<ApiCreateUserResponse>(
      "/usuarios",
      { ...payload, rol: toApiRole(payload.rol) },
      { headers: getAuthorizationHeaders() },
    );
    return { ...response.data, user: fromApiAdminUser(response.data.user) };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo registrar el usuario"),
    );
  }
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> {
  try {
    const response = await apiClient.put<ApiUpdateUserResponse>(
      `/usuarios/${encodeURIComponent(id)}`,
      { ...payload, rol: toApiRole(payload.rol) },
      { headers: getAuthorizationHeaders() },
    );
    return { ...response.data, user: fromApiAdminUser(response.data.user) };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo actualizar el usuario"),
    );
  }
}

export async function updateUserStatus(
  id: number,
  payload: UpdateUserStatusPayload,
): Promise<UpdateUserStatusResponse> {
  try {
    const response = await apiClient.patch<ApiUpdateUserStatusResponse>(
      `/usuarios/${encodeURIComponent(id)}/estado`,
      payload,
      { headers: getAuthorizationHeaders() },
    );
    return { ...response.data, user: fromApiAdminUser(response.data.user) };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo modificar el estado del usuario"),
    );
  }
}

export async function resetUserNip(
  id: number,
  payload: ResetUserNipPayload,
): Promise<void> {
  try {
    await apiClient.post(
      `/usuarios/${encodeURIComponent(id)}/restablecer-nip`,
      payload,
      { headers: getAuthorizationHeaders() },
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo restablecer el NIP del usuario"),
    );
  }
}

export async function uploadUsersCsv(
  file: File,
): Promise<ImportUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("archivo", await toApiCsvFile(file));
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
