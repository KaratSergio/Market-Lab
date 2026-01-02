// Use it to type the incoming data
import { SupplierStatus } from './supplier.type';
import { Address } from '@shared/types';

export interface CreateSupplierDto {
  userId: string;
  companyName: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  description: string;
  address: Address;
  email: string;
  phone: string;
  documents: string[];
}

export interface UpdateSupplierDto extends Partial<Omit<CreateSupplierDto, 'userId'>> {
  status?: SupplierStatus;
}