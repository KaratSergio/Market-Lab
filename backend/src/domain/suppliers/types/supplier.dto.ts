// Use it to type the incoming data
import { SupplierStatus, SupplierModel } from './supplier.type';
import { AddressResponseDto } from '@domain/addresses/types/address.dto';

// incoming DTO
export interface CreateSupplierDto {
  userId: string;
  companyName: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  description: string;
  phone: string;
  documents: string[];
  address?: {
    country: string;
    city: string;
    street: string;
    building: string;
    postalCode?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
}

export interface UpdateSupplierDto extends Partial<Omit<CreateSupplierDto, 'userId'>> {
  status?: SupplierStatus;
}

// Outgoing DTO for a profile with email
export type SupplierProfileDto = SupplierModel & {
  email: string;
  primaryAddress?: AddressResponseDto | null;
  addresses: AddressResponseDto[];
};

export type SupplierPublicDto = {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  status: string;
  address?: {
    country: string;
    city: string;
    fullAddress: string;
  };
};