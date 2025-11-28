// Use only within the domain, internal typing..
import { Entity } from '@shared/interfaces/entity.interface';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export interface UserModel extends Entity {
  email: string;
  passwordHash: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}