// Use only within the domain, internal typing..
import { Entity, Address } from '@shared/types';

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type CustomerStatus = typeof CUSTOMER_STATUS[keyof typeof CUSTOMER_STATUS];

export type CustomerRole = 'customer' | 'supplier';

export interface CustomerModel extends Entity {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: Date | null;
  status: CustomerStatus;
  address?: Address;
}

