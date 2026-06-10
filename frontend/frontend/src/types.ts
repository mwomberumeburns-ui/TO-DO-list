export type AuthMode = "login" | "register";

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface ApiErrorResponse {
  detail?: string;
}
