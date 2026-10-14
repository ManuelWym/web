import type { User } from "./userInterface";

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_at: string;
  user: User;
}