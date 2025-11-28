// Use only within the domain, internal typing..
import { Entity } from '@shared/interfaces/entity.interface';

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type AdminStatus = typeof ADMIN_STATUS[keyof typeof ADMIN_STATUS];

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
}

export interface AdminModel extends Entity {
  userId: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermissions;
  department?: string;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// System Stats
export interface AdminDistribution {
  [ADMIN_ROLES.SUPER_ADMIN]: number;
  [ADMIN_ROLES.ADMIN]: number;
  [ADMIN_ROLES.MODERATOR]: number;
  [ADMIN_ROLES.SUPPORT]: number;
}

export interface SystemStats {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  adminDistribution: AdminDistribution;
  recentActivity: AdminModel[];
}

// Response types
export interface AdminResponse {
  admin: AdminModel;
  user: {
    id: string;
    email: string;
    roles: string[];
    status: string;
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}