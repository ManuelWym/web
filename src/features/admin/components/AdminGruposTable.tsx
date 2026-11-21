import { Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminGrupo } from "@/features/admin/types/AdminGrupo";
import type { AdminSemestre } from "@/features/admin/types/AdminMateria";

interface AdminGruposTableProps {
  grupos: AdminGrupo[];
  semestres: AdminSemestre[];
  selectedId: number | null;
  activeCounts: Record<number, number>;
  onSelect: (id: number) => void;
  onEdit: (grupo: AdminGrupo) => void;
}

export function AdminGruposTable({
  grupos,
  semestres,
  selectedId,
  activeCounts,
  onSelect,
  onEdit,
}: AdminGruposTableProps) {
  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Semestre</th>
            <th>Turno</th>
            <th>Alumnos activos</th>
            <th>Cursos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => {
            const semestre = semestres.find(
              (item) => item.id === grupo.semestre_id,
            );
            return (
              <tr
                key={grupo.id}
                className={grupo.id === selectedId ? "bg-muted" : ""}
                onClick={() => onSelect(grupo.id)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(grupo.id);
                  }
                }}
                tabIndex={0}
                aria-current={grupo.id === selectedId ? "true" : undefined}
              >
                <td>{grupo.nombre}</td>
                <td>
                  {semestre?.nombre ?? grupo.semestre?.nombre ?? grupo.semestre_id}
                </td>
                <td>{grupo.turno ?? "—"}</td>
                <td>{activeCounts[grupo.id] ?? 0}</td>
                <td>{grupo.total_cursos ?? 0}</td>
                <td>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Ver alumnos de ${grupo.nombre}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(grupo.id);
                      }}
                    >
                      <Users aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${grupo.nombre}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(grupo);
                      }}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
