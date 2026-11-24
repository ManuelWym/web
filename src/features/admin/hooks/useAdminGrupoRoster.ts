import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addAlumnosGrupo,
  updateAlumnoGrupoEstado,
} from "@/features/admin/services/AdminGrupoService";
import { useAdminGrupoMembers } from "@/features/admin/hooks/useAdminGrupoMembers";
import type {
  AdminGrupoAlumnoEstado,
  AdminGrupoImportacion,
  AdminGrupoMiembro,
} from "@/features/admin/types/AdminGrupo";
import type { AdminUser } from "@/features/admin/types/AdminUser";

const initialCsv = "numero_cuenta\n20261003\n20261004\n123";

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
  const [imports, setImports] = useState<AdminGrupoImportacion[]>([]);
  const [importId, setImportId] = useState("");
  const [consulta, setConsulta] = useState<
    AdminGrupoImportacion | null | undefined
  >();
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

  const importar = () => {
    if (grupoId === null) return null;
    const imp: AdminGrupoImportacion = {
      id: imports.length + 1,
      grupo_id: grupoId,
      agregados: [],
      omitidos: [],
      errores: [],
    };
    const nuevos: AdminGrupoMiembro[] = [];

    csv
      .trim()
      .split(/\r?\n/)
      .forEach((raw, index) => {
        const cuenta = raw.split(",")[0]?.trim() ?? "";
        if (!cuenta || (index === 0 && /numero_cuenta/i.test(cuenta))) return;
        const alumno = alumnos.find((item) => item.numero_cuenta === cuenta);
        if (!/^\d{8}$/.test(cuenta)) {
          imp.errores.push(`${cuenta}: número de cuenta inválido`);
        } else if (!alumno) {
          imp.errores.push(`${cuenta}: alumno no encontrado`);
        } else if (
          miembros.some((item) => item.alumno_id === alumno.id) ||
          nuevos.some((item) => item.alumno_id === alumno.id)
        ) {
          imp.omitidos.push(`${cuenta}: ya está en el grupo`);
        } else {
          nuevos.push({
            alumno_id: alumno.id,
            numero_cuenta: alumno.numero_cuenta,
            nombre: alumno.nombre,
            activo: true,
            baja_en: null,
          });
          imp.agregados.push(cuenta);
        }
      });

    setLista((current) => [...current, ...nuevos]);
    setImports((current) => [...current, imp]);
    setConsulta(imp);
    setImportId(String(imp.id));
    return imp;
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

  const lookupImport = () => {
    if (grupoId === null) return;
    setConsulta(
      imports.find(
        (item) =>
          String(item.id) === importId.trim() && item.grupo_id === grupoId,
      ) ?? null,
    );
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
    clearCsvError: () => setCsvError(""),
    importId,
    setImportId,
    consulta,
    setConsulta,
    add,
    toggle,
    importar,
    readCsv,
    lookupImport,
  };
}
