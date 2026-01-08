export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
}
