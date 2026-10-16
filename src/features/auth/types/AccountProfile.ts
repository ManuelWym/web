import type { AccountRole } from "./User";

export type AccountDashboardRole = "estudiante" | "administrador";

export interface AccountProfile {
  id: string;
  name: string;
  accountNumber: string;
  email: string;
  phone: string;
  role: AccountRole | "No disponible";
  isActive: boolean | null;
}
