export interface User {
  id: number;
  numero_cuenta: string;
  nombre: string;
  correo: string;
  nip_hash: string;
  rol: "administrador" | "docente" | "alumno" | string;
  telefono: string;
  activo: boolean;
}
