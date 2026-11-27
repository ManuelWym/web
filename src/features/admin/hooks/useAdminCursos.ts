import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCurso,
  listCursos,
  listDocentesActivos,
  updateCursoDocente,
} from "@/features/admin/services/AdminCursoService";
import type {
  AdminCursoPayload,
  AdminCursosFilters,
} from "@/features/admin/types/AdminCurso";

const cursosQueryKey = ["admin", "cursos"] as const;

export function useAdminCursos(filters: AdminCursosFilters) {
  const queryClient = useQueryClient();
  const cursosQuery = useQuery({
    queryKey: [...cursosQueryKey, filters],
    queryFn: () => listCursos(filters),
  });
  const docentesQuery = useQuery({
    queryKey: ["admin", "docentes-activos"],
    queryFn: listDocentesActivos,
  });

  const createMutation = useMutation({ mutationFn: createCurso });
  const docenteMutation = useMutation({
    mutationFn: ({ id, docenteId }: { id: number; docenteId: number }) =>
      updateCursoDocente(id, docenteId),
  });

  const saveCurso = async (payload: AdminCursoPayload) => {
    try {
      const response = await createMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: cursosQueryKey });
      toast.success(response.message);
      return response.curso;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar el curso.";
      toast.error(message);
      throw new Error(message);
    }
  };

  const saveDocente = async (id: number, docenteId: number) => {
    try {
      const response = await docenteMutation.mutateAsync({ id, docenteId });
      await queryClient.invalidateQueries({ queryKey: cursosQueryKey });
      toast.success(response.message);
      return response.curso;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo asignar el docente.";
      toast.error(message);
      throw new Error(message);
    }
  };

  return {
    page: cursosQuery.data ?? null,
    loading: cursosQuery.isPending,
    error: cursosQuery.error instanceof Error ? cursosQuery.error.message : "",
    docentes: docentesQuery.data ?? [],
    loadingDocentes: docentesQuery.isPending,
    docentesError: docentesQuery.error instanceof Error ? docentesQuery.error.message : "",
    saving: createMutation.isPending,
    savingDocente: docenteMutation.isPending,
    saveCurso,
    saveDocente,
  };
}
