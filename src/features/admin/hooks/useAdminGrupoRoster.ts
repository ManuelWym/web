import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  addAlumnosGrupo,
  getAlumnosGrupoImportacionStatus,
  uploadAlumnosGrupoCsv,
  updateAlumnoGrupoEstado,
} from "@/features/admin/services/AdminGrupoService";
import { useAdminGrupoMembers } from "@/features/admin/hooks/useAdminGrupoMembers";
import type {
  AdminGrupoAlumnoEstado,
  AdminGrupoImportacionStatusResponse,
  AdminGrupoImportacionUploadResponse,
  AdminGrupoMiembro,
} from "@/features/admin/types/AdminGrupo";
import type { AdminUser } from "@/features/admin/types/AdminUser";

const initialCsv = "numero_cuenta,nombre,nip,correo,grupo";

export function useAdminGrupoRoster(
  grupoId: number | null,
  alumnos: AdminUser[],
) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [membersByPage, setMembersByPage] = useState<
    Record<string, AdminGrupoMiembro[]>
  >({});
  const [csv, setCsv] = useState(initialCsv);
  const [csvError, setCsvError] = useState("");
  const [importRecord, setImportRecord] = useState<{
    grupoId: number;
    status: AdminGrupoImportacionUploadResponse;
  } | null>(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const {
    page: apiPage,
    loading: loadingMembers,
    error: membersError,
  } = useAdminGrupoMembers(grupoId, page);
  const addMutation = useMutation({
    mutationFn: (alumnoId: number) => {
      if (grupoId === null) {
        throw new Error("Selecciona un grupo para agregar alumnos.");
      }
      return addAlumnosGrupo(grupoId, [alumnoId]);
    },
    onSuccess: async () => {
      if (grupoId !== null) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["admin", "grupos", grupoId, "alumnos"],
          }),
          queryClient.invalidateQueries({ queryKey: ["admin", "grupos"] }),
        ]);
      }
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({
      alumnoId,
      estado,
    }: {
      alumnoId: number;
      estado: AdminGrupoAlumnoEstado;
    }) => {
      if (grupoId === null) {
        throw new Error("Selecciona un grupo para actualizar sus alumnos.");
      }
      return updateAlumnoGrupoEstado(grupoId, alumnoId, estado);
    },
    onSuccess: async () => {
      if (grupoId !== null) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["admin", "grupos", grupoId, "alumnos"],
          }),
          queryClient.invalidateQueries({ queryKey: ["admin", "grupos"] }),
        ]);
      }
    },
  });
  const importMutation = useMutation({
    mutationFn: ({
      grupoId,
      file,
    }: {
      grupoId: number;
      file: File;
    }) => uploadAlumnosGrupoCsv(grupoId, file),
  });
  const importStatusQuery = useQuery<AdminGrupoImportacionStatusResponse>({
    queryKey: [
      "admin",
      "grupos",
      importRecord?.grupoId,
      "alumnos-importaciones",
      importRecord?.status.id,
    ],
    queryFn: () => {
      if (!importRecord) {
        throw new Error("No hay una importación para consultar.");
      }
      return getAlumnosGrupoImportacionStatus(
        importRecord.grupoId,
        importRecord.status.id,
      );
    },
    enabled: Boolean(
      pollingStarted &&
        importRecord?.grupoId === grupoId &&
        importRecord.status.estado === "en_proceso",
    ),
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      return query.state.data?.estado === "en_proceso" ? 2000 : false;
    },
  });

  const importRecordId = importRecord?.status.id;
  const importRecordState = importRecord?.status.estado;

  useEffect(() => {
    if (!importRecordId || importRecordState !== "en_proceso") return;
    const timeoutId = window.setTimeout(() => setPollingStarted(true), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [importRecordId, importRecordState]);

  useEffect(() => {
    if (
      importRecord &&
      importStatusQuery.data?.estado === "terminada"
    ) {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "grupos", importRecord.grupoId, "alumnos"],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin", "grupos"], exact: true }),
      ]);
    }
  }, [importRecord, importStatusQuery.data?.estado, queryClient]);

  const importStatus =
    importRecord?.grupoId === grupoId
      ? importStatusQuery.data ?? importRecord.status
      : null;
  const importError =
    importRecord?.grupoId === grupoId && importStatusQuery.error instanceof Error
      ? importStatusQuery.error.message
      : "";

  const apiMembers = (apiPage?.data ?? []).map((alumno) => ({
    alumno_id: alumno.alumno_id,
    numero_cuenta: alumno.numero_cuenta,
    nombre: alumno.nombre,
    activo: alumno.estado === "activo",
    baja_en: alumno.baja_en,
  }));
  const membersKey = grupoId === null ? null : `${grupoId}:${page}`;
  const miembros =
    membersKey === null
      ? []
      : (membersByPage[membersKey] ?? apiMembers);
  const disponibles = alumnos.filter(
    (alumno) =>
      alumno.activo &&
      !miembros.some((miembro) => miembro.alumno_id === alumno.id),
  );

  const setLista = (
    update: (current: AdminGrupoMiembro[]) => AdminGrupoMiembro[],
  ) => {
    if (membersKey === null) return;
    setMembersByPage((current) => ({
      ...current,
      [membersKey]: update(current[membersKey] ?? apiMembers),
    }));
  };

  const add = async (alumnoId: number) => {
    const alumno = disponibles.find((item) => item.id === alumnoId);
    if (!alumno) return null;

    const response = await addMutation.mutateAsync(alumno.id);
    if (response.agregados.includes(alumno.id)) {
      setLista((current) => [
        ...current,
        {
          alumno_id: alumno.id,
          numero_cuenta: alumno.numero_cuenta,
          nombre: alumno.nombre,
          activo: true,
          baja_en: null,
        },
      ]);
    }
    return { alumno, response };
  };

  const toggle = async (alumnoId: number) => {
    const member = miembros.find((item) => item.alumno_id === alumnoId);
    if (!member) return null;
    const response = await statusMutation.mutateAsync({
      alumnoId,
      estado: member.activo ? "baja" : "activo",
    });
    setLista((current) =>
      current.map((item) =>
        item.alumno_id === alumnoId
          ? {
              ...item,
              activo: response.alumno.estado === "activo",
              baja_en: response.alumno.baja_en,
            }
          : item,
      ),
    );
    return { message: response.message };
  };

  const importar = async () => {
    if (grupoId === null) {
      throw new Error("Selecciona un grupo para importar alumnos.");
    }
    if (!csv.trim()) {
      setCsvError("Agrega el contenido del CSV antes de importar.");
      return null;
    }
    const filasDeDatos = csv
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .filter((fila) => fila.trim() !== "");
    if (filasDeDatos.length === 0) {
      setCsvError("El CSV solo contiene el encabezado. Agrega al menos un alumno.");
      return null;
    }

    setCsvError("");
    setImportRecord(null);
    setPollingStarted(false);
    const file = new File([csv], "alumnos.csv", { type: "text/csv" });
    const result = await importMutation.mutateAsync({ grupoId, file });
    setImportRecord({ grupoId, status: result });
    return result;
  };

  const readCsv = async (file: File | undefined) => {
    if (!file) return false;
    try {
      setCsv(await file.text());
      setCsvError("");
      return true;
    } catch {
      setCsvError("No se pudo leer el archivo CSV.");
      return false;
    }
  };

  return {
    miembros,
    disponibles,
    page: apiPage,
    loadingMembers,
    membersError,
    adding: addMutation.isPending,
    updatingMember: statusMutation.isPending,
    currentPage: page,
    setPage,
    csv,
    setCsv,
    csvError,
    importing: importMutation.isPending,
    clearCsvError: () => setCsvError(""),
    clearImportStatus: () => {
      setImportRecord(null);
      setPollingStarted(false);
    },
    importStatus,
    importError,
    retryImportStatus: async () => {
      await importStatusQuery.refetch();
    },
    add,
    toggle,
    importar,
    readCsv,
  };
}
