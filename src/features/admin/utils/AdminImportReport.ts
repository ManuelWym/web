import type { ImportStatusResponse } from "@/features/admin/types/UserImport";

const importReportLabels: Record<string, string> = {
  creados: "Registros creados",
  omitidos: "Usuarios omitidos",
  errores: "Errores",
};

const createdUsersKeys = [
  "usuarios_creados",
  "usuariosCreados",
  "createdUsers",
  "created_users",
  "users_created",
  "detalle_creados",
  "creados_detalle",
];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getImportReportEntries(
  status: ImportStatusResponse,
): [string, unknown][] {
  return Object.entries(status).filter(
    ([key]) => !["id", "estado", "mensaje", ...createdUsersKeys].includes(key),
  );
}

export function formatImportReportKey(key: string): string {
  return (
    importReportLabels[key] ??
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export function formatImportReportItem(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${formatImportReportKey(key)} ${formatImportReportItem(item)}`,
      )
      .join(" · ");
  }

  return "";
}
