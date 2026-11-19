import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMateria,
  listSemestres,
  updateMateria,
  updateMateriaStatus,
} from "@/features/admin/services/AdminMateriaService";
import type {
  AdminMateria,
  MateriaPayload,
} from "@/features/admin/types/AdminMateria";

const semestresQueryKey = ["admin", "semestres"] as const;

export function useAdminMaterias() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");

  // GET /semestres devuelve los semestres con sus materias: una sola consulta
  // alimenta el selector de semestres y la tabla de materias.
  const semestresQuery = useQuery({
    queryKey: semestresQueryKey,
    queryFn: listSemestres,
  });
  const semestres = semestresQuery.data ?? [];
  const materias = semestres.flatMap((semestre) => semestre.materias);

  const createMutation = useMutation({ mutationFn: createMateria });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MateriaPayload }) =>
      updateMateria(id, payload),
  });
  const statusMutation = useMutation({ mutationFn: updateMateriaStatus });

  const saveMateria = async (
    payload: MateriaPayload,
    editingId: number | null,
  ): Promise<boolean> => {
    setFormError("");
    try {
      const response =
        editingId === null
          ? await createMutation.mutateAsync(payload)
          : await updateMutation.mutateAsync({ id: editingId, payload });
      toast.success(response.message);
      await queryClient.invalidateQueries({ queryKey: semestresQueryKey });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar la materia.";
      setFormError(message);
      toast.error(message);
      return false;
    }
  };

  const toggleMateria = async (materia: AdminMateria) => {
    try {
      const response = await statusMutation.mutateAsync(materia);
      toast.success(response.message);
      await queryClient.invalidateQueries({ queryKey: semestresQueryKey });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo modificar el estado de la materia.",
      );
    }
  };

  const queryError =
    semestresQuery.error instanceof Error ? semestresQuery.error.message : "";

  return {
    materias,
    semestres,
    // isPending solo es true en la primera carga; así la tabla no desaparece
    // cada vez que se refresca después de guardar.
    loading: semestresQuery.isPending,
    error: queryError,
    saving: createMutation.isPending || updateMutation.isPending,
    updatingStatus: statusMutation.isPending,
    formError,
    setFormError,
    clearFormError: () => setFormError(""),
    saveMateria,
    toggleMateria,
  };
}
