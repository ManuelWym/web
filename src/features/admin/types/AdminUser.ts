export type AdminUserRole = "administrador" | "docente" | "alumno";
export type UserStatusFilter = "activo" | "inactivo";

export interface AdminUser {
  id: number;
  numero_cuenta: string;
  nombre: string;
  correo: string;
  rol: AdminUserRole | string;
  activo: boolean;
  telefono?: string | null;
}

export interface UsersPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsersPage {
  data: AdminUser[];
  meta: UsersPagination;
}

export interface UserListFilters {
  buscar?: string;
  rol?: AdminUserRole | "";
  estado?: UserStatusFilter | "";
  page?: number;
}

export interface CreateUserPayload {
  numero_cuenta: string;
  nombre: string;
  rol: AdminUserRole;
  nip: string;
  correo: string;
}

export interface CreateUserResponse {
  message: string;
  user: AdminUser;
}
