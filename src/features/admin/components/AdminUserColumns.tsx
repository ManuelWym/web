import {
  createColumnHelper,
  tableFeatures,
} from "@tanstack/react-table";
import type { AdminUser } from "@/features/admin/types/AdminUser";

export const adminUserTableFeatures = tableFeatures({});

export const adminUserRoleLabels = {
  admin: "Admin",
  docente: "Docente",
  alumno: "Alumno",
} as const;

const columnHelper = createColumnHelper<
  typeof adminUserTableFeatures,
  AdminUser
>();

export const adminUserColumns = columnHelper.columns([
  columnHelper.accessor("numero_cuenta", {
    header: "Número de cuenta",
  }),
  columnHelper.accessor("nombre", {
    header: "Nombre",
  }),
  columnHelper.accessor("correo", {
    header: "Correo",
  }),
  columnHelper.accessor("rol", {
    header: "Rol",
    cell: (info) => adminUserRoleLabels[info.getValue()],
  }),
  columnHelper.accessor("activo", {
    header: "Estado",
    cell: (info) => (info.getValue() ? "Activo" : "Inactivo"),
  }),
]);
