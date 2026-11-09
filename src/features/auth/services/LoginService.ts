import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import type { LoginResponse } from "@/features/auth/types/LoginResponse";
import type { User, UserRole } from "@/features/auth/types/User";
import { apiClient } from "@/services/ApiClient";
import { AxiosError } from "axios";

interface ApiLoginResponse extends Omit<LoginResponse, "user"> {
  user: Omit<User, "rol"> & { rol: string };
}

function toUserRole(role: string): UserRole {
  // The login API uses "administrador"; the app represents that role as "admin".
  switch (role) {
    case "alumno":
    case "docente":
      return role;
    case "administrador":
      return "admin";
    default:
      throw new Error("La API de inicio de sesión devolvió un rol no reconocido.");
  }
}

/**
 * Envía las credenciales al endpoint de login.
 * @param matricula Número de cuenta / matrícula
 * @param nip NIP del usuario
 * 
 */
export async function login(
  matricula: string,
  nip: string,
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<ApiLoginResponse>("/login", {
      numero_cuenta: matricula,
      nip,
    });

    return {
      ...response.data,
      user: {
        ...response.data.user,
        rol: toUserRole(response.data.user.rol),
      },
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        // Error retornado por la API (Laravel)
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(
          errorData?.message ??
            `Error al iniciar sesión (HTTP ${error.response.status}).`,
        );
      } else if (error.request) {
        // No hubo respuesta del servidor
        throw new Error(
          "No se pudo conectar con el servidor. Intenta de nuevo más tarde.",
        );
      }
    }
    throw new Error("Ocurrió un error inesperado al intentar iniciar sesión.");
  }
}
