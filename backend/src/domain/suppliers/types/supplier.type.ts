// Use only within the domain, internal typing..
import { Entity } from '@shared/types';
import { WithTranslations } from '@domain/translations/types';

export enum SupplierStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export const SUPPLIER_STATUS = SupplierStatus;
export type SupplierStatusType = SupplierStatus;

export interface AccessibleSupplier {
  id: string;
  userId: string;
  status: SupplierStatus;
  isActive(): boolean;
}

export interface SupplierModel extends Entity, WithTranslations<'supplier'> {
  userId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  phone: string;
  documents: string[];
  status: SupplierStatus;
  description?: string;
}