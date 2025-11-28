export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
}

export interface Admin {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: AdminRole;
  department?: string;
  permissions: AdminPermissions;
  status: 'active' | 'inactive' | 'suspended';
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: AdminRole;
  department?: string;
  permissions?: Partial<AdminPermissions>;
}

export interface AdminResponse {
  admin: Admin;
  user: {
    id: string;
    email: string;
    roles: string[];
    status: string;
    emailVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}