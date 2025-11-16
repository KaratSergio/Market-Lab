// Use only within the domain, internal typing..
import { Entity } from '@shared/interfaces/entity.interface';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomerModel extends Entity {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone?: string;
  address?: CustomerAddress;
}