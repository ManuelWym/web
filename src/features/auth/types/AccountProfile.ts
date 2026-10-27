import type { UserRole } from "./User";

export type AccountDashboardRole = "alumno" | "admin";

export interface AccountProfile {
  id: string;
  name: string;
  accountNumber: string;
  email: string;
  phone: string;
  role: UserRole | "No disponible";
  isActive: boolean | null;
}
