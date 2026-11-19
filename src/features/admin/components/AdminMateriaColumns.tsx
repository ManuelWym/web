import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import { Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminMateria } from "@/features/admin/types/AdminMateria";

export const adminMateriaTableFeatures = tableFeatures({});

const columnHelper = createColumnHelper<
  typeof adminMateriaTableFeatures,
  AdminMateria
>();

export function createAdminMateriaColumns(
  onEdit: (materia: AdminMateria) => void,
  onToggle: (materia: AdminMateria) => void,
  updatingStatus: boolean,
) {
  return columnHelper.columns([
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("semestre_id", { header: "ID de semestre" }),
    columnHelper.accessor("clave", { header: "Clave" }),
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: (info) => (
        <span className="materia-name">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("activa", {
      header: "Estado",
      cell: (info) => (
        <span
          className={
            info.getValue()
              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"
              : "rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {info.getValue() ? "Activa" : "Inactiva"}
        </span>
      ),
    }),
    columnHelper.accessor("id", {
      id: "acciones",
      header: "Acciones",
      cell: (info) => {
        const materia = info.row.original;
        return (
          <div className="materias-actions">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={`Editar ${materia.nombre}`}
              aria-label={`Editar ${materia.nombre}`}
              onClick={() => onEdit(materia)}
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={`${materia.activa ? "Desactivar" : "Activar"} ${materia.nombre}`}
              aria-label={`${materia.activa ? "Desactivar" : "Activar"} ${materia.nombre}`}
              disabled={updatingStatus}
              onClick={() => onToggle(materia)}
            >
              <Power aria-hidden="true" />
            </Button>
          </div>
        );
      },
    }),
  ]);
}
