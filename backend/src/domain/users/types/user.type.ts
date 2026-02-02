import { Entity } from '@shared/types/entity.interface';
import { Role } from '@shared/types';

export const USER_ROLES = {
  CUSTOMER: Role.CUSTOMER,
  SUPPLIER: Role.SUPPLIER,
  ADMIN: Role.ADMIN,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export const USER_STATUS_VALUES = Object.values(USER_STATUS)

export interface UserModel extends Entity {
  email: string;
  passwordHash: string | null;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  regComplete: boolean;
  lastLoginAt?: Date;
}