import { Address } from './commonTypes';

export const SUPPLIER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export type SupplierStatus = typeof SUPPLIER_STATUS[keyof typeof SUPPLIER_STATUS];

export interface Supplier {
  id: string;
  userId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  address: Address;
  primaryAddress: Address;
  phone: string;
  documents: string[];
  status: SupplierStatus;
  email?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  companyName: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  address: Address;
  phone: string;
  email: string;
  description?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  status?: SupplierStatus;
}

export interface SupplierDocument {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface SupplierProfile {
  supplier: Supplier;
  stats: {
    totalProducts: number;
    activeOrders: number;
    totalRevenue: number;
    rating: number;
  };
}

export interface SuppliersResponse {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierSearchParams {
  query?: string;
  status?: SupplierStatus;
  page?: number;
  limit?: number;
  sortBy?: 'companyName' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}