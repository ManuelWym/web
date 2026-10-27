import { useEffect, useState, type FormEvent } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createUser,
  getUserImportStatus,
  listUsers,
  uploadUsersCsv,
} from "@/features/admin/services/AdminUserService";
import type {
  AdminUserRole,
  CreateUserPayload,
  UserListFilters,
  UserStatusFilter,
} from "@/features/admin/types/AdminUser";
import type {
  ImportStatusResponse,
  ImportUploadResponse,
} from "@/features/admin/types/UserImport";

const usersQueryKey = ["admin", "users"] as const;

const initialForm: CreateUserPayload = {
  numero_cuenta: "",
  nombre: "",
  rol: "alumno",
  nip: "",
  correo: "",
};

export function useAdminDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserListFilters>({ page: 1 });
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState(initialForm);
  const [csvFile, setCsvFile] = useState<File>();
  const [csvError, setCsvError] = useState("");
  const [importStatus, setImportStatus] =
    useState<ImportUploadResponse | null>(null);
  const [pollingStarted, setPollingStarted] = useState(false);

  const usersQuery = useQuery({
    queryKey: [...usersQueryKey, filters],
    queryFn: () => listUsers(filters),
  });

  const importStatusQuery = useQuery<ImportStatusResponse>({
    queryKey: ["admin", "user-import", importStatus?.id],
    queryFn: () => {
      if (!importStatus?.id) {
        throw new Error("No hay una importación para consultar.");
      }
      return getUserImportStatus(importStatus.id);
    },
    enabled: Boolean(
      pollingStarted &&
        importStatus?.id &&
        importStatus.estado === "en_proceso",
    ),
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      return query.state.data?.estado === "en_proceso" ? 2000 : false;
    },
  });

  const createUserMutation = useMutation({ mutationFn: createUser });
  const uploadCsvMutation = useMutation({ mutationFn: uploadUsersCsv });

  const currentImportStatus = importStatusQuery.data ?? importStatus;
  const importError =
    importStatusQuery.error instanceof Error
      ? importStatusQuery.error.message
      : "";

  useEffect(() => {
    if (!importStatus?.id || importStatus.estado !== "en_proceso") return;
    const timeoutId = window.setTimeout(() => setPollingStarted(true), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [importStatus?.id, importStatus?.estado]);

  useEffect(() => {
    if (importStatusQuery.data?.estado === "terminada") {
      void queryClient.invalidateQueries({ queryKey: usersQueryKey });
    }
  }, [importStatus?.id, importStatusQuery.data?.estado, queryClient]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchText.trim() || undefined;
    if (nextSearch === filters.buscar) {
      void usersQuery.refetch();
    }
    setFilters((current) => ({ ...current, buscar: nextSearch, page: 1 }));
  };

  const handleFilterChange = (
    key: "rol" | "estado",
    value: AdminUserRole | UserStatusFilter | "",
  ) => {
    if (value === (filters[key] ?? "")) {
      void usersQuery.refetch();
    }
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const handleFormChange = <K extends keyof CreateUserPayload>(
    key: K,
    value: CreateUserPayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await createUserMutation.mutateAsync(form);
      toast.success(response.message || "Usuario registrado correctamente.");
      setForm(initialForm);
      setFilters((current) => ({ ...current, page: 1 }));
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo registrar el usuario.",
      );
    }
  };

  const handleCsvFile = (file?: File) => {
    setCsvError("");
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setCsvFile(undefined);
      setCsvError("Selecciona un archivo con extensión .csv.");
      return;
    }
    setCsvFile(file);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setCsvError("Selecciona un archivo CSV antes de continuar.");
      return;
    }

    setCsvError("");
    setImportStatus(null);
    setPollingStarted(false);
    try {
      const response = await uploadCsvMutation.mutateAsync(csvFile);
      setImportStatus(response);
      setCsvFile(undefined);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo subir el archivo CSV.",
      );
    }
  };

  const retryImportStatus = async () => {
    await importStatusQuery.refetch();
  };

  return {
    filters,
    searchText,
    setSearchText,
    usersPage: usersQuery.data ?? null,
    loadingUsers: usersQuery.isFetching,
    listError:
      usersQuery.error instanceof Error ? usersQuery.error.message : "",
    handleSearch,
    handleFilterChange,
    handlePageChange,
    form,
    savingUser: createUserMutation.isPending,
    handleFormChange,
    handleCreateUser,
    csvFile,
    csvError,
    uploadingCsv: uploadCsvMutation.isPending,
    handleCsvFile,
    handleCsvImport,
    importStatus: currentImportStatus,
    importError,
    retryImportStatus,
  };
}
