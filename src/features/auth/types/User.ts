export interface User {
  id: number;
  nombre: string;
  numero_cuenta: string;
  rol: "administrador" | "docente" | "alumno" | string;
}