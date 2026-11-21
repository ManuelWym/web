import { useQuery } from "@tanstack/react-query";
import { listAlumnosGrupo } from "@/features/admin/services/AdminGrupoService";

export function useAdminGrupoMembers(
  grupoId: number | null,
  page: number,
) {
  const query = useQuery({
    queryKey: ["admin", "grupos", grupoId, "alumnos", page],
    queryFn: () => {
      if (grupoId === null) {
        throw new Error("Selecciona un grupo para cargar sus alumnos.");
      }
      return listAlumnosGrupo(grupoId, page);
    },
    enabled: grupoId !== null,
  });

  return {
    page: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : "",
  };
}
