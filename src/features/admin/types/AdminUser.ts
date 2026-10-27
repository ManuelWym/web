import type { UserRole } from "@/features/auth/types/User";

export type AdminUserRole = UserRole;
export type UserStatusFilter = "activo" | "inactivo";

export interface AdminUser {
  id: number;
  numero_cuenta: string;
  nombre: string;
  correo: string;
  rol: AdminUserRole;
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

export type UpdateUserPayload = Pick<
  AdminUser,
  "nombre" | "correo" | "rol"
>;

export interface UpdateUserResponse {
  message: string;
  user: AdminUser;
}

export interface UpdateUserStatusPayload {
  activo: boolean;
}

export interface UpdateUserStatusResponse {
  message: string;
  user: AdminUser;
}

export interface ResetUserNipPayload {
  nip: string;
}
