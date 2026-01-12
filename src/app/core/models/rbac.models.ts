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
  phone?: string;
  avatar?: string;
  roles: Role[];
  branch?: Branch;
  roleNames?: string[]; // Helper for display
  status?: 'Active' | 'Inactive';
}

export interface AuthResponse {
  token: string;
  email: string;
  roles: string[];
}

export const PERMISSIONS = {
  DELETE_BRANCH: 'DELETE_BRANCH',
  DELETE_PERMISSION: 'DELETE_PERMISSION',
  DELETE_ROLE: 'DELETE_ROLE',
  DELETE_USER: 'DELETE_USER',
  READ_BRANCH: 'READ_BRANCH',
  READ_PERMISSION: 'READ_PERMISSION',
  READ_ROLE: 'READ_ROLE',
  READ_USER: 'READ_USER',
  WRITE_BRANCH: 'WRITE_BRANCH',
  WRITE_PERMISSION: 'WRITE_PERMISSION',
  WRITE_ROLE: 'WRITE_ROLE',
  WRITE_USER: 'WRITE_USER'
} as const;

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  CUSTOMER: 'ROLE_CUSTOMER',
  MARKETING: 'ROLE_MARKETING',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  BACKOFFICE: 'BACKOFFICE'
};

