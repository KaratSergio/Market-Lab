export class CreateAddressDto {
  entityId: string;
  entityType: 'supplier' | 'customer';
  country: string;
  city: string;
  street: string;
  building: string;
  postalCode?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export class UpdateAddressDto {
  postalCode?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export interface AddressResponseDto {
  id: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postalCode?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isPrimary: boolean;
  fullAddress: string;
  createdAt: Date;
  updatedAt: Date;
}