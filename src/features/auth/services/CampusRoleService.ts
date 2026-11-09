import type { UserRole } from "@/features/auth/types/User";

export type CampusRole = UserRole;

function isCampusRole(role: string): role is CampusRole {
  return role === "alumno" || role === "docente" || role === "admin";
}

export function getSavedCampusRole(): CampusRole | null {
  const serializedUser = localStorage.getItem("user");
  if (!serializedUser) return null;

  try {
    const user: unknown = JSON.parse(serializedUser);
    if (
      typeof user === "object" &&
      user !== null &&
      "rol" in user &&
      typeof user.rol === "string"
    ) {
      return isCampusRole(user.rol) ? user.rol : null;
    }
  } catch (error) {
    console.error("No se pudo determinar el rol de la cuenta:", error);
  }

  return null;
}
