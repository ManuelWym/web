import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@/features/admin/services/AdminUserService";
import type { AdminUser } from "@/features/admin/types/AdminUser";

export function useAdminGrupoAlumnos() {
  const query = useQuery({
    queryKey: ["admin", "grupo-alumnos"],
    queryFn: async () => {
      const alumnos: AdminUser[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const result = await listUsers({ rol: "alumno", page });
        alumnos.push(...result.data);
        lastPage = result.meta.last_page;
        page += 1;
      } while (page <= lastPage);

      return alumnos;
    },
  });

  return {
    alumnos: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : "",
  };
}
