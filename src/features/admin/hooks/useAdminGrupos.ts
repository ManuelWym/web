import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGrupo as createGrupoService,
  listGrupos,
  updateGrupo as updateGrupoService,
} from "@/features/admin/services/AdminGrupoService";
import type {
  AdminGrupo,
  AdminGrupoPayload,
} from "@/features/admin/types/AdminGrupo";

const gruposQueryKey = ["admin", "grupos"] as const;

export function useAdminGrupos() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: gruposQueryKey,
    queryFn: listGrupos,
  });
  const createMutation = useMutation({
    mutationFn: createGrupoService,
    onSuccess: ({ grupo }) => {
      queryClient.setQueryData<AdminGrupo[]>(
        gruposQueryKey,
        (current = []) => {
          const exists = current.some((item) => item.id === grupo.id);
          return exists
            ? current.map((item) => (item.id === grupo.id ? grupo : item))
            : [...current, grupo];
        },
      );
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      grupoActual,
    }: {
      id: number;
      payload: AdminGrupoPayload;
      grupoActual: AdminGrupo;
    }) => updateGrupoService(id, payload, grupoActual),
    onSuccess: ({ grupo }) => {
      queryClient.setQueryData<AdminGrupo[]>(
        gruposQueryKey,
        (current = []) => {
          const exists = current.some((item) => item.id === grupo.id);
          return exists
            ? current.map((item) =>
                item.id === grupo.id ? { ...item, ...grupo } : item,
              )
            : [...current, grupo];
        },
      );
    },
  });

  return {
    grupos: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : "",
    createGrupo: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateGrupo: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}
