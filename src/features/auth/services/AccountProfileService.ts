import type {
  AccountProfile,
  AccountRole,
} from "@/features/auth/types/AccountProfile";

const roleStorageKey = "aula-role";

export function loadAccountProfile(): AccountProfile | null {
  const serializedUser = localStorage.getItem("user");
  if (!serializedUser) return null;

  try {
    const user: unknown = JSON.parse(serializedUser);
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
        typeof record.telefono === "string"
          ? record.telefono
          : "No disponible",
      role: typeof record.rol === "string" ? record.rol : "No disponible",
      isActive: typeof record.activo === "boolean" ? record.activo : null,
    };
  } catch (error) {
    console.error("No se pudo leer el perfil guardado del usuario:", error);
    return null;
  }
}

export function loadAccountRole(): AccountRole {
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

export function saveAccountRole(role: AccountRole): void {
  localStorage.setItem(roleStorageKey, role);
}
