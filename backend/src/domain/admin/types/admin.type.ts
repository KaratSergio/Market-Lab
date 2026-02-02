import { Entity } from '@shared/types/entity.interface';
import { Role } from '@shared/types';

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type AdminStatus = typeof ADMIN_STATUS[keyof typeof ADMIN_STATUS];
export const ADMIN_STATUS_VALUES = Object.values(ADMIN_STATUS);

export interface AdminModel extends Entity {
  userId: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  status: AdminStatus;
  department?: string;
  lastActiveAt?: Date;
}

// System Stats
export interface AdminDistribution {
  [Role.SUPER_ADMIN]: number;
  [Role.ADMIN]: number;
  [Role.MODERATOR]: number;
  [Role.SUPPLIER]: number;
  [Role.CUSTOMER]: number;
  [Role.GUEST]: number;
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

export interface GetAdminsListOptions {
  page: number;
  limit: number;
  role?: string;
}