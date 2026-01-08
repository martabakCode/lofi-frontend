export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  roles: Role[];
  roleNames?: string[]; // Helper for display
  status?: 'Active' | 'Inactive';
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
