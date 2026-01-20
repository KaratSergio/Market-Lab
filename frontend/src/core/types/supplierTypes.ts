import { AddressFormData } from '@/core/schemas';

export const SUPPLIER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export type SupplierStatus = typeof SUPPLIER_STATUS[keyof typeof SUPPLIER_STATUS];

export interface Address {
  id: string;
  country: string;
  city: string;
  street: string;
  building?: string;
  postalCode?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isPrimary: boolean;
  fullAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  userId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  phone: string;
  email?: string;
  description?: string;
  documents: string[];
  status: SupplierStatus;

  // Address information
  primaryAddress: Address;
  addresses: Address[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  companyName: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  address: AddressFormData;
  phone: string;
  email: string;
  description?: string;
}

export interface UpdateSupplierDto extends Partial<Omit<CreateSupplierDto, 'address'>> {
  address?: Partial<AddressFormData>;
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

export interface SupplierStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  rating: number;
}

export interface SupplierProfile {
  supplier: Supplier;
  stats?: SupplierStats;
}

export interface SuppliersResponse {
  suppliers: Supplier[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupplierSearchParams {
  query?: string;
  status?: SupplierStatus;
  page?: number;
  limit?: number;
  sortBy?: 'companyName' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}