// Use only within the domain, internal typing..
import { Entity } from '@shared/types';

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type CustomerStatus = typeof CUSTOMER_STATUS[keyof typeof CUSTOMER_STATUS];
export const CUSTOMER_STATUS_VALUES = Object.values(CUSTOMER_STATUS);

export type CustomerRole = 'customer' | 'supplier';
export const CUSTOMER_ROLE_VALUES = ['customer', 'supplier'] as const;

export interface CustomerModel extends Entity {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: Date | null;
  status: CustomerStatus;
}

