// Use only within the domain, internal typing..
import { Entity } from '@shared/types/entity.interface';
import { Address } from '@shared/types';

export const SUPPLIER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export type SupplierStatus = typeof SUPPLIER_STATUS[keyof typeof SUPPLIER_STATUS];

export interface SupplierModel extends Entity {
  userId: string;
  companyName: string;
  registrationNumber: string;
  address: Address;
  email: string;
  phone: string;
  documents: string[];
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}