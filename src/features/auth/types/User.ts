export type UserRole = "alumno" | "docente" | "admin";

export interface User {
  id: number;
  numero_cuenta: string;
  nombre: string;
  correo: string;
  nip_hash: string;
  rol: UserRole;
  telefono: string;
  activo: boolean;
}
