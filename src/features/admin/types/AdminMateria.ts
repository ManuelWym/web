export interface AdminMateria {
  id: number;
  semestre_id: number;
  clave: string;
  nombre: string;
  activa: boolean;
}

export interface AdminSemestre {
  id: number;
  numero: number;
  nombre: string;
  materias: AdminMateria[];
}

export interface MateriaPayload {
  semestre_id: number;
  clave: string;
  nombre: string;
}

export interface MateriaResponse {
  message: string;
  materia: AdminMateria;
}
