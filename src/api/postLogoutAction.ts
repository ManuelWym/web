import { apiClient } from "./apiClient";

/**
 * Cierra la sesión revocando el token en la API y limpia el almacenamiento local.
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem("token");

  try {
    if (!token) return;

    await apiClient.post(
      "/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error("Error al revocar la sesión en el servidor:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
