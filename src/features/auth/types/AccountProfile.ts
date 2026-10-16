export type AccountRole = "estudiante" | "administrador";

export interface AccountProfile {
  id: string;
  name: string;
  accountNumber: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean | null;
}
