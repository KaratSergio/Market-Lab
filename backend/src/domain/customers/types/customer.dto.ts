// Use it to type the incoming data
import { CustomerStatus } from "./customer.type";
import { Address } from "@shared/types";

export interface CreateCustomerDto {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string | null;
  address?: Address;
}

export interface UpdateCustomerDto extends Partial<Omit<CreateCustomerDto, 'userId'>> {
  status?: CustomerStatus;
}