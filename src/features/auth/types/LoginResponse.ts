import type { User } from "./User";

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_at: string;
  user: User;
}