import { useMemo } from "react";
import { useTable } from "@tanstack/react-table";
import {
  adminMateriaTableFeatures,
  createAdminMateriaColumns,
} from "@/features/admin/components/AdminMateriaColumns";
import type { AdminMateria } from "@/features/admin/types/AdminMateria";

interface AdminMateriasTableProps {
  materias: AdminMateria[];
  updatingStatus: boolean;
  onEdit: (materia: AdminMateria) => void;
  onToggle: (materia: AdminMateria) => void;
}

export function AdminMateriasTable({
  materias,
  updatingStatus,
  onEdit,
  onToggle,
}: AdminMateriasTableProps) {
  const columns = useMemo(
    () => createAdminMateriaColumns(onEdit, onToggle, updatingStatus),
    [onEdit, onToggle, updatingStatus],
  );
  const table = useTable({
    features: adminMateriaTableFeatures,
    columns,
    data: materias,
  });
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className="materias-table-wrap">
      <table className="materias-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
          {materias.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="admin-empty-state materias-empty">
                No se encontraron materias.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
