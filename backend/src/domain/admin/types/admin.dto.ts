// Use it to type the incoming data
import { AdminStatus } from "./admin.type";
import { Role } from '@shared/types';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateAdminDto {
  email?: string;
  password?: string;

  userId: string;
  firstName: string;
  lastName: string;
  phone: string,
  roles: Role[];
  address?: Partial<Address>;
  department?: string;
}

export interface UpdateAdminDto extends Partial<CreateAdminDto> {
  status?: AdminStatus;
  lastActiveAt?: Date;
}