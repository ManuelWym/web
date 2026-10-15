export type CampusRole = "student" | "teacher" | "admin";

export function normalizeCampusRole(role: string): CampusRole | null {
  switch (role.trim().toLowerCase()) {
    case "estudiante":
    case "alumno":
    case "student":
      return "student";
    case "profesor":
    case "docente":
    case "teacher":
      return "teacher";
    case "administrador":
    case "admin":
      return "admin";
    default:
      return null;
  }
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
      return normalizeCampusRole(user.rol);
    }
  } catch (error) {
    console.error("No se pudo determinar el rol de la cuenta:", error);
  }

  return null;
}
