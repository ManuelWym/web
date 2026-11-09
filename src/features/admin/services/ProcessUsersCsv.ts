import type { ImportResult, UserImportRow } from "@/features/admin/types/UserImport";

const existingEmails = ["alex.villa@ejemplo.edu", "laura.mendez@ejemplo.edu"];
const validRoles = ["estudiante", "docente", "administrador"];
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function processUsersCsv(text: string): ImportResult {
  const result: ImportResult = { created: [], skipped: [], errors: [] };
  const seenEmails = new Set(existingEmails);

  text.split(/\r?\n/).forEach((raw, index) => {
    if (index === 0 && /correo/i.test(raw)) return;
    if (!raw.trim()) return;

    const [name = "", email = "", role = ""] = raw
      .split(",")
      .map((value) => value.trim());
    const row: UserImportRow = {
      line: index + 1,
      name,
      email: email.toLowerCase(),
      role: role.toLowerCase(),
    };

    if (!name || !emailPattern.test(row.email)) {
      result.errors.push({ ...row, reason: "Nombre o correo inválido" });
    } else if (!validRoles.includes(row.role)) {
      result.errors.push({ ...row, reason: "Rol no reconocido" });
    } else if (seenEmails.has(row.email)) {
      result.skipped.push({ ...row, reason: "El usuario ya existe" });
    } else {
      seenEmails.add(row.email);
      result.created.push(row);
    }
  });

  return result;
}
