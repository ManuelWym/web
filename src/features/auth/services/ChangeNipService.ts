import axios from "axios";
import type { ApiErrorResponse } from "@/features/auth/types/ApiErrorResponse";
import type { ChangeNipPayload } from "@/features/auth/types/ChangeNip";
import { apiClient } from "@/services/ApiClient";

export async function changeNip(payload: ChangeNipPayload): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Tu sesión expiró. Inicia sesión para cambiar tu contraseña.");
  }

  try {
    await apiClient.post("/cambiar-nip", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al cambiar la contraseña.",
      );
    }

    const response = error.response;
    if (!response) {
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo más tarde.");
    }

    const validationMessage = Object.values(response.data?.errors ?? {})
      .flat()
      .find((message) => typeof message === "string");

    throw new Error(
      validationMessage ??
        response.data?.message ??
        `No se pudo cambiar la contraseña (HTTP ${response.status}).`,
    );
  }
}
