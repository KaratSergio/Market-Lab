// Use only within the domain, internal typing..
import { Entity } from '@shared/types/entity.interface';

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type CustomerStatus = typeof CUSTOMER_STATUS[keyof typeof CUSTOMER_STATUS];

export type CustomerRole = 'customer' | 'supplier';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerModel extends Entity {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: Date | null;
  status: CustomerStatus;
  address?: CustomerAddress;
}

