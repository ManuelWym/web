export type AccountRole = "alumno" | "docente" | "administrador";

export interface User {
  id: number;
  numero_cuenta: string;
  nombre: string;
  correo: string;
  nip_hash: string;
  rol: AccountRole;
  telefono: string;
  activo: boolean;
}
