import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listUsers,
  resetUserNip,
  updateUser,
  updateUserStatus,
} from "@/features/admin/services/AdminUserService";
import type {
  AdminUser,
  AdminUserRole,
  ResetUserNipPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UsersPage,
} from "@/features/admin/types/AdminUser";
import { adminUserRoles, isAdminUserRole } from "@/features/admin/utils/AdminUserUtils";

const adminUsersQueryKey = ["admin", "users"] as const;

export function useAdminUpdate() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserRole>("alumno");
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [newNip, setNewNip] = useState("");
  const [nipError, setNipError] = useState("");
  const selectedUserIdRef = useRef<number | null>(null);
  const skipSelectionSyncRef = useRef(false);

  const usersQuery = useQuery({
    queryKey: [...adminUsersQueryKey, page, search],
    queryFn: () => listUsers({ page, buscar: search || undefined }),
    staleTime: 0,
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserPayload;
    }) => updateUser(id, payload),
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserStatusPayload;
    }) => updateUserStatus(id, payload),
  });
  const nipMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ResetUserNipPayload;
    }) => resetUserNip(id, payload),
  });

  const users = usersQuery.data?.data ?? [];
  const pagination = usersQuery.data?.meta ?? null;
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const loading = usersQuery.isFetching;
  const loadError =
    usersQuery.error instanceof Error ? usersQuery.error.message : "";

  useEffect(() => {
    if (skipSelectionSyncRef.current) {
      skipSelectionSyncRef.current = false;
      return;
    }
    if (!usersQuery.data) return;

    const currentSelectedId = selectedUserIdRef.current;
    const nextSelectedUser = usersQuery.data.data.some(
      (user) => user.id === currentSelectedId,
    )
      ? (usersQuery.data.data.find((user) => user.id === currentSelectedId) ??
        null)
      : (usersQuery.data.data[0] ?? null);
    const nextSelectedUserId = nextSelectedUser?.id ?? null;
    selectedUserIdRef.current = nextSelectedUserId;
    setSelectedUserId(nextSelectedUserId);
    setName(nextSelectedUser?.nombre ?? "");
    setEmail(nextSelectedUser?.correo ?? "");
    setRole(
      nextSelectedUser && isAdminUserRole(nextSelectedUser.rol)
        ? nextSelectedUser.rol
        : "alumno",
    );
    setActiveStatus(nextSelectedUser?.activo ?? true);
    setError("");
    setStatusError("");
    setNewNip("");
    setNipError("");
  }, [usersQuery.data]);

  const updateCachedUser = (updatedUser: AdminUser) => {
    skipSelectionSyncRef.current = true;
    queryClient.setQueriesData<UsersPage>(
      { queryKey: adminUsersQueryKey },
      (currentPage) =>
        currentPage
          ? {
              ...currentPage,
              data: currentPage.data.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
              ),
            }
          : currentPage,
    );
  };

  const resetUserFeedback = () => {
    setError("");
    setStatusError("");
    setNewNip("");
    setNipError("");
  };

  const pickUser = (user: AdminUser) => {
    selectedUserIdRef.current = user.id;
    setSelectedUserId(user.id);
    setName(user.nombre);
    setEmail(user.correo);
    setRole(isAdminUserRole(user.rol) ? user.rol : "alumno");
    resetUserFeedback();
    setActiveStatus(user.activo);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchText.trim();
    if (page === 1 && nextSearch === search) return;
    setPage(1);
    setSearch(nextSearch);
  };

  const changePage = (nextPage: number) => setPage(nextPage);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Correo inválido.");
      return;
    }
    if (!adminUserRoles.includes(role)) {
      setError("Rol no reconocido.");
      return;
    }
    if (!selectedUser) {
      setError("Selecciona un usuario para actualizar.");
      return;
    }

    setError("");
    try {
      const response = await updateMutation.mutateAsync({
        id: selectedUser.id,
        payload: {
          nombre: name.trim(),
          correo: email.trim().toLowerCase(),
          rol: role,
        },
      });
      updateCachedUser(response.user);
      setName(response.user.nombre);
      setEmail(response.user.correo);
      setRole(isAdminUserRole(response.user.rol) ? response.user.rol : role);
      toast.success("Cambios guardados");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar el usuario.",
      );
    }
  };

  const saveStatus = async () => {
    if (!selectedUser) {
      setStatusError("Selecciona un usuario.");
      return;
    }
    if (selectedUser.activo === activeStatus) {
      setStatusError(
        `El usuario ya está ${activeStatus ? "activo" : "inactivo"}.`,
      );
      return;
    }

    setStatusError("");
    try {
      const response = await statusMutation.mutateAsync({
        id: selectedUser.id,
        payload: { activo: activeStatus },
      });
      updateCachedUser(response.user);
      setActiveStatus(response.user.activo);
      toast.success("Estado actualizado");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar el estado del usuario.",
      );
    }
  };

  const saveNewNip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) {
      setNipError("Selecciona un usuario.");
      return;
    }
    if (!newNip.trim()) {
      setNipError("Escribe el NIP nuevo.");
      return;
    }

    setNipError("");
    try {
      await nipMutation.mutateAsync({
        id: selectedUser.id,
        payload: { nip: newNip },
      });
      setNewNip("");
      toast.success("NIP asignado");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo restablecer el NIP del usuario.",
      );
    }
  };

  return {
    users,
    pagination,
    selectedUser,
    selectedUserId,
    searchText,
    setSearchText,
    page,
    loading,
    loadError,
    handleSearch,
    changePage,
    pickUser,
    name,
    setName,
    email,
    setEmail,
    role,
    setRole,
    error,
    saving: updateMutation.isPending,
    save,
    activeStatus,
    setActiveStatus,
    statusError,
    setStatusError,
    savingStatus: statusMutation.isPending,
    saveStatus,
    newNip,
    setNewNip,
    nipError,
    setNipError,
    resettingNip: nipMutation.isPending,
    saveNewNip,
  };
}
