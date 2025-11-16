// Use it to type the incoming data
import { CustomerAddress } from "./customer.type";

export interface CreateCustomerDto {
  email: string;
  firstName: string;
  lastName: string;

  phone?: string;
  address?: CustomerAddress;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  isActive: boolean;
}