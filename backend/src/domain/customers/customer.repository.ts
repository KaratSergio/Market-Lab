import { BaseRepository } from '@shared/interfaces/repository.interface';
import { Customer } from './customer.entity';

export abstract class CustomerRepository implements BaseRepository<Customer> {
  abstract findAll(): Promise<Customer[]>;
  abstract findById(id: string): Promise<Customer | null>;
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract create(customer: Customer): Promise<Customer>;
  abstract update(id: string, customer: Customer): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
}