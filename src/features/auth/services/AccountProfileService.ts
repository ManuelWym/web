import axios from "axios";
import type {
  AccountDashboardRole,
  AccountProfile,
} from "@/features/auth/types/AccountProfile";
import { normalizeCampusRole } from "@/features/auth/services/CampusRoleService";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import { apiClient } from "@/services/ApiClient";

const roleStorageKey = "aula-role";

function toAccountProfile(user: unknown): AccountProfile | null {
  if (typeof user !== "object" || user === null) return null;

  const record = user as Record<string, unknown>;
  if (
    (typeof record.id !== "string" && typeof record.id !== "number") ||
    typeof record.nombre !== "string" ||
    typeof record.numero_cuenta !== "string"
  ) {
    return null;
  }

  return {
    id: String(record.id),
    name: record.nombre,
    accountNumber: record.numero_cuenta,
    email: typeof record.correo === "string" ? record.correo : "No disponible",
    phone:
      typeof record.telefono === "string" ? record.telefono : "No disponible",
    role: getAccountRole(record.rol),
    isActive: typeof record.activo === "boolean" ? record.activo : null,
  };
}

function getAccountRole(role: unknown): AccountProfile["role"] {
  if (typeof role !== "string") return "No disponible";

  switch (normalizeCampusRole(role)) {
    case "student":
      return "alumno";
    case "teacher":
      return "docente";
    case "admin":
      return "administrador";
    default:
      return "No disponible";
  }
}

export function loadAccountProfile(): AccountProfile | null {
  const serializedUser = localStorage.getItem("user");
  if (!serializedUser) return null;

  try {
    return toAccountProfile(JSON.parse(serializedUser));
  } catch (error) {
    console.error("No se pudo leer el perfil guardado del usuario:", error);
    return null;
  }
}

export async function fetchAccountProfile(): Promise<AccountProfile> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Tu sesión expiró. Inicia sesión para ver tu perfil.");
  }

  try {
    const response = await apiClient.get<unknown>("/mi-perfil", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = response.data;
    const profileData =
      typeof payload === "object" && payload !== null && "user" in payload
        ? payload.user
        : typeof payload === "object" &&
            payload !== null &&
            "data" in payload
          ? payload.data
          : payload;
    const profile = toAccountProfile(profileData);

    if (!profile) {
      throw new Error("La respuesta de la API no contiene un perfil válido.");
    }

    return profile;
  } catch (error) {
    if (error instanceof Error && !axios.isAxiosError(error)) throw error;
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new Error("Ocurrió un error inesperado al cargar el perfil.");
    }

    if (!error.response) {
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo más tarde.");
    }

    throw new Error(
      error.response.data?.message ??
        `No se pudo cargar el perfil (HTTP ${error.response.status}).`,
    );
  }
}

export function loadAccountRole(): AccountDashboardRole {
  const savedRole = localStorage.getItem(roleStorageKey);
  if (savedRole === "administrador" || savedRole === "estudiante") {
    return savedRole;
  }

  const serializedUser = localStorage.getItem("user");
  if (serializedUser) {
    try {
      const user: unknown = JSON.parse(serializedUser);
      if (
        typeof user === "object" &&
        user !== null &&
        "rol" in user &&
        typeof user.rol === "string" &&
        ["administrador", "admin"].includes(user.rol.trim().toLowerCase())
      ) {
        return "administrador";
      }
    } catch (error) {
      console.error("No se pudo leer el rol guardado del usuario:", error);
    }
  }

  return "estudiante";
}

export function saveAccountRole(role: AccountDashboardRole): void {
  localStorage.setItem(roleStorageKey, role);
}
